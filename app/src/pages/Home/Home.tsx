import React, { useEffect, useState } from "react";
import { Launcher } from "popup-chat-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "@atlaskit/button";
import DynamicTable from "@atlaskit/dynamic-table";

import { fetchUser } from "../../Redux/States/users";
import { fetchUsersConnected } from "../../Redux/States/usersConnected";

import styles from "./Home.module.scss";

interface Props {
  socket: any;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const Home: React.FC<Props> = ({ socket }) => {
  const [messageList, setMessageList] = useState<any>([]);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [salesManConnected, setSalesManConnected] = useState<any>(false);
  const [convRequested, setConvRequested] = useState<boolean>(false);
  const [rows, setRows] = useState([]);
  const [currentDiscussion, setCurrentDiscussion] = useState<any>();

  const navigate = useNavigate();
  const user = useSelector(fetchUser);
  const usersWSConnected = useSelector(fetchUsersConnected);

  useEffect(() => {
    if (usersWSConnected.length > 0 && !user.isSalesman) {
      axios
        .post<any>(url + "/users/fetchAllSalesman")
        .then(({ data: salesmans }) => {
          const arraySalesman = salesmans.map(
            (salesman: { id: number }) => salesman.id
          );

          const salesmanCo = usersWSConnected
            .filter((user) => arraySalesman.includes(user.username))
            .map((userWS) => userWS.username);

          const allSalesman = salesmans.filter((salesman: any) =>
            salesmanCo.includes(salesman.id)
          );

          const randomIndex = Math.floor(Math.random() * allSalesman.length);

          setSalesManConnected(
            allSalesman.length > 0 ? allSalesman[randomIndex] : null
          );

          if (messageList.length < 2)
            setMessageList([
              {
                author: "sales",
                type: "text",
                data: {
                  text:
                    allSalesman.length > 0
                      ? `Bonjour, je m'appelle ${allSalesman[randomIndex].nom} ${allSalesman[randomIndex].prenom}, que puis-je pour vous ?`
                      : "Bonjour vous parlez actuellement à un bot",
                },
              },
            ]);
        });
    }
  }, [messageList.length, user.isSalesman, usersWSConnected]);

  useEffect(() => {
    socket &&
      socket.on("sav message", ({ message }: any) => {
        setMessageList([
          ...messageList,
          {
            author: user.isSalesman ? "client" : "sales",
            type: "text",
            data: {
              text: message,
            },
          },
        ]);

        if (!isOpen) {
          setNewMessagesCount(newMessagesCount + 1);
        }
      });

    socket &&
      socket.on("requestConv", ({ status }: any) => {
        switch (status) {
          case "requested":
            fetchRequest();
            break;

          default:
            break;
        }
      });

    socket &&
      socket.on("requestConv response", ({ status, from }: any) => {
        switch (status) {
          case "accepted":
            setCurrentDiscussion(from);
            break;
          case "refused":
            setCurrentDiscussion(null);
            setConvRequested(false);
            break;
          case "resolved":
            setCurrentDiscussion(null);
            setConvRequested(false);
            break;

          default:
            break;
        }
      });
  }, [socket, messageList, user.isSalesman, isOpen, newMessagesCount]);

  const answerRequest = (id: any, state: any, from: any) => {
    const WsId = usersWSConnected.find((userWs) => userWs.username === from);

    socket &&
      WsId &&
      socket.emit("requestConv response", {
        status: state,
        to: WsId.userID,
      });

    axios.post(url + "/sav/updateRequestState", { id, state }).then(() => {
      openMessage();

      fetchRequest();
    });
  };

  const fetchConversation = (from: any) => {
    setCurrentDiscussion(from);
    setIsOpen(true);

    setMessageList([
      {
        author: "me",
        type: "text",
        data: {
          text: `Bonjour, je m'appelle ${user.Nom} ${user.Prenom}, que puis-je pour vous ?`,
        },
      },
    ]);
  };

  const resolveConv = (id: any, from: any) => {
    axios.post(url + "/sav/resolveConv", { id }).then(() => {
      fetchRequest();
    });

    const WsId = usersWSConnected.find((userWs) => userWs.username === from);

    socket &&
      WsId &&
      socket.emit("requestConv response", {
        status: "resolved",
        to: WsId.userID,
      });
  };

  const fetchRequest = () => {
    axios
      .post(url + "/sav/fetchAllRequests", { for: user.id })
      .then(({ data }) => {
        const rows: any = [];

        data?.map((row: any, index: number) => {
          const {
            users_conv_request_fromTousers: { nom, prenom },
          } = row;
          const isAccepted = row.state === "accepted";

          rows.push({
            key: `row-${index}`,
            isHighlighted: false,
            cells: [
              {
                key: index + 1,
                content: nom,
              },
              {
                key: index + 2,
                content: prenom,
              },
              {
                key: index + 3,
                content: isAccepted ? (
                  <>
                    <Button
                      onClick={() => {
                        fetchConversation(row.from);
                      }}
                    >
                      Discuter
                    </Button>
                    <Button
                      onClick={() => {
                        resolveConv(row.id, row.from);
                      }}
                    >
                      Résoudre
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        answerRequest(row.id, "accepted", row.from);
                      }}
                    >
                      accepter
                    </Button>
                    <Button
                      onClick={() => {
                        answerRequest(row.id, "refused", row.from);
                      }}
                    >
                      refuser
                    </Button>
                  </>
                ),
              },
            ],
          });
        });

        setRows(rows);
      });
  };

  useEffect(() => {
    if (user.isConnected && !user.isBannished) {
      if (user.isSalesman) {
        fetchRequest();
      } else {
        axios
          .post(url + "/sav/fetchRequest", { from: user.id })
          .then(({ data }) => {
            setConvRequested(!!data);

            if (data.state === "accepted") {
              setCurrentDiscussion(data.for);
            }
          });
      }
    }
  }, [user, usersWSConnected]);

  const onMessageWasSent = (message: any) => {
    setMessageList([...messageList, message]);
    const messageText = message.data.text;

    const WsId = usersWSConnected.find(
      (userWs) => userWs.username === currentDiscussion
    );

    setMessageList([
      ...messageList,
      {
        author: "me",
        type: "text",
        data: {
          text: messageText,
        },
      },
    ]);

    socket &&
      WsId &&
      socket.emit("sav message", {
        message: messageText,
        to: WsId.userID,
      });
  };

  const openMessage = () => {
    if (isOpen && user.isSalesman) setCurrentDiscussion(null);

    setIsOpen(!isOpen);
    setNewMessagesCount(0);
  };

  const handleRequestConv = () => {
    const data = { from: user.id, for: salesManConnected.id };

    axios
      .post(url + "/sav/requestConv", data)
      .then(() => {
        setConvRequested(true);
      })
      .catch(() => {
        setConvRequested(false);
      });

    const WsId = usersWSConnected.find(
      (userWs) => userWs.username === salesManConnected.id
    );

    socket &&
      WsId &&
      socket.emit("requestConv", {
        status: "requested",
        to: WsId.userID,
      });
  };

  const header = {
    cells: [
      {
        key: "name",
        content: "Name",
        isSortable: true,
      },
      {
        key: "prenom",
        content: "Prenom",
        shouldTruncate: true,
        isSortable: true,
      },
      {
        key: "action",
        content: "Action",
        shouldTruncate: true,
        isSortable: false,
      },
    ],
  };

  return (
    <div>
      {user.isSalesman ? (
        <>
          <div className={styles.wrappertable}>
            <DynamicTable head={header} rows={rows} />
          </div>
          {currentDiscussion && (
            <Launcher
              agentProfile={{
                teamName: "Moto magasin",
                imageUrl:
                  "https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png",
              }}
              onMessageWasSent={onMessageWasSent}
              messageList={messageList}
              newMessagesCount={newMessagesCount}
              onClick={openMessage}
              isOpen={isOpen}
              showEmoji
              fileUpload={false}
              placeholder="Écrivez ici"
            />
          )}
        </>
      ) : (
        <>
          <Button
            onClick={() => {
              navigate("/messagerie", { replace: true });
            }}
          >
            Parler à des motards
          </Button>

          {convRequested ? (
            currentDiscussion ? (
              <Button onClick={openMessage}>Discuter avec un vendeur</Button>
            ) : (
              <>En attente du vendeur</>
            )
          ) : salesManConnected ? (
            <Button onClick={handleRequestConv}>
              Demander à parler avec un vendeur
            </Button>
          ) : (
            <Button onClick={openMessage}>Parler avec un chatbot</Button>
          )}

          {currentDiscussion && (
            <Launcher
              agentProfile={{
                teamName: "Moto magasin",
                imageUrl:
                  "https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png",
              }}
              onMessageWasSent={onMessageWasSent}
              messageList={messageList}
              newMessagesCount={newMessagesCount}
              onClick={openMessage}
              isOpen={isOpen}
              showEmoji
              fileUpload={false}
              placeholder="Écrivez ici"
            />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
