import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { fetchUser } from "../../Redux/States/users";

import styles from "./ErrorManagement.module.scss";

interface Props {
  socket: Socket | null;
}

export interface ErrorType {
  message: string;
  code: number;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const ErrorManagement: React.FC<Props> = ({ socket }) => {
  const [errors, setErrors] = useState<ErrorType[]>([]);

  const userConnected = useSelector(fetchUser);
  const navigate = useNavigate();

  const fetchAllErrors = () => {
    axios.post(url + "/errors/fetchAll").then((res) => {
      setErrors(res.data);
    });
  };

  useEffect(() => {
    if (userConnected.isValidated && !userConnected.isBannished) {
      socket &&
        socket.on("errors", (error) => {
          console.log("debug", error);

          setErrors([error, ...errors]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userConnected]);

  useEffect(() => {
    if (userConnected.isAdmin) {
      fetchAllErrors();
    } else {
      navigate("/", { replace: true });
    }
  }, [userConnected, navigate]);

  return (
    <div className={styles.view}>
      <table>
        <tr>
          <th>Code</th>
          <th>Message</th>
        </tr>

        {errors.map((error) => (
          <tr>
            <td>{error.code}</td>
            <td>{error.message}</td>
          </tr>
        ))}
      </table>
    </div>
  );
};

export default ErrorManagement;
