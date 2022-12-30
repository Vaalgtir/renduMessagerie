import React from "react";

import Form, { Field } from "@atlaskit/form";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import axios from "axios";

interface Props {}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const Push: React.FC<Props> = () => {
  const handlePush = (data: any) => {
    axios
      .post(url + "/push/pushMessage", { message: JSON.stringify(data) })
      .catch((err) => {
        console.log("debug", err);
      });
  };

  return (
    <Form onSubmit={handlePush}>
      {({ formProps }) => (
        <form {...formProps}>
          <Field name="push" defaultValue="" label="push" isRequired>
            {({ fieldProps }) => (
              <TextField autoComplete="off" {...fieldProps} />
            )}
          </Field>
          <Field name="title" defaultValue="" label="title" isRequired>
            {({ fieldProps }) => (
              <TextField autoComplete="off" {...fieldProps} />
            )}
          </Field>
          <Button type="submit">Submit</Button>
        </form>
      )}
    </Form>
  );
};
