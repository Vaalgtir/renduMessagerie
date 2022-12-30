import React from "react";

import Flag from "@atlaskit/flag";
import InfoIcon from "@atlaskit/icon/glyph/info";
import WarningIcon from "@atlaskit/icon/glyph/warning";
import SuccessIcon from "@atlaskit/icon/glyph/check-circle";
import { R300, B300, N500, G300 } from "@atlaskit/theme/colors";
import { token } from "@atlaskit/tokens";
import { ActionType } from "@atlaskit/flag/dist/types/types";

interface Props {
  title: string;
  content: string;
  actions: ActionType[];
  type: string;
}

export const FlagCustom: React.FC<Props> = ({
  title,
  content,
  actions,
  type,
}) => {
  const color =
    type === "info"
      ? token("color.icon.information", B300)
      : type === "danger"
      ? token("color.icon.danger", R300)
      : type === "safe"
      ? token("color.icon.success", G300)
      : token("color.background.neutral.bold", N500);

  const icon =
    type === "info" ? (
      <InfoIcon primaryColor={color} label="Info" />
    ) : type === "danger" ? (
      <WarningIcon label="Warning" primaryColor={color} />
    ) : type === "safe" ? (
      <SuccessIcon primaryColor={color} label="Success" />
    ) : (
      <InfoIcon primaryColor={color} label="Info" />
    );

  return (
    <Flag
      icon={icon}
      description={content}
      id="1"
      key="1"
      title={title}
      actions={actions}
    />
  );
};

export default FlagCustom;
