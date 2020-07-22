'use strict';

/**
 * support-chat.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {
  fetchAllConversations: async (userId) => {
    const entry = await strapi
      .query('conversations', 'support-chat')
      .find();

    return entry;
  },

  fetchConversations: async (userId) => {
    const entry = await strapi
      .query('conversations', 'support-chat')
      .find({ user: userId });

    return entry;
  },

  fetchMessages: async (conversationId) => {
    const entry = await strapi
      .query('messages', 'support-chat')
      .find({ conversation: conversationId });

    return entry;
  },

  saveMessage: async (data) => {
    let {
      fromSupport = false,
      conversationId,
      extra = '',
      subject,
      userId,
      text,
    } = data;

    let [conversation, dbUser] = await Promise.all([
      strapi.query('conversations', 'support-chat').findOne({ id: conversationId }),
      strapi.query('user', 'users-permissions').findOne({ id: userId }),
    ]);

    if ((fromSupport && !conversation) || !dbUser) {
      return '';
    }

    if (!conversation) {
      conversation = await strapi
        .query('conversations', 'support-chat')
        .create({ subject, extra, user: userId });
    }

    return strapi
      .query('messages', 'support-chat')
      .create({ text, conversation: conversation.id, fromSupport, user: dbUser.id });
  },
};
