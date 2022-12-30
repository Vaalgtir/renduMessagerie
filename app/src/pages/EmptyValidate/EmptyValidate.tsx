import React, { useState } from "react";

import EmptyState from "@atlaskit/empty-state";
import Button from "@atlaskit/button/standard-button";
import axios from "axios";
import { useSelector } from "react-redux";
import { fetchUser } from "../../Redux/States/users";
import { useNavigate } from "react-router-dom";

interface Props {}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const EmptyValidate: React.FC<Props> = () => {
  const [sent, setSent] = useState<boolean>(false);
  const user = useSelector(fetchUser);
  const navigate = useNavigate();

  if (user.isValidated) navigate("/", { replace: true });

  const sendConfirmMail = () => {
    axios
      .post(url + "/users/validateMail", {
        id: user.id,
        mail: user.mail,
      })
      .then(() => {
        setSent(true);
      })
      .catch((err) => {
        console.log("debug", err);
      });
  };

  return (
    <EmptyState
      header="Veuillez valider votre mail"
      description="Afin de s'assurer de la bonne qualité de notre service, nous validons chaque mails à l'inscription"
      primaryAction={
        <Button
          appearance="primary"
          onClick={() => {
            sendConfirmMail();
          }}
          isDisabled={sent}
        >
          {sent ? "Mail Envoyé" : "Valider le mail"}
        </Button>
      }
    />
  );
};
