import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./App.css";
import Base from "./shared/Base/Base";
import { fetchUser, setState } from "./Redux/States/users";
import { validate } from "./utils/checkConnection";
import SideBarProfil from "./pages/SideBarProfil/SideBarProfil";
import UserProfil from "./pages/UserProfil/UserProfil";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import Messagerie from "./pages/Messagerie/Messagerie";
import Moderation from "./pages/Moderation/Moderation";
import UsersManagement from "./pages/UsersManagement/UsersManagement";
import ErrorManagement from "./pages/ErrorsManagement/ErrorsManagement";

import io, { Socket } from "socket.io-client";
import Home from "./pages/Home/Home";
import { setUserCo, user } from "./Redux/States/usersConnected";
import { Reunions } from "./pages/Reunions/Reunions";
import { Push } from "./pages/Push/Push";

import Flag, { FlagGroup } from "@atlaskit/flag";
import { EmptyValidate } from "./pages/EmptyValidate/EmptyValidate";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const App = () => {
  const [checkingToken, setCheckingToken] = useState<boolean>(true);
  const [isPopupProfilOpen, setIsPopupSettingsOpen] = useState<boolean>(false);
  const [flags, setFlags] = useState<any>([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const socket = useRef<Socket | null>(null);

  const userConnected = useSelector(fetchUser);

  useEffect(() => {
    validate()
      .then((data) => {
        axios.defaults.headers.post["Authorization"] = `Basic ${
          localStorage.getItem("TOKEN") || ""
        } ${data.id}`;
        axios.defaults.headers.put["Authorization"] = `Basic ${
          localStorage.getItem("TOKEN") || ""
        } ${data.id}`;
        axios.defaults.headers.delete["Authorization"] = `Basic ${
          localStorage.getItem("TOKEN") || ""
        } ${data.id}`;

        dispatch(
          setState({
            isConnected: data.isConnected,
            id: data.id,
            username: data.username,
            mail: data.mail,
            accessToken: localStorage.getItem("TOKEN") || "",
            isAdmin: data.isAdmin,
            isValidated: data.isValidated,
            isBannished: data.isBannished,
            isSalesman: data.isSalesman,
            Nom: data.Nom,
            Prenom: data.Prenom,
          })
        );

        if (!data.isValidated) {
          navigate("/validateMail", { replace: true });
        }

        setCheckingToken(false);
      })
      .catch((data) => {
        dispatch(
          setState({
            isConnected: data.isConnected,
            id: data.id,
            username: data.username,
            mail: data.mail,
            accessToken: localStorage.getItem("TOKEN") || "",
            isAdmin: data.isAdmin,
            isValidated: data.isValidated,
            isBannished: data.isBannished,
            isSalesman: data.isSalesman,
            Nom: data.Nom,
            Prenom: data.Prenom,
          })
        );

        setCheckingToken(false);
      });
  }, [dispatch]);

  useEffect(() => {
    if (url) {
      socket.current = io(url, { autoConnect: false });

      if (userConnected.isValidated && !userConnected.isBannished) {
        socket.current.auth = { username: userConnected.id };
        socket.current.connect();

        socket.current &&
          socket.current.on("users", (users) => {
            dispatch(setUserCo(users));
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userConnected, url]);

  const handleLogout = () => {
    localStorage.removeItem("TOKEN");
    setIsPopupSettingsOpen(false);

    dispatch(
      setState({
        isConnected: false,
        id: 0,
        username: "",
        accessToken: "",
        mail: "",
        isAdmin: false,
        isValidated: false,
        isBannished: false,
        isSalesman: false,
        Nom: "",
        Prenom: "",
      })
    );
    socket.current?.disconnect();
  };

  useEffect(() => {
    if (
      userConnected.isConnected &&
      !userConnected.isSalesman &&
      !userConnected.isAdmin
    ) {
      const source = new EventSource(url + "/push/subscribe");
      source.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.push && msg.title) {
          setFlags([
            ...flags,
            {
              description: msg.push,
              title: msg.title,
              id: Date.now(),
            },
          ]);
        }
      };
    }
  }, [flags, userConnected]);

  const dismissFlag = useCallback(
    (id: string | number) => {
      setFlags(flags.filter((flag: any) => flag.id !== id));
    },
    [flags]
  );

  return (
    <>
      <Routes>
        <Route
          path="/validateMail"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <EmptyValidate />
              </Base>
            </>
          }
        />
        <Route
          path="/"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <Home socket={socket.current} />
              </Base>
            </>
          }
        />
        <Route
          path="/messagerie"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <Messagerie socket={socket.current} />
              </Base>
            </>
          }
        />
        <Route
          path="/create/account"
          element={
            <>
              <CreateAccount />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <div style={{ display: "flex" }}>
                  <SideBarProfil page="info perso" />
                  <UserProfil />
                </div>
              </Base>
            </>
          }
        />
        <Route
          path="/moderation"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <Moderation />
              </Base>
            </>
          }
        />
        <Route
          path="/users"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <UsersManagement />
              </Base>
            </>
          }
        />
        <Route
          path="/errors"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <ErrorManagement socket={socket.current} />
              </Base>
            </>
          }
        />
        <Route
          path="/reunions"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <Reunions socket={socket.current} />
              </Base>
            </>
          }
        />
        <Route
          path="/pushMarketing"
          element={
            <>
              <Base
                handleLogout={handleLogout}
                checkingToken={checkingToken}
                isPopupProfilOpen={isPopupProfilOpen}
                setIsPopupSettingsOpen={setIsPopupSettingsOpen}
              >
                <Push />
              </Base>
            </>
          }
        />
      </Routes>
      <FlagGroup onDismissed={dismissFlag}>
        {flags.map((flag: any) => (
          <Flag {...flag} />
        ))}
      </FlagGroup>
    </>
  );
};

export default App;
