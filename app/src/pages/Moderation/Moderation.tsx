import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../../Redux/States/users";
import { User } from "../Messagerie/Messagerie";

import styles from "./Moderation.module.scss";
import Report from "./Report/Report";

interface Props {}

export interface ReportType {
  _id: string;
  justification: string;
  message: string;
  userReported: number;
  userReporting: number;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const Moderation: React.FC<Props> = () => {
  const [reports, setReports] = useState<ReportType[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const userConnected = useSelector(fetchUser);
  const navigate = useNavigate();

  const fetchAllReports = () => {
    axios.post(url + "/moderation/fetchAllReports").then((res) => {
      setReports(res.data.reports);
    });
  };

  const fetchAllUsers = () => {
    axios.post(url + "/users/fetchAll").then((res) => {
      setUsers(res.data);
    });
  };

  useEffect(() => {
    if (userConnected.isAdmin) {
      fetchAllReports();
      fetchAllUsers();
    } else {
      navigate("/", { replace: true });
    }
  }, [userConnected, navigate]);

  return (
    <div className={styles.view}>
      <table>
        <tr>
          <th>Auteur</th>
          <th>Message</th>
          <th>Reporté par</th>
          <th>Justification</th>
        </tr>

        {reports.map((report) => {
          const userReported = users.find(
            (user) => parseInt(user.id) === report.userReported
          );
          const userReporting = users.find(
            (user) => parseInt(user.id) === report.userReporting
          );
          return (
            <Report
              userReported={userReported}
              userReporting={userReporting}
              report={report}
              reports={reports}
              setReports={setReports}
            />
          );
        })}
      </table>
    </div>
  );
};

export default Moderation;
