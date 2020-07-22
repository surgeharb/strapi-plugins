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

  sendSupportMessage: async (ctx) => {
    const { id: conversation } = ctx.params;
    const { message, extra, subject } = ctx.request.body;

    await strapi
      .plugins['support-chat']
      .services['support-chat']
      .saveMessage({
        conversation: { id: conversation },
        fromSupport: true,
        text: message,
        subject,
        extra,
      });

    ctx.send({ message: 'ok' });
  },

  sendMessage: async (ctx) => {
    const { id: conversation } = ctx.params;
    const { message, extra, subject } = ctx.request.body;

    await strapi
      .plugins['support-chat']
      .services['support-chat']
      .saveMessage({
        conversation: { id: conversation },
        text: message,
        subject,
        extra,
      });

    ctx.send({ message: 'ok' });
  },
};
