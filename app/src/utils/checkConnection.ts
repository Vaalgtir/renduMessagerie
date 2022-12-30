import axios from "axios";

interface res {
  id: number;
  username: string;
  mail: string;
  Nom: string;
  Prenom: string;
  isAdmin: boolean;
  isValidated: boolean;
  isBannished: boolean;
  isSalesman: boolean;
  exp: number;
  isConnected: boolean;
}

export const validate: () => Promise<res> = () => {
  const token = localStorage.getItem("TOKEN");

  const url =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_URL_PROD
      : process.env.REACT_APP_URL_DEV;

  return new Promise((succes, fail) => {
    if (token) {
      axios
        .post(url + "/users/validateToken", {
          token: token,
        })
        .then((res) => {
          succes(res.data);
        })
        .catch(() => {
          fail({
            isConnected: false,
            id: 0,
            username: "",
            Nom: "",
            Prenom: "",
            isAdmin: false,
            exp: 0,
          });
        });
    } else {
      fail({
        isConnected: false,
        id: 0,
        username: "",
        Nom: "",
        Prenom: "",
        isAdmin: false,
        exp: 0,
      });
    }
  });
};

export default validate;
