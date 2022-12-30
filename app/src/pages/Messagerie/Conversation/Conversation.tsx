import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { Conversation as ConvType } from "../ListConversation/ListConversation";

import { fetchUser } from "../../../Redux/States/users";

import LoadingButton from "@atlaskit/button/loading-button";
import TextField from "@atlaskit/textfield";

import Form, { Field, FormSection } from "@atlaskit/form";

import styles from "./Conversation.module.scss";
import { HORIZONTAL_GLOBAL_NAV_HEIGHT } from "@atlaskit/atlassian-navigation";
import axios from "axios";
import { Socket } from "socket.io-client";
import Message from "./Message/Message";

interface Props {
  conversation: ConvType | undefined;
  setConversation: React.Dispatch<React.SetStateAction<ConvType | undefined>>;
  socket: Socket | null;
  connectedUsers: {
    userID: string;
    username: number;
  }[];
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const Conversation: React.FC<Props> = ({
  conversation,
  setConversation,
  socket,
  connectedUsers,
}) => {
  const userConnected = useSelector(fetchUser);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    const message = newMessage;
    setNewMessage("");

    if (message && message.length > 0) {
      axios
        .post(url + "/conversations/addMessage", {
          owners: conversation?.owners,
          message: message,
        })
        .then((res) => {
          if (conversation) {
            setConversation({
              ...conversation,
              messages: [
                ...conversation?.messages,
                {
                  owner: userConnected.id,
                  message: message,
                  _id: res.data._id,
                },
              ],
            });
          }

          const friendMessagedId = conversation?.owners.filter(
            (id) => id !== userConnected.id
          )[0];
          const friendWsId = connectedUsers.find(
            (userWs) => userWs.username === friendMessagedId
          );

          socket &&
            friendWsId &&
            socket.emit("private message", {
              message: message,
              _id: res.data._id,
              to: friendWsId.userID,
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div
      className={styles.view}
      style={{ height: `calc(90vh - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)` }}
    >
      {conversation?.messages.map((message) => (
        <Message message={message} />
      ))}

      <Form<{ message: string }>
        onSubmit={() => {
          handleSendMessage();
        }}
      >
        {({ formProps }) => (
          <form {...formProps} className={styles.inputSend}>
            <FormSection>
              <Field aria-required={true} name="message" isRequired>
                {({ fieldProps }) => (
                  <Fragment>
                    <TextField
                      className={styles.input}
                      autoComplete="off"
                      {...fieldProps}
                      onChange={(e) => {
                        setNewMessage((e.target as HTMLInputElement).value);
                      }}
                      value={newMessage}
                    />
                  </Fragment>
                )}
              </Field>
            </FormSection>

            <div>
              <LoadingButton type="submit" appearance="primary">
                Send
              </LoadingButton>
            </div>
          </form>
        )}
      </Form>
    </div>
  );
};

export default Conversation;
