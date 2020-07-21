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

  fetchMessages: async (conversationId, userId) => {
    const entry = await strapi
      .query('messages', 'support-chat')
      .findOne({ user: userId, conversation: conversationId });

    return entry;
  },

  saveMessage: async (data) => {
    let { conversation, fromSupport, text, subject, policyId, user } = data;

    if (!conversation) {
      const convData = { subject, policyId, user };
      conversation = await strapi.query('conversations', 'support-chat').create(convData);
    }

    const messageData = { text, user, conversation, fromSupport };

    const message = await strapi.query('messages', 'support-chat').create(messageData);
    return message;
  },
};
