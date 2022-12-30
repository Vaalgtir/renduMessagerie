import axios from "axios";
import { setState } from "../Redux/States/users";

export const login = (res: any, dispatch: any) => {
  localStorage.setItem("TOKEN", res.data.accessToken);
  axios.defaults.headers.post[
    "Authorization"
  ] = `Basic ${res.data.accessToken} ${res.data.id}`;
  axios.defaults.headers.put[
    "Authorization"
  ] = `Basic ${res.data.accessToken} ${res.data.id}`;
  axios.defaults.headers.delete[
    "Authorization"
  ] = `Basic ${res.data.accessToken} ${res.data.id}`;

  dispatch(
    setState({
      isConnected: true,
      id: res.data.id,
      username: res.data.username,
      accessToken: res.data.accessToken,
      mail: res.data.mail,
      isAdmin: res.data.isAdmin,
      isValidated: res.data.isValidated,
      isBannished: res.data.isBannished,
      isSalesman: res.data.isSalesman,
      Nom: res.data.Nom,
      Prenom: res.data.Prenom,
    })
  );
};
