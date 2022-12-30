import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";

import { fetchUser } from "../../../../Redux/States/users";

import InlineDialog from "@atlaskit/inline-dialog";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Form, { Field } from "@atlaskit/form";

import styles from "./Message.module.scss";
import axios from "axios";

interface Props {
  message: {
    owner: number;
    message: string;
    _id: string;
  };
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const Message: React.FC<Props> = ({ message }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isModalReportOpen, setIsModalReportOpen] = useState<boolean>(false);
  const [messageIdReport, setMessageIdReport] = useState("");

  const userConnected = useSelector(fetchUser);

  const isMessageMine = userConnected.id === message.owner;

  const reportMessage = (data: any) => {
    axios
      .post(url + "/conversations/reportMessage", {
        ...data,
        messageId: messageIdReport,
      })
      .then((res) => {
        setMessageIdReport("");
        setIsModalReportOpen(false);
      });
  };

  return (
    <>
      <div
        className={styles.wrapperMessage}
        data-mine={isMessageMine}
        onClick={() => {
          !isMessageMine && setIsDialogOpen(!isDialogOpen);
        }}
      >
        <InlineDialog
          onClose={() => {
            setIsDialogOpen(false);
          }}
          content={
            <Button
              appearance="subtle"
              onClick={() => {
                setMessageIdReport(message._id);
                setIsModalReportOpen(true);
              }}
            >
              Report
            </Button>
          }
          isOpen={isDialogOpen}
          placement={"bottom-start"}
        >
          <div className={styles.message}>{message.message}</div>
        </InlineDialog>
      </div>

      <ModalTransition>
        {isModalReportOpen && (
          <Modal
            onClose={() => {
              setIsModalReportOpen(false);
            }}
          >
            <Form
              onSubmit={(data: { friend: { value: string } }) => {
                reportMessage(data);
              }}
            >
              {({ formProps }) => (
                <form id="form-with-id" {...formProps}>
                  <ModalHeader>
                    <ModalTitle>Report message</ModalTitle>
                  </ModalHeader>

                  <ModalBody>
                    <Field aria-required={true} name="justification" isRequired>
                      {({ fieldProps }) => (
                        <Fragment>
                          <TextField
                            className={styles.input}
                            autoComplete="off"
                            {...fieldProps}
                          />
                        </Fragment>
                      )}
                    </Field>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      onClick={() => {
                        setIsModalReportOpen(false);
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
          </Modal>
        )}
      </ModalTransition>
    </>
  );
};

export default Message;
