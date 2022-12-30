import React, { useState } from "react";
import axios from "axios";

import styles from "./Connection.module.scss";

import { useDispatch } from "react-redux";
import Button from "@atlaskit/button";
import { useNavigate } from "react-router-dom";
import { login } from "../../utils/login";

interface Props {}

const Connection: React.FC<Props> = () => {
  const [mail, setMail] = useState("salesman@gmail.com");
  const [pwd, setPwd] = useState("khunou");
  const [warning, setWarning] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const url =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_URL_PROD
      : process.env.REACT_APP_URL_DEV;

  const handleSubmit = (event: React.SyntheticEvent): void => {
    event.preventDefault();

    axios
      .post(url + "/users/login", {
        mail: mail,
        password: pwd,
      })
      .then((res) => {
        login(res, dispatch);
      })
      .catch((err) => {
        try {
          setWarning(err.response.data.message);
        } catch {
          setWarning("Il semble que le serveur soit offline");
        }
      });
  };

  return (
    <div className={styles.view}>
      <div className={styles.Background}></div>
      <div className={styles.modal}>
        <h1>Identifiez vous</h1>
        {warning.length > 0 ? <h2>{warning}</h2> : null}
        <form onSubmit={handleSubmit} data-warning={warning.length > 0}>
          <input
            type="text"
            placeholder="Mail"
            value={mail}
            onChange={(event) => setMail(event.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={pwd}
            onChange={(event) => setPwd(event.target.value)}
          />
          {/* <button type="submit" id="login-button">
            Login
          </button> */}
          <Button type="submit" appearance="primary">
            Connectez vous
          </Button>
          <Button
            appearance="subtle"
            onClick={() => {
              navigate("/create/account", { replace: true });
            }}
          >
            Créer un compte
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Connection;
