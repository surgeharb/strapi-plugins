/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from 'react';
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

    setMessages(msgs => [...msgs, { id: Math.random(), text: message }]);
    setMessage('');
  };

  const onClickRow = (e, data) => {
    setCurrentChat(data);
    setMessageLoading(true);

    setTimeout(() => {
      setMessages([
        { id: 1, text: 'hello' },
        { id: 2, text: 'hello' },
        { id: 3, text: 'hello' },
        { id: 4, text: 'hello' },
      ]);

      setMessageLoading(false);
    }, 500);
  };

  useEffect(() => {
    request('/support-chat/conversations').then(data => {
      setChats(data.conversations);
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
                <div style={{ background: '#f0f0f0' }}>
                  <div style={{ height: 60 }}>
                    {(currentChat && currentChat.firstname) &&
                      `${currentChat.firstname} ${currentChat.lastname}`
                    }
                  </div>
                  <div style={{ height: 380 }}>
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
