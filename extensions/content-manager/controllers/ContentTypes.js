'use strict';

const _ = require('lodash');

// -- import from plugin --
const {
  validateKind,
  createModelConfigurationSchema,
} = require('strapi-plugin-content-manager/controllers/validation');
// -- --- --

module.exports = {
  /**
   * Returns the list of available content types
   */
  async listContentTypes(ctx) {
    const { kind } = ctx.query;

    try {
      await validateKind(kind);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    const service = strapi.plugins['content-manager'].services.contenttypes;

    // -- fetch admin allowed content
    const adminRole = ctx.state.user.role || 'admin';
    let allowedContent = adminRole !== 'admin'
      ? await strapi.query('admin-access').find({ role: adminRole })
      : [];

    allowedContent = ((allowedContent[0] || {}).plugins || []).map(p => p.uid);
    // -- --- --
      
    const contentTypes = Object.keys(strapi.contentTypes)
      .filter(uid => {
        if (uid.startsWith('strapi::')) return false;

        // -- hide fixed admin-access content type
        if (uid === 'application::admin-access.admin-access') return false;
        // -- --- --

        if (kind && _.get(strapi.contentTypes[uid], 'kind', 'collectionType') !== kind) {
          return false;
        }

        // -- add content type condition on showing plugins
        if (adminRole !== 'admin' && !allowedContent.includes(uid)) {
          return false;
        }
        // -- --- --

        return true;
      })
      .map(uid => {
        return service.formatContentType(strapi.contentTypes[uid]);
      });

    ctx.body = {
      data: contentTypes,
    };
  },

  /**
   * Returns a content type configuration.
   * It includes
   *  - schema
   *  - content-manager layouts (list,edit)
   *  - content-manager settings
   *  - content-manager metadata (placeholders, description, label...)
   */
  async findContentType(ctx) {
    const { uid } = ctx.params;

    // -- fetch admin allowed content
    const adminRole = ctx.state.user.role || 'admin';
    let allowedContent = adminRole !== 'admin'
      ? await strapi.query('admin-access').find({ role: adminRole })
      : [];

    allowedContent = ((allowedContent[0] || {}).plugins || []).map(p => p.uid);
    // -- --- --

    const contentType = strapi.contentTypes[uid];

    if (!contentType) {
      return ctx.notFound('contentType.notFound');
    }

    // -- hide fixed admin-access content type
    if (uid === 'application::admin-access.admin-access') return ctx.notFound('contentType.notFound');
        // -- --- --

    // -- add content type condition on showing plugins
    if (adminRole !== 'admin' && !allowedContent.includes(uid)) {
      return ctx.notFound('contentType.notFound');
    }
    // -- --- --

    const service = strapi.plugins['content-manager'].services.contenttypes;
    const componentService = strapi.plugins['content-manager'].services.components;

    const contentTypeConfigurations = await service.getConfiguration(uid);

    const data = {
      contentType: {
        uid,
        apiID: contentType.modelName,
        schema: service.formatContentTypeSchema(contentType),
        ...contentTypeConfigurations,
      },
      components: await componentService.getComponentsSchemas(contentType),
    };

    ctx.body = { data };
  },

  /**
   * Updates a content type configuration
   * You can only update the content-manager settings: (use the content-type-builder to update attributes)
   *  - content-manager layouts (list,edit)
   *  - content-manager settings
   *  - content-manager metadata (placeholders, description, label...)
   */
  async updateContentType(ctx) {
    const { uid } = ctx.params;
    const { body } = ctx.request;

    // try to find the model
    const contentType = strapi.contentTypes[uid];

    if (!contentType) {
      return ctx.notFound('contentType.notFound');
    }

    const service = strapi.plugins['content-manager'].services.contenttypes;

    const schema = service.formatContentTypeSchema(contentType);

    let input;
    try {
      input = await createModelConfigurationSchema(contentType, schema).validate(body, {
        abortEarly: false,
        stripUnknown: true,
        strict: true,
      });
    } catch (error) {
      return ctx.badRequest(null, {
        name: 'validationError',
        errors: error.errors,
      });
    }

    await service.setConfiguration(uid, input);
    const contentTypeConfigurations = await service.getConfiguration(uid);
    const data = {
      uid,
      schema,
      ...contentTypeConfigurations,
    };

    ctx.body = { data };
  },
};
