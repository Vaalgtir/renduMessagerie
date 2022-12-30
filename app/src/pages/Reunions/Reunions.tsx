import React, { Fragment, useEffect, useState } from "react";

import Button from "@atlaskit/button";
import ButtonGroup from "@atlaskit/button/button-group";
import LoadingButton from "@atlaskit/button/loading-button";
import DynamicTable from "@atlaskit/dynamic-table";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Form, {
  ErrorMessage,
  Field,
  FormFooter,
  FormHeader,
  FormSection,
} from "@atlaskit/form";
import TextField from "@atlaskit/textfield";

import styles from "./Reunions.module.scss";
import axios from "axios";
import { useSelector } from "react-redux";
import { fetchUser } from "../../Redux/States/users";
import { Socket } from "socket.io-client";

interface Props {
  socket: any;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const Reunions: React.FC<Props> = ({ socket }) => {
  const [rows, setRows] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [updatedRoom, setUpdatedRoom] = useState<any>();
  const [isReunionOpen, setIsReunionOpen] = useState(false);
  const [messageList, setMessageList] = useState<any>([]);
  const [currentRoom, setCurrentRoom] = useState<any>();
  const [currentMessage, setCurrentMessage] = useState<any>();

  const user = useSelector(fetchUser);

  const getReunions = () => {
    axios.post(url + "/reunions/getReunions").then(({ data }) => {
      const rowsRep: any = [];
      data.forEach((row: any, index: any) => {
        rowsRep.push({
          key: `row-${index}`,
          isHighlighted: false,
          cells: [
            {
              key: index + 1,
              content: row.nom,
            },
            {
              key: index + 2,
              content: row.size,
            },
            {
              key: index + 3,
              content: user.isSalesman ? (
                <>
                  <Button
                    onClick={() => {
                      handleJoin(row.nom);
                    }}
                    isDisabled={row.size <= row.users}
                  >
                    Rejoindre
                  </Button>
                  <Button
                    onClick={() => {
                      setUpdatedRoom(row);
                      setIsModalUpdateOpen(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => {
                      handleDelete(row.nom);
                    }}
                  >
                    Supprimer
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      handleJoin(row.nom);
                    }}
                    isDisabled={row.size <= row.users}
                  >
                    Rejoindre
                  </Button>
                </>
              ),
            },
          ],
        });
      });
      setRows(rowsRep);
    });
  };

  useEffect(() => {
    socket &&
      socket.on("joining", ({ who, kicked }: any) => {
        if (kicked) {
          setCurrentRoom("");
          setIsReunionOpen(false);
        } else {
          setMessageList([
            ...messageList,
            { author: `${who} à rejoins la réunions les boys`, message: "" },
          ]);
        }
      });

    socket &&
      socket.on("reunions", () => {
        getReunions();
      });

    socket &&
      socket.on("message", ({ who, message }: any) => {
        setMessageList([...messageList, { author: who, message }]);
      });
  }, [socket, messageList]);

  const handleJoin = (nom: string) => {
    socket &&
      socket.emit("join room", {
        nom,
        who: `${user.Nom} ${user.Prenom}`,
      });
    setIsReunionOpen(true);
    setCurrentRoom(nom);
  };

  useEffect(() => {
    getReunions();
  }, []);

  const header = {
    cells: [
      {
        key: "name",
        content: "Salle de réunion",
        isSortable: true,
      },
      {
        key: "size",
        content: "Taille",
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

  const handleSubmit = (data: any) => {
    axios.post(url + "/reunions/createReunion", data).then(() => {
      setIsModalOpen(false);
      setRows([
        ...rows,
        {
          key: `row-${rows.length}`,
          isHighlighted: false,
          cells: [
            {
              key: rows.length + 1,
              content: data.nom,
            },
            {
              key: rows.length + 2,
              content: data.size,
            },
            {
              key: rows.length + 3,
              content: (
                <>
                  <Button
                    onClick={() => {
                      handleJoin(data.nom);
                    }}
                  >
                    Rejoindre
                  </Button>
                  <Button
                    onClick={() => {
                      setUpdatedRoom(data);
                      setIsModalUpdateOpen(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => {
                      handleDelete(data.nom);
                    }}
                  >
                    Supprimer
                  </Button>
                </>
              ),
            },
          ],
        },
      ]);
    });
  };

  const handleUpdate = (data: any) => {
    if (updatedRoom.nom.length > 0)
      axios
        .post(url + "/reunions/updateReunion", {
          prevNom: updatedRoom.nom,
          ...data,
        })
        .then(() => {
          setIsModalUpdateOpen(false);
          setUpdatedRoom("");
          getReunions();
        });
  };

  const handleDelete = (room: any) => {
    room &&
      axios
        .post(url + "/reunions/deleteReunion", {
          room,
        })
        .then(() => {
          getReunions();
        });
  };

  const handleSendMessage = () => {
    socket &&
      socket.emit("message", {
        nom: currentRoom,
        who: `${user.Nom} ${user.Prenom}`,
        message: currentMessage,
      });

    setCurrentMessage("");
  };

  return (
    <>
      {isReunionOpen ? (
        <>
          <div className={styles.messagesWrapper}>
            {messageList.map((msg: any) => (
              <div>
                {msg.author} {msg.message.length > 0 && ":"} {msg.message}
              </div>
            ))}
          </div>

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
                            setCurrentMessage(
                              (e.target as HTMLInputElement).value
                            );
                          }}
                          value={currentMessage}
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
        </>
      ) : user.isSalesman ? (
        <>
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Ajouter réunion
          </Button>
          <div className={styles.wrappertable}>
            <DynamicTable head={header} rows={rows} />
          </div>

          <ModalTransition>
            {isModalOpen && (
              <Modal
                onClose={() => {
                  setIsModalOpen(false);
                }}
              >
                <ModalHeader>
                  <ModalTitle>Création de réunion</ModalTitle>
                </ModalHeader>
                <ModalBody>
                  <Form onSubmit={handleSubmit}>
                    {({ formProps, submitting }) => (
                      <form {...formProps}>
                        <FormHeader description="* champs requis" />
                        <FormSection>
                          <Field
                            aria-required={true}
                            name="nom"
                            label="Nom"
                            isRequired
                            defaultValue="test"
                            validate={(value) => {
                              if (!value) {
                                return;
                              }

                              if (value.length > 20) {
                                return "TOO_LONG";
                              }
                            }}
                          >
                            {({ fieldProps, error }) => (
                              <Fragment>
                                <TextField autoComplete="off" {...fieldProps} />
                                {error === "WRONG_CHARACTER" && (
                                  <ErrorMessage>
                                    Vous ne pouvez utiliser que des lettres et
                                    pas d'espaces
                                  </ErrorMessage>
                                )}
                              </Fragment>
                            )}
                          </Field>
                          <Field
                            aria-required={true}
                            name="size"
                            label="Taille"
                            isRequired
                            defaultValue={1}
                            validate={(value) => {
                              if (!value) {
                                return;
                              }
                            }}
                          >
                            {({ fieldProps, error }) => (
                              <Fragment>
                                <TextField
                                  autoComplete="off"
                                  type="number"
                                  min={1}
                                  {...fieldProps}
                                />
                                {error === "WRONG_CHARACTER" && (
                                  <ErrorMessage>
                                    Vous ne pouvez utiliser que des lettres et
                                    pas d'espaces
                                  </ErrorMessage>
                                )}
                              </Fragment>
                            )}
                          </Field>
                        </FormSection>

                        <FormFooter>
                          <ButtonGroup>
                            <Button
                              appearance="subtle"
                              onClick={() => {
                                setIsModalOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <LoadingButton type="submit" appearance="primary">
                              Valider
                            </LoadingButton>
                          </ButtonGroup>
                        </FormFooter>
                      </form>
                    )}
                  </Form>
                </ModalBody>
                <ModalFooter></ModalFooter>
              </Modal>
            )}
            {isModalUpdateOpen && (
              <Modal
                onClose={() => {
                  setIsModalUpdateOpen(false);
                }}
              >
                <ModalHeader>
                  <ModalTitle>
                    Modifications de la Réunion : {updatedRoom.nom}
                  </ModalTitle>
                </ModalHeader>
                <ModalBody>
                  <Form onSubmit={handleUpdate}>
                    {({ formProps, submitting }) => (
                      <form {...formProps}>
                        <FormHeader description="* champs requis" />
                        <FormSection>
                          <Field
                            aria-required={true}
                            name="nom"
                            label="Nom"
                            isRequired
                            defaultValue={updatedRoom.nom}
                            validate={(value) => {
                              if (!value) {
                                return;
                              }

                              if (value.length > 20) {
                                return "TOO_LONG";
                              }
                            }}
                          >
                            {({ fieldProps, error }) => (
                              <Fragment>
                                <TextField autoComplete="off" {...fieldProps} />
                                {error === "WRONG_CHARACTER" && (
                                  <ErrorMessage>
                                    Vous ne pouvez utiliser que des lettres et
                                    pas d'espaces
                                  </ErrorMessage>
                                )}
                              </Fragment>
                            )}
                          </Field>
                          <Field
                            aria-required={true}
                            name="size"
                            label="Taille"
                            isRequired
                            defaultValue={updatedRoom.size}
                            validate={(value) => {
                              if (!value) {
                                return;
                              }
                            }}
                          >
                            {({ fieldProps, error }) => (
                              <Fragment>
                                <TextField
                                  autoComplete="off"
                                  type="number"
                                  min={1}
                                  {...fieldProps}
                                />
                                {error === "WRONG_CHARACTER" && (
                                  <ErrorMessage>
                                    Vous ne pouvez utiliser que des lettres et
                                    pas d'espaces
                                  </ErrorMessage>
                                )}
                              </Fragment>
                            )}
                          </Field>
                        </FormSection>

                        <FormFooter>
                          <ButtonGroup>
                            <Button
                              appearance="subtle"
                              onClick={() => {
                                setIsModalUpdateOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <LoadingButton type="submit" appearance="primary">
                              Valider
                            </LoadingButton>
                          </ButtonGroup>
                        </FormFooter>
                      </form>
                    )}
                  </Form>
                </ModalBody>
                <ModalFooter></ModalFooter>
              </Modal>
            )}
          </ModalTransition>
        </>
      ) : (
        <>
          <div className={styles.wrappertable}>
            <DynamicTable head={header} rows={rows} />
          </div>
        </>
      )}
    </>
  );
};
