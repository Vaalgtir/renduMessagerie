import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../../Redux/States/users";

import { Checkbox } from "@atlaskit/checkbox";
import InlineEdit from "@atlaskit/inline-edit";
import TextField from "@atlaskit/textfield";

import styles from "./UsersManagement.module.scss";

interface Props {}

interface UserAdmin {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  mail: string;
  isAdmin: boolean;
  isBannished: boolean;
  isValidated: boolean;
  isSalesman: boolean;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const UsersManagement: React.FC<Props> = () => {
  const [users, setUsers] = useState<UserAdmin[]>([]);

  const userConnected = useSelector(fetchUser);
  const navigate = useNavigate();

  const fetchAllUsers = () => {
    axios.post(url + "/users/fetchAll").then((res) => {
      setUsers(res.data);
    });
  };

  useEffect(() => {
    if (userConnected.isAdmin) {
      fetchAllUsers();
    } else {
      navigate("/", { replace: true });
    }
  }, [userConnected, navigate]);

  const handleUpdate = (data: object, userId: number) => {
    return new Promise((success, fail) => {
      axios
        .post(url + "/users/update/" + userId, data)
        .then(() => {
          axios.post(url + "/users/fetchAll").then((res) => {
            setUsers(res.data);
          });
        })
        .catch((err) => {
          fail(err);
        });
    });
  };

  return (
    <div className={styles.view}>
      <div className={styles.table}>
        <div>
          <div>username</div>
          <div>nom</div>
          <div>prenom</div>
          <div>mail</div>
          <div>isAdmin</div>
          <div>isBannished</div>
          <div>isValidated</div>
          <div>isSalesman</div>
        </div>
        <section className={styles.wrapperUsers}>
          {users.map((user) => (
            <div>
              <InlineEdit
                hideActionButtons
                isRequired
                defaultValue={user.username}
                editView={({ errorMessage, ...fieldProps }) => (
                  <TextField {...fieldProps} autoFocus maxLength={20} />
                )}
                readView={() => (
                  <div className={styles.textView}>{user.username}</div>
                )}
                onConfirm={(value) => {
                  handleUpdate({ username: value }, user.id)
                    .then((res: any) => {
                      setUsers(res.data);
                    })
                    .catch((err: any) => {
                      console.log(err);
                    });
                }}
              />
              <InlineEdit
                hideActionButtons
                isRequired
                defaultValue={user.nom}
                editView={({ errorMessage, ...fieldProps }) => (
                  <TextField {...fieldProps} autoFocus maxLength={20} />
                )}
                readView={() => (
                  <div className={styles.textView}>{user.nom}</div>
                )}
                onConfirm={(value) => {
                  handleUpdate({ nom: value }, user.id)
                    .then((res: any) => {
                      setUsers(res.data);
                    })
                    .catch((err: any) => {
                      console.log(err);
                    });
                }}
              />
              <InlineEdit
                hideActionButtons
                isRequired
                defaultValue={user.prenom}
                editView={({ errorMessage, ...fieldProps }) => (
                  <TextField {...fieldProps} autoFocus maxLength={20} />
                )}
                readView={() => (
                  <div className={styles.textView}>{user.prenom}</div>
                )}
                onConfirm={(value) => {
                  handleUpdate({ prenom: value }, user.id)
                    .then((res: any) => {
                      setUsers(res.data);
                    })
                    .catch((err: any) => {
                      console.log(err);
                    });
                }}
              />
              <InlineEdit
                hideActionButtons
                isRequired
                defaultValue={user.mail}
                editView={({ errorMessage, ...fieldProps }) => (
                  <TextField {...fieldProps} autoFocus maxLength={20} />
                )}
                readView={() => (
                  <div className={styles.textView}>{user.mail}</div>
                )}
                onConfirm={(value) => {
                  handleUpdate({ mail: value }, user.id)
                    .then((res: any) => {
                      setUsers(res.data);
                    })
                    .catch((err: any) => {
                      console.log(err);
                    });
                }}
              />
              <div>
                <Checkbox
                  isChecked={user.isAdmin}
                  onChange={(event) => {
                    handleUpdate({ isAdmin: event.target.checked }, user.id)
                      .then((res: any) => {
                        setUsers(res.data);
                      })
                      .catch((err: any) => {
                        console.log(err);
                      });
                  }}
                />
              </div>
              <div>
                <Checkbox
                  isChecked={user.isBannished}
                  onChange={(event) => {
                    handleUpdate({ isBannished: event.target.checked }, user.id)
                      .then((res: any) => {
                        setUsers(res.data);
                      })
                      .catch((err: any) => {
                        console.log(err);
                      });
                  }}
                />
              </div>
              <div>
                <Checkbox
                  isChecked={user.isValidated}
                  onChange={(event) => {
                    handleUpdate({ isValidated: event.target.checked }, user.id)
                      .then((res: any) => {
                        setUsers(res.data);
                      })
                      .catch((err: any) => {
                        console.log(err);
                      });
                  }}
                />
              </div>
              <div>
                <Checkbox
                  isChecked={user.isSalesman}
                  onChange={(event) => {
                    handleUpdate({ isSalesman: event.target.checked }, user.id)
                      .then((res: any) => {
                        setUsers(res.data);
                      })
                      .catch((err: any) => {
                        console.log(err);
                      });
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default UsersManagement;
