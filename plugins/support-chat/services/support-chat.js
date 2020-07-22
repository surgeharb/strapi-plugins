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
    let { conversationId, fromSupport, text, subject, policyId, userId } = data;

    let conversation = await strapi
      .query('conversations', 'support-chat')
      .findOne({ id: conversationId });

    if (fromSupport && !conversation) {
      return '';
    }

    if (!conversation) {
      conversation = await strapi
        .query('conversations', 'support-chat')
        .create({ subject, policyId, user: userId });
    }

    let dbUser = await strapi
      .query('user', 'users-permissions')
      .findOne({ id: userId });

    if (!dbUser) {
      const username = `chat-user-${Math.round(Math.random() * 1000)}`;
      const email = `${username}@strapi.io`;

      dbUser = await strapi
        .query('user', 'users-permissions')
        .create({ id: userId, username, email });
    }

    return strapi
      .query('messages', 'support-chat')
      .create({ text, conversation: conversation.id, fromSupport, user: dbUser.id });
  },
};
