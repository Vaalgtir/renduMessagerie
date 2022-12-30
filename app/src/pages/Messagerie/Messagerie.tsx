import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Socket } from "socket.io-client";

import { fetchUser } from "../../Redux/States/users";

import { HORIZONTAL_GLOBAL_NAV_HEIGHT } from "@atlaskit/atlassian-navigation";
import PageHeader from "@atlaskit/page-header";
import Button from "@atlaskit/button";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";

import styles from "./Messagerie.module.scss";
import { UserItem } from "./UserItem/UserItem";
import ListConversation, {
  Conversation as ConvType,
} from "./ListConversation/ListConversation";
import Conversation from "./Conversation/Conversation";
import {
  fetchUsersConnected,
  setUserCo,
} from "../../Redux/States/usersConnected";

interface Props {
  socket: Socket | null;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  isFriend: boolean;
  isRequesting: boolean;
  isAsking: boolean;
}

const modelUser: User = {
  id: "",
  nom: "",
  prenom: "",
  isFriend: false,
  isRequesting: false,
  isAsking: false,
};

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const Messagerie: React.FC<Props> = ({ socket }) => {
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<boolean>(false);
  const [friendToDelete, setFriendToDelete] = useState<User>(modelUser);

  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [requesting, setRequesting] = useState<User[]>([]);
  const [asking, setAsking] = useState<User[]>([]);
  const [discovers, setDiscovers] = useState<User[]>([]);

  const [conversation, setConversation] = useState<ConvType>();

  const userConnected = useSelector(fetchUser);
  const usersWSConnected = useSelector(fetchUsersConnected);
  const dispatch = useDispatch();

  const setContent = (users: User[]) => {
    setUsers(users);
    setFriends(users.filter((user) => user.isFriend));
    setRequesting(users.filter((user) => user.isRequesting));
    setAsking(users.filter((user) => user.isAsking));
    setDiscovers(users.filter((user) => !user.isFriend && !user.isAsking));
  };

  const fetchFriends = () => {
    if (userConnected.isValidated && !userConnected.isBannished) {
      axios.post<User[]>(url + "/friends/fetchAll/").then((res) => {
        setContent(res.data);
      });
    }
  };

  useEffect(fetchFriends, [userConnected]);

  useEffect(() => {
    socket &&
      socket.on("private message", ({ message, _id, from }) => {
        if (conversation) {
          setConversation({
            ...conversation,
            messages: [
              ...conversation?.messages,
              {
                owner: from,
                message: message,
                _id,
              },
            ],
          });
        }
      });
  }, [conversation, socket]);

  const addFriend = (id: string) => {
    axios.post<User[]>(url + "/friends/add/", { friendId: id }).then((res) => {
      setContent(res.data);
    });
  };

  const confirmFriends = (id: string) => {
    axios
      .post<User[]>(url + "/friends/confirm/", { friendId: id })
      .then((res) => {
        setContent(res.data);
      });
  };

  const removeFriend = (id: string) => {
    axios.delete<User[]>(url + "/friends/remove/" + id).then((res) => {
      setFriendToDelete(modelUser);

      setContent(res.data);
    });
  };

  return (
    <div
      className={styles.view}
      style={{ minHeight: `calc(100vh - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)` }}
    >
      <div className={styles.messages}>
        <ListConversation
          users={users}
          friends={friends}
          setConversation={setConversation}
          conversation={conversation}
        />
      </div>
      <div className={styles.conversation}>
        <Conversation
          conversation={conversation}
          setConversation={setConversation}
          socket={socket}
          connectedUsers={usersWSConnected}
        />
      </div>
      <div className={styles.friends}>
        <div className={styles.header}>
          <PageHeader>Liste d'amis</PageHeader>
        </div>
        <div className={styles.userList}>
          <div className={styles.usersSection}>
            {friends.length > 0 && <div className={styles.subTitle}>Amis</div>}
            {friends.map((user, key) => {
              return (
                <UserItem
                  styles={styles}
                  key={key}
                  user={user}
                  setFriendToDelete={setFriendToDelete}
                  setIsModalDeleteOpen={setIsModalDeleteOpen}
                  addFriend={addFriend}
                  confirmFriends={confirmFriends}
                  connectedUsers={usersWSConnected}
                />
              );
            })}
          </div>

          <div className={styles.usersSection}>
            {requesting.length > 0 && (
              <div className={styles.subTitle}>Demandes d'amis</div>
            )}
            {requesting.map((user, key) => {
              return (
                <UserItem
                  styles={styles}
                  key={key}
                  user={user}
                  setFriendToDelete={setFriendToDelete}
                  setIsModalDeleteOpen={setIsModalDeleteOpen}
                  addFriend={addFriend}
                  confirmFriends={confirmFriends}
                />
              );
            })}
          </div>

          <div className={styles.usersSection}>
            {asking.length > 0 && (
              <div className={styles.subTitle}>Demandes en attente</div>
            )}
            {asking.map((user, key) => {
              return (
                <UserItem
                  styles={styles}
                  key={key}
                  user={user}
                  setFriendToDelete={setFriendToDelete}
                  setIsModalDeleteOpen={setIsModalDeleteOpen}
                  addFriend={addFriend}
                  confirmFriends={confirmFriends}
                />
              );
            })}
          </div>

          <div className={styles.usersSection}>
            <div className={styles.subTitle}>Découvrir</div>
            {discovers.map((user, key) => {
              return (
                <UserItem
                  styles={styles}
                  key={key}
                  user={user}
                  setFriendToDelete={setFriendToDelete}
                  setIsModalDeleteOpen={setIsModalDeleteOpen}
                  addFriend={addFriend}
                  confirmFriends={confirmFriends}
                />
              );
            })}
          </div>

          <ModalTransition>
            {isModalDeleteOpen && (
              <Modal
                onClose={() => {
                  setIsModalDeleteOpen(false);
                  setFriendToDelete(modelUser);
                }}
              >
                <ModalHeader>
                  <ModalTitle>Suppression d'amis</ModalTitle>
                </ModalHeader>
                <ModalBody>
                  Voulez vous vraiment supprimer {friendToDelete.nom}{" "}
                  {friendToDelete.prenom} de vous amis ?
                </ModalBody>
                <ModalFooter>
                  <Button
                    appearance="subtle"
                    onClick={() => {
                      setIsModalDeleteOpen(false);
                      setFriendToDelete(modelUser);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={() => {
                      removeFriend(friendToDelete.id);
                      setIsModalDeleteOpen(false);
                    }}
                    autoFocus
                  >
                    Valider
                  </Button>
                </ModalFooter>
              </Modal>
            )}
          </ModalTransition>
        </div>
      </div>
    </div>
  );
};

export default Messagerie;
