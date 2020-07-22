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

  getAllConversations: async (ctx) => {
    const conversations = await strapi
      .plugins['support-chat']
      .services['support-chat']
      .fetchAllConversations();

    ctx.send({ conversations });
  },

  getConversations: async (ctx) => {
    const conversations = await strapi
      .plugins['support-chat']
      .services['support-chat']
      .fetchConversations(ctx.state.user.id)

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
