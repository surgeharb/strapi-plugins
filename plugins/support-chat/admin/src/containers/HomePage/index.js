/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect, useRef } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

import {
  request,
  PluginHeader,
} from "strapi-helper-plugin";

import Row from "../../components/Row";
import Block from "../../components/Block";
import Messages from "../../components/Messages";

import { LoadingBar } from '@buffetjs/styles';
import { InputText, Table, Button } from "@buffetjs/core";

const headers = [
  {
    name: 'User',
    value: 'username',
  },
  {
    name: 'Subject',
    value: 'subject',
  },
];

const HomePage = () => {
  const chatBox = useRef(null);

  const [val, setValue] = useState('');
  const [message, setMessage] = useState('');

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messagesLoading, setMessageLoading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  const onSendMessage = async () => {
    const body = { message };
    const url = `/support-chat/conversations/${currentChat.id}/messages/send`;

    await request(url, { method: 'POST', body });

    setMessages(msgs => [...msgs, { id: Math.random(), text: message, fromSupport: true }]);
    setMessage('');
  };

  const onClickRow = (e, data) => {
    setCurrentChat(data);
    setMessageLoading(true);

    request(`/support-chat/conversations/${data.id}/messages`).then(msgs => {
      setMessages(msgs.messages);
      setMessageLoading(false);
    });

    setTimeout(() => {
      const box = chatBox.current;
      box.scrollTop = box.scrollHeight;
    }, 200);
  };

  useEffect(() => {
    request('/support-chat/conversations/all').then(data => {
      setChats(data.conversations.map(conv => ({
        id: conv.id,
        extra: conv.extra,
        subject: conv.subject,
        username: conv.user.username,
      })));
    });
  }, []);

  return (
    <div className={"container-fluid"} style={{ padding: "18px 30px" }}>
      <PluginHeader
        title={"Support Chat"}
        description={"Active Threads"}
      />
      <div className="row">
        <Block>
          <Row>
            <InputText
              name="input"
              onChange={({ target: { value } }) => {
                setValue(value);
              }}
              placeholder="Search"
              type="text"
              value={val}
            />
          </Row>
          <Row>
            <div className="row">
              <div className={"col-4"} style={{ height: 474, overflow: 'auto' }}>
                <Table headers={headers} rows={chats} onClickRow={onClickRow} />
              </div>
              <div className={"col-8"}>
                <div style={{ border: '1px solid #f4f4f4' }}>
                  <div style={{ height: 60, lineHeight: '60px', paddingLeft: 30 }}>
                    {(currentChat) &&
                      `${currentChat.username} - Subject: ${currentChat.subject} - Extra: ${currentChat.extra}`
                    }
                  </div>
                  <div ref={chatBox} style={{ height: 380, paddingBottom: 10, overflow: 'auto', backgroundColor: '#f4f4f4', scrollBehavior: 'smooth' }}>
                    {
                      messages && (
                        <>
                          {
                            messagesLoading
                              ? <LoadingBar style={{ width: '100%' }} />
                              : <Messages data={messages} />
                          }
                        </>
                      )
                    }
                  </div>
                  <div style={{ position: 'relative' }}>
                    <InputText
                      name="input"
                      onKeyDown={handleKeyDown}
                      onChange={({ target: { value } }) => {
                        setMessage(value);
                      }}
                      placeholder="Type something"
                      type="text"
                      value={message}
                      disabled={!currentChat}
                    />
                    <Button
                      onClick={onSendMessage}
                      disabled={!currentChat}
                      style={{ height: 33, position: 'absolute', right: 0, top: 0, zIndex: 2 }}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </Block>
      </div>
    </div>
  );
};

export default memo(HomePage);
