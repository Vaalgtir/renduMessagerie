import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";

import { useSelector } from "react-redux";
import { fetchUser } from "../../../Redux/States/users";

import styles from "./ListConversation.module.scss";

import { HORIZONTAL_GLOBAL_NAV_HEIGHT } from "@atlaskit/atlassian-navigation";
import PageHeader from "@atlaskit/page-header";
import Button from "@atlaskit/button";
import Modal, {
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import type { ValueType } from "@atlaskit/select/types";
import Select from "@atlaskit/select";
import Form, { Field } from "@atlaskit/form";

import { User } from "../Messagerie";

interface Props {
  users: User[];
  friends: User[];
  setConversation: React.Dispatch<
    React.SetStateAction<Conversation | undefined>
  >;
  conversation: Conversation | undefined;
}

export interface Conversation {
  _id: string;
  owners: number[];
  messages: {
    owner: number;
    message: string;
    _id: string;
  }[];
}

interface Option {
  label: string;
  value: string;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const ListConversation: React.FC<Props> = ({
  users,
  friends,
  setConversation,
  conversation,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isModalConvOpen, setIsModalConvOpen] = useState<boolean>(false);

  const userConnected = useSelector(fetchUser);

  useEffect(() => {
    if (userConnected.isValidated && !userConnected.isBannished) {
      axios.post(url + "/conversations/fetchAll").then((res) => {
        setConversations(res.data);
        setConversation(res.data[0]);
      });
    }
  }, [userConnected, setConversation]);

  const createConv = (friendId: string) => {
    axios
      .post(url + "/conversations/create", { friendId: parseInt(friendId) })
      .then(() => {
        setIsModalConvOpen(false);
      });
  };

  return (
    <div className={styles.containerView}>
      <div
        className={styles.view}
        style={{ minHeight: `calc(100vh - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)` }}
      >
        <div className={styles.header}>
          <PageHeader>Conversations</PageHeader>
        </div>
        <Button
          appearance="primary"
          onClick={() => {
            setIsModalConvOpen(true);
          }}
          className={styles.newConv}
        >
          Nouvelle conversation
        </Button>
        <div className={styles.convContainer}>
          {conversations.map((conversationDetail) => {
            const friendMessagedId = conversationDetail.owners.find(
              (ownerId) => ownerId !== userConnected.id
            );
            const friendMessaged = users.find(
              (friend) => parseInt(friend.id) === friendMessagedId
            );

            return (
              <Button
                appearance="subtle"
                isSelected={conversation?._id === conversationDetail?._id}
                onClick={() => {
                  setConversation(conversationDetail);
                }}
                className={styles.conversationDetail}
              >
                {friendMessaged?.nom} {friendMessaged?.prenom}
              </Button>
            );
          })}
        </div>
      </div>

      <ModalTransition>
        {isModalConvOpen && (
          <Modal
            onClose={() => {
              setIsModalConvOpen(false);
            }}
          >
            <Form
              onSubmit={(data: { friend: { value: string } }) => {
                createConv(data.friend.value);
              }}
            >
              {({ formProps, ...rest }) => (
                <form id="form-with-id" {...formProps}>
                  <ModalHeader>
                    <ModalTitle>Modal dialog with form</ModalTitle>
                  </ModalHeader>

                  <div
                    style={{
                      margin: "0 2vw",
                    }}
                  >
                    <p>
                      Enter some text then submit the form to see the response.
                    </p>

                    <Field<ValueType<Option>>
                      name="friend"
                      label="Choisissez un ami"
                    >
                      {({ fieldProps: { id, ...rest } }) => (
                        <Fragment>
                          <Select
                            {...rest}
                            inputId={id}
                            options={friends.map((friend) => ({
                              label: `${friend.nom} ${friend.prenom}`,
                              value: JSON.stringify(friend.id),
                            }))}
                            isClearable
                          />
                        </Fragment>
                      )}
                    </Field>
                  </div>
                  <ModalFooter>
                    <Button
                      onClick={() => {
                        setIsModalConvOpen(false);
                      }}
                      appearance="subtle"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="form-with-id"
                      appearance="primary"
                    >
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              )}
            </Form>
          </Modal>
        )}
      </ModalTransition>
    </div>
  );
};

export default ListConversation;
