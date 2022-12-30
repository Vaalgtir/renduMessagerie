import React, { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUser,
  setMail,
  setNom,
  setPrenom,
} from "../../Redux/States/users";

import PageHeader from "@atlaskit/page-header";
import InlineEdit from "@atlaskit/inline-edit";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import ModalDialog, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Form, { ErrorMessage, Field } from "@atlaskit/form";
import Textfield from "@atlaskit/textfield";

import styles from "./UserProfil.module.scss";
import axios from "axios";

interface Props {}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const UserProfil: React.FC<Props> = () => {
  const user = useSelector(fetchUser);
  const dispatch = useDispatch();

  const [newNom, setNewNom] = useState(user.Nom);
  const [newPrenom, setNewPrenom] = useState(user.Prenom);
  const [newMail, setNewMail] = useState(user.mail);

  const [isModalPwdOpen, setIsModalPwdOpen] = useState<boolean>(false);

  const handleUpdate = (data: object) => {
    return new Promise((success, fail) => {
      axios
        .post(url + "/users/update/" + user.id, data)
        .then((res) => {
          success(res.data);
        })
        .catch((err) => {
          fail(err);
        });
    });
  };

  const handleSubmitPassword = (data: { pwd: string; pwdConfirm: string }) => {
    console.log(data);
    const errors = {
      pwd:
        data.pwd.length < 5
          ? "Votre mot de passe n'est pas assez long."
          : undefined,
      pwdConfirm:
        data.pwd !== data.pwdConfirm ? "Mots de passes différents." : undefined,
    };

    if (!errors.pwd && !errors.pwdConfirm) {
      axios
        .post(url + "/users/updatePassword/" + user.id, { password: data.pwd })
        .then(() => {
          setIsModalPwdOpen(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    return errors;
  };

  return (
    <div className={styles.view}>
      <PageHeader>A propos de vous</PageHeader>
      <div className={styles.infos}>
        <div>
          <InlineEdit
            hideActionButtons
            isRequired
            defaultValue={user.Nom}
            label="Nom :"
            editView={({ errorMessage, ...fieldProps }) => (
              <TextField {...fieldProps} autoFocus maxLength={20} />
            )}
            readView={() => <div className={styles.textView}>{newNom}</div>}
            onConfirm={(value) => {
              setNewNom(value);
              handleUpdate({ nom: value })
                .then(() => {
                  dispatch(setNom(value));
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          />
        </div>
        <div>
          <InlineEdit
            hideActionButtons
            isRequired
            defaultValue={user.Prenom}
            label="Prenom :"
            editView={({ errorMessage, ...fieldProps }) => (
              <TextField {...fieldProps} autoFocus maxLength={20} />
            )}
            readView={() => <div className={styles.textView}>{newPrenom}</div>}
            onConfirm={(value) => {
              setNewPrenom(value);
              handleUpdate({ prenom: value })
                .then(() => {
                  dispatch(setPrenom(value));
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          />
        </div>
        <div>
          <InlineEdit
            hideActionButtons
            isRequired
            defaultValue={user.mail}
            label="Mail :"
            editView={({ errorMessage, ...fieldProps }) => (
              <TextField {...fieldProps} autoFocus maxLength={20} />
            )}
            readView={() => <div className={styles.textView}>{newMail}</div>}
            onConfirm={(value) => {
              setNewMail(value);
              handleUpdate({ mail: value })
                .then(() => {
                  dispatch(setMail(value));
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          />
        </div>
      </div>
      <div className={styles.password}>
        <Button
          appearance="primary"
          onClick={() => {
            setIsModalPwdOpen(true);
          }}
        >
          Changer le mot de passe
        </Button>

        <ModalTransition>
          {isModalPwdOpen && (
            <ModalDialog
              onClose={() => {
                setIsModalPwdOpen(false);
              }}
            >
              <Form onSubmit={handleSubmitPassword}>
                {({ formProps }) => (
                  <form id="form-with-id" {...formProps}>
                    <ModalHeader>
                      <ModalTitle>Modal dialog with form</ModalTitle>
                    </ModalHeader>

                    <ModalBody>
                      <p>
                        Enter some text then submit the form to see the
                        response.
                      </p>
                      <Field label="Mot de passe" name="pwd" defaultValue="">
                        {({ fieldProps, error }) => (
                          <Fragment>
                            <Textfield {...fieldProps} />
                            {error && (
                              <ErrorMessage>
                                Le mot de passe doit faire plus de 4 caractères
                              </ErrorMessage>
                            )}
                          </Fragment>
                        )}
                      </Field>
                      <Field
                        label="Confirmer votre mot de passe"
                        name="pwdConfirm"
                        defaultValue=""
                      >
                        {({ fieldProps, error }) => (
                          <Fragment>
                            <Textfield {...fieldProps} />
                            {error && (
                              <ErrorMessage>
                                Les mots de passes sont différents
                              </ErrorMessage>
                            )}
                          </Fragment>
                        )}
                      </Field>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        onClick={() => {
                          setIsModalPwdOpen(false);
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
            </ModalDialog>
          )}
        </ModalTransition>
      </div>
    </div>
  );
};

export default UserProfil;
