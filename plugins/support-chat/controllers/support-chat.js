'use strict';

/**
 * support-chat.js controller
 *
 * @description: A set of functions called "actions" of the `support-chat` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },

  getConversations: async (ctx) => {
    const service = strapi.plugins['support-chat'].services['support-chat'];

    const isSupport = ctx.state.user && ctx.state.user.role === 'admin';

    let conversations = [];

    if (isSupport) {
      conversations = await service.fetchAllConversations();
    }

    ctx.send({ conversations });
  },

  getMessages: async (ctx) => {
    ctx.send({ message: 'ok' });
  },

  sendMessage: async (ctx) => {
    const { message, policyId, subject, conversation } = ctx.request.body;
    const isSupport = ctx.state.user && ctx.state.user.role === 'admin';

    await strapi.plugins['support-chat'].services['support-chat'].saveMessage({
      user: ctx.state.user.id || 0,
      fromSupport: isSupport,
      text: message,
      conversation,
      policyId,
      subject,
    });

    ctx.send({ message: 'ok' });
  },
};
