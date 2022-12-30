import React, { Fragment, useEffect } from "react";

import ButtonGroup from "@atlaskit/button/button-group";
import LoadingButton from "@atlaskit/button/loading-button";
import Button from "@atlaskit/button/standard-button";
import TextField from "@atlaskit/textfield";

import Form, {
  ErrorMessage,
  Field,
  FormFooter,
  FormHeader,
  FormSection,
} from "@atlaskit/form";

import styles from "./CreateAccount.module.scss";
import { REGEX_MAIL, REGEX_USER } from "../../utils/regex";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../utils/login";
import { fetchUser } from "../../Redux/States/users";
import { useNavigate } from "react-router-dom";

interface Props {}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const CreateAccount: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const user = useSelector(fetchUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.isConnected) {
      navigate("/", { replace: true });
    }
  }, [user.isConnected, navigate]);

  const handleSubmit = (data: {
    passwordConfirm: string;
    password: string;
  }) => {
    const error = {
      passwordConfirm:
        data.passwordConfirm !== data.password
          ? "Les mots de passe ne corrspondent pas"
          : undefined,
    };

    if (!error.passwordConfirm) {
      const { passwordConfirm, ...reqData } = data;

      axios
        .post(url + "/users/create", reqData)
        .then((res) => {
          login(res, dispatch);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    return error;
  };

  return (
    <div
      style={{
        display: "flex",
        width: "400px",
        maxWidth: "100%",
        margin: "10vh auto",
        flexDirection: "column",
      }}
    >
      <Form onSubmit={handleSubmit}>
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <FormHeader title="Sign up" description="* champs requis" />
            <FormSection>
              <Field
                aria-required={true}
                name="username"
                label="Username"
                isRequired
                defaultValue="test"
                validate={(value) => {
                  if (!value) {
                    return;
                  }

                  if (value.length > 20) {
                    return "TOO_LONG";
                  }

                  if (!value.match(REGEX_USER)) {
                    return "WRONG_CHARACTER";
                  }
                }}
              >
                {({ fieldProps, error }) => (
                  <Fragment>
                    <TextField autoComplete="off" {...fieldProps} />
                    {error === "WRONG_CHARACTER" && (
                      <ErrorMessage>
                        Vous ne pouvez utiliser que des lettres et pas d'espaces
                      </ErrorMessage>
                    )}
                  </Fragment>
                )}
              </Field>
              <Field
                aria-required={true}
                name="mail"
                label="Mail"
                isRequired
                defaultValue="e.eniona2@gmail.com"
                validate={(value) => {
                  if (!value) {
                    return;
                  }

                  if (value.length > 30) {
                    return "TOO_LONG";
                  }

                  if (!value.match(REGEX_MAIL)) {
                    return "WRONG_FORMAT";
                  }
                }}
              >
                {({ fieldProps, error }) => (
                  <Fragment>
                    <TextField autoComplete="off" {...fieldProps} />
                    {error === "WRONG_FORMAT" && (
                      <ErrorMessage>Merci d'entrer un mail valide</ErrorMessage>
                    )}
                  </Fragment>
                )}
              </Field>
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

                  if (!value.match(REGEX_USER)) {
                    return "WRONG_CHARACTER";
                  }
                }}
              >
                {({ fieldProps, error }) => (
                  <Fragment>
                    <TextField autoComplete="off" {...fieldProps} />
                    {error === "WRONG_CHARACTER" && (
                      <ErrorMessage>
                        Vous ne pouvez utiliser que des lettres et pas d'espaces
                      </ErrorMessage>
                    )}
                  </Fragment>
                )}
              </Field>
              <Field
                aria-required={true}
                name="prenom"
                label="Prénom"
                isRequired
                defaultValue="test"
                validate={(value) => {
                  if (!value) {
                    return;
                  }

                  if (value.length > 20) {
                    return "TOO_LONG";
                  }

                  if (!value.match(REGEX_USER)) {
                    return "WRONG_CHARACTER";
                  }
                }}
              >
                {({ fieldProps, error }) => (
                  <Fragment>
                    <TextField autoComplete="off" {...fieldProps} />
                    {error === "WRONG_CHARACTER" && (
                      <ErrorMessage>
                        Vous ne pouvez utiliser que des lettres et pas d'espaces
                      </ErrorMessage>
                    )}
                  </Fragment>
                )}
              </Field>
              <Field
                aria-required={true}
                name="password"
                label="Password"
                defaultValue="testtest"
                isRequired
                validate={(value) =>
                  value && value.length < 8 ? "TOO_SHORT" : undefined
                }
              >
                {({ fieldProps, error, valid, meta }) => {
                  return (
                    <Fragment>
                      <TextField type="password" {...fieldProps} />
                      {error && (
                        <ErrorMessage>
                          Password needs to be more than 8 characters.
                        </ErrorMessage>
                      )}
                    </Fragment>
                  );
                }}
              </Field>
              <Field
                aria-required={true}
                name="passwordConfirm"
                label="Confirmer le mot de passe"
                defaultValue="testtest"
                isRequired
              >
                {({ fieldProps, error, valid, meta }) => {
                  return (
                    <Fragment>
                      <TextField type="password" {...fieldProps} />
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </Fragment>
                  );
                }}
              </Field>
            </FormSection>

            <FormFooter>
              <ButtonGroup>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    navigate("/", { replace: true });
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton type="submit" appearance="primary">
                  Sign up
                </LoadingButton>
              </ButtonGroup>
            </FormFooter>
          </form>
        )}
      </Form>
    </div>
  );
};

export default CreateAccount;
