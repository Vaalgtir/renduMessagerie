import React from "react";
import { User } from "../Messagerie";

import InviteTeamIcon from "@atlaskit/icon/glyph/invite-team";
import AppAccessIcon from "@atlaskit/icon/glyph/app-access";
import FollowersIcon from "@atlaskit/icon/glyph/followers";
import Avatar from "@atlaskit/avatar";
import Badge from "@atlaskit/badge";
import Button from "@atlaskit/button";

interface Props {
  styles: any;
  key: React.Key | null | undefined;
  user: User;
  setFriendToDelete: Function;
  setIsModalDeleteOpen: Function;
  addFriend: Function;
  confirmFriends: Function;
  connectedUsers?: {
    userID: string;
    username: number;
  }[];
}

export const UserItem: React.FC<Props> = ({
  styles,
  key,
  user,
  setFriendToDelete,
  setIsModalDeleteOpen,
  addFriend,
  confirmFriends,
  connectedUsers,
}) => {
  const isConnected = connectedUsers?.find(
    (userCo) => userCo.username === parseInt(user.id)
  );

  return (
    <div className={styles.friend} key={key}>
      <div className={styles.name}>
        {user.nom && user.prenom ? (
          <Avatar size="small" presence={isConnected && "online"} />
        ) : (
          <Avatar size="small" />
        )}
        <span
          style={{ paddingLeft: "1vw" }}
        >{`${user.nom} ${user.prenom}`}</span>
      </div>
      {user.isFriend ? (
        <Button
          appearance="subtle"
          onClick={() => {
            setFriendToDelete(user);
            setIsModalDeleteOpen(true);
          }}
        >
          <AppAccessIcon label="" />
        </Button>
      ) : user.isAsking ? (
        <Button
          appearance="subtle"
          onClick={() => {
            setFriendToDelete(user);
            setIsModalDeleteOpen(true);
          }}
        >
          <FollowersIcon label="" />
        </Button>
      ) : user.isRequesting ? (
        <Button
          appearance="subtle"
          onClick={() => {
            confirmFriends(user.id);
          }}
        >
          <InviteTeamIcon label="" />
        </Button>
      ) : (
        <Button
          appearance="subtle"
          onClick={() => {
            addFriend(user.id);
          }}
        >
          <InviteTeamIcon label="" />
        </Button>
      )}
    </div>
  );
};
