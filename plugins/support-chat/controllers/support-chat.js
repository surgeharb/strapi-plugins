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

    const isSupport = ctx.state.user && ['admin', 'support'].includes(ctx.state.user.role);

    let conversations = [];

    if (isSupport) {
      conversations = await service.fetchAllConversations();
    }

    ctx.send({ conversations });
  },

  getMessages: async (ctx) => {
    const messages = await strapi
      .plugins['support-chat']
      .services['support-chat']
      .fetchMessages(ctx.params.id);

    ctx.send({ messages });
  },

  sendMessage: async (ctx) => {
    const { id: conversation } = ctx.params;
    const { message, policyId, subject } = ctx.request.body;
    const isSupport = ctx.state.user && ctx.state.user.role === 'admin';

    await strapi
      .plugins['support-chat']
      .services['support-chat']
      .saveMessage({
        conversation: { id: conversation },
        fromSupport: isSupport,
        text: message,
        policyId,
        subject,
      });

    ctx.send({ message: 'ok' });
  },
};
