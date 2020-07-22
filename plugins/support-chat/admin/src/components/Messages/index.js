import React from 'react';
import { Message } from './components';

const Messages = ({ data }) => (
  data.map(message => (
    <div key={message.id} style={message.fromSupport ? { textAlign: 'right' } : {}}>
      <Message>{message.text}</Message>
    </div>
  ))
);

export default Messages;
