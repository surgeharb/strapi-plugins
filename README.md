# 🚀 Cool Strapi Plugins

## Getting Started

First clone the project by running:

```bash
git clone https://github.com/surgeharb/strapi-plugins.git
```

## Installation

Once the project is cloned locally, navigate to the main directory:

```bash
cd strapi-plugins
```

Make sure that yarn is installed on your machine and run:

```bash
yarn install
```

To start the project in development mode:

```bash
yarn develop
```

If you want to tinker with plugins and watch changes without rebuilding the project multiple times:

```bash
yarn develop --watch-admin
```

Finally, for production make sure to:

```bash
# build the project -- production
NODE_ENV=production yarn build

# start Strapi -- production
NODE_ENV=production yarn start
```

## Plugin: Admin Access Rights
*Keep in mind that this is a temporary solution as the core team of Strapi is in the latest stages of achieving this the good way in the system. <br>
I made use of the built in Strapi "admin customization" feature.*

This feature is available directly when you login as an admin user > **Access Rights** under **Plugins** in the **Left Panel**.

### Make it possible in your own Strapi Project!

First, you will have 3 default roles **admin**, **author**, **editor** as a start.

#### Step 1 - Modify admin database model
Add these roles to the `Administrator` database model.

From this repo, copy the admin extension into your project's extensions:
```bash
cp -R ./extensions/admin ~/your-project/extensions
```

You can notice a script to override `Administrator` model.
To apply it on every run, edit your package.json scripts as follow:

```json
{
  "scripts": {
    "admin-override": "node ./extensions/admin/override-script.js",
    "develop": "npm run admin-override && strapi develop",
    "start": "npm run admin-override && strapi start",
    "build": "npm run admin-override && strapi build",
    "strapi": "strapi"
  },
}
```

#### Step 2 - Override admin CRUD controllers

Strapi administrator controllers restrict us from adding a new field while creating/updating admins.

For this I wrote a hook that overrides the controller behavior into letting us add new role on create/update admin.

```bash
# if you don't have hooks folder
mkdir ~/your-project/hooks

# copy admin-roles custom hook
cp -R ./hooks/admin-roles ~/your-project/hooks

# enable the hook on Strapi startup
cp ./config/hook.js ~/your-project/config
```

Kill the process, and restart Strapi instance, then navigate to `Manage administrators` in the top right menu, and create a new administrator.

Now give new admin a role from the new dropdown that we injected in the model.

***P.S. Make sure to keep at least 1 admin role on an administrator!!!***

#### Step 3 - Create admin-access model and components

To manage roles access, create a database model linking **plugin uid** with the administrator role.

```bash
# copy new API models and controllers
cp -R ./api/admin-access ~/your-project/api

# prepare components general folder
mkdir -p ~/your-project/components/general

# copy custom plugin components used by the API
cp ./components/general/plugin-access.json ~/your-project/components/general
```

#### Step 4 - Restrict access for roles

Restrict plugin API fetching backend-side
```bash
# copy modified content-manager plugin controller
cp -R ./extensions/content-manager ~/your-project/extensions
```

Remove frontend elements according to provided Roles `Manage administrators button` and `Left Panel Plugins`

```bash
# copy admin frontend modification in the root of your project
cp -R ./admin ~/your-project
```

#### Step 5 - Add "access rights" plugin
```bash
# create plugins folder if not exists
mkdir ~/your-project/plugins

# add the newly crafter plugin for access rights
cp -R ./plugins/access-rights ~/your-project/plugins
```

#### Optional Step - Add more roles
Add roles in enum array inside `extensions/admin/models/Administrator.settings.json` <br> Don't remove first role - admin, it is necessary for the plugin to work properly!

Apply same additions also inside `plugins/access-rights/admin/src/containers/HomePage/index.js`
```js
// modify this array - do not include first role 'admin'
const [roles, setRoles] = useState(['author', 'editor']);
```

Voilà! Now kill the process, `yarn build` and restart Strapi.
Login using your main admin user and manage other administrators access.

<br>

---

Do not hesitate to open issues if you encounter any, submit a pull request to improve any bit of the code, or contact me [me@sergeharb.com](mailto:me@sergeharb.com)
