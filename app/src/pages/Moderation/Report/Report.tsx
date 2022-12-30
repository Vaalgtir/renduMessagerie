import React, { useEffect, useState } from "react";
import { User } from "../../Messagerie/Messagerie";
import { ReportType } from "../Moderation";

import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button";

import styles from "./Report.module.scss";
import axios from "axios";

interface Props {
  userReported?: User;
  userReporting?: User;
  report: ReportType;
  reports: ReportType[];
  setReports: React.Dispatch<React.SetStateAction<ReportType[]>>;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const Report: React.FC<Props> = ({
  userReported,
  userReporting,
  report,
  reports,
  setReports,
}) => {
  const [isModalReportOpen, setIsModalReportOpen] = useState<boolean>(false);
  const [numberReports, setNumberReports] = useState<number>(0);
  const [numberUsers, setNumberUsers] = useState<number>(0);
  const [averageReports, setAverageReports] = useState<number>(0);
  const [otherMessages, setOtherMessages] = useState<
    { message: string; justification: string }[]
  >([]);

  useEffect(() => {
    let sum = 0;
    let sumUsers = 0;
    let averageArray: { userReporting: number; sum: number }[] = [];
    let reportedMessages: { message: string; justification: string }[] = [];

    reports.map((reportDetail) => {
      if (reportDetail.userReported === report.userReported) {
        sum++;
        reportedMessages.push({
          message: reportDetail.message,
          justification: reportDetail.justification,
        });

        const index = averageArray.findIndex(
          (item) => item.userReporting === reportDetail.userReporting
        );
        if (index !== -1) {
          averageArray[index].sum++;
        } else {
          sumUsers++;
          averageArray.push({
            userReporting: reportDetail.userReporting,
            sum: 1,
          });
        }
      }
      return null;
    });

    let sumAverage = 0;
    averageArray.map((item) => {
      sumAverage += item.sum;
      return null;
    });

    setAverageReports(sumAverage / averageArray.length);
    setNumberReports(sum);
    setOtherMessages(reportedMessages);
    setNumberUsers(sumUsers);
  }, [averageReports, numberReports, report.userReported, reports]);

  const treateReport = () => {
    axios
      .put(url + "/moderation/treateReport", { reportId: report._id })
      .then((res) => {
        setReports(res.data.reports);
      });
  };

  const bannishUser = () => {
    axios
      .put(url + "/moderation/bannishUser", {
        userId: report.userReported,
      })
      .then((res) => {
        setReports(res.data.reports);
      });
  };

  return (
    <>
      <tr
        className={styles.tr}
        onClick={() => {
          setIsModalReportOpen(true);
        }}
      >
        <td>{`${userReported?.nom} ${userReported?.prenom}`}</td>
        <td>{report.message}</td>
        <td>{`${userReporting?.nom} ${userReporting?.prenom}`}</td>
        <td>{report.justification}</td>
      </tr>

      <ModalTransition>
        {isModalReportOpen && (
          <Modal
            onClose={() => {
              setIsModalReportOpen(false);
            }}
          >
            <ModalHeader>
              <ModalTitle>
                Détails de l'utilisateur :{" "}
                {`${userReported?.nom} ${userReported?.prenom}`}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className={styles.analytics}>
                <div className={styles.sum}>
                  Nombre de reports : <span>{numberReports}</span>
                </div>
                <div className={styles.sumUsers}>
                  Nombre d'utilisateurs reportant : <span>{numberUsers}</span>
                </div>
                <div className={styles.average}>
                  Moyenne des reports / Utilisateurs :{" "}
                  <span>{averageReports}</span>
                </div>
              </div>
              <div className={styles.messagesContainer}>
                <h2>Autres messages reportés de cet utilisateur</h2>

                <table>
                  <tr>
                    <th>Message</th>
                    <th>Justification</th>
                  </tr>
                  {otherMessages.map((message) => (
                    <tr>
                      <td>{message.message}</td>
                      <td>{message.justification}</td>
                    </tr>
                  ))}
                </table>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                appearance="subtle"
                onClick={() => {
                  setIsModalReportOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  treateReport();
                  setIsModalReportOpen(false);
                }}
                autoFocus
              >
                Sans Suite
              </Button>
              <Button
                appearance="danger"
                onClick={() => {
                  bannishUser();
                  setIsModalReportOpen(false);
                }}
                autoFocus
              >
                Bannir
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </>
  );
};

export default Report;
