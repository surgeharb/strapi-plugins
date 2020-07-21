import React from 'react';

const Messages = ({ data }) => (
  data.map(message => (
    <div key={message.id}>
      {message.text}
    </div>
  ))
);

export default Messages;
