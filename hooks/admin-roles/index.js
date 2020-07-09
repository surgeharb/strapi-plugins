'use-strict';

module.exports = strapi => {
  const hook = {
    /**
     * Default options
     */

    defaults: {
      // config object
    },

    /**
     * Initialize the hook
     */

    async initialize() {
      strapi.admin.controllers.admin.create = async function create(ctx) {
        const { email, username, password, blocked } = ctx.request.body;

        // -- add this role fetch --
        const { role = 'admin' } = ctx.request.body;
        // -- --- --

        if (!email) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'missing.email',
              message: 'Missing email',
              field: ['email'],
            })
          );
        }

        if (!username) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'missing.username',
              message: 'Missing username',
              field: ['username'],
            })
          );
        }

        if (!password) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'missing.password',
              message: 'Missing password',
              field: ['password'],
            })
          );
        }

        const adminsWithSameEmail = await strapi.query('administrator', 'admin').findOne({ email });

        const adminsWithSameUsername = await strapi
          .query('administrator', 'admin')
          .findOne({ username });

        if (adminsWithSameEmail) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.email.taken',
              message: 'Email already taken',
              field: ['email'],
            })
          );
        }

        if (adminsWithSameUsername) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.username.taken',
              message: 'Username already taken',
              field: ['username'],
            })
          );
        }

        const user = {
          email: email,
          username: username,
          blocked: blocked === true ? true : false,
          password: await strapi.admin.services.auth.hashPassword(password),
        };

        // -- add this role update --
        if (role) { user.role = role; }
        // -- --- --

        const data = await strapi.query('administrator', 'admin').create(user);

        // Send 201 `created`
        ctx.created(strapi.admin.services.auth.sanitizeUser(data));
      };

      strapi.admin.controllers.admin.update = async function update(ctx) {
        const { id } = ctx.params;
        const { email, username, password, blocked } = ctx.request.body;

        // -- add this role fetch --
        const { role = 'admin' } = ctx.request.body;
        // -- --- --

        if (!email) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'missing.email',
              message: 'Missing email',
              field: ['email'],
            })
          );
        }

        if (!username) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'missing.username',
              message: 'Missing username',
              field: ['username'],
            })
          );
        }

        const admin = await strapi.query('administrator', 'admin').findOne({ id });

        // check the user exists
        if (!admin) return ctx.notFound('Administrator not found');

        // check there are not user with requested email
        if (email !== admin.email) {
          const adminsWithSameEmail = await strapi.query('administrator', 'admin').findOne({ email });

          if (adminsWithSameEmail && adminsWithSameEmail.id !== admin.id) {
            return ctx.badRequest(
              null,
              formatError({
                id: 'Auth.form.error.email.taken',
                message: 'Email already taken',
                field: ['email'],
              })
            );
          }
        }

        // check there are not user with requested username
        if (username !== admin.username) {
          const adminsWithSameUsername = await strapi
            .query('administrator', 'admin')
            .findOne({ username });

          if (adminsWithSameUsername && adminsWithSameUsername.id !== admin.id) {
            return ctx.badRequest(
              null,
              formatError({
                id: 'Auth.form.error.username.taken',
                message: 'Username already taken',
                field: ['username'],
              })
            );
          }
        }

        const user = {
          email: email,
          username: username,
          blocked: blocked === true ? true : false,
        };

        if (password && password !== admin.password) {
          user.password = await strapi.admin.services.auth.hashPassword(password);
        }

        // -- add this role update for non-root admin --
        if (role) { user.role = role; }
        // -- --- --

        const data = await strapi.query('administrator', 'admin').update({ id }, user);

        // Send 200 `ok`
        ctx.send(data);
      };
    }
  };

  return hook;
};
