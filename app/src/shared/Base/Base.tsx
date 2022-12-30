import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { fetchUser, setState } from "../../Redux/States/users";

import {
  AtlassianNavigation,
  PrimaryButton,
  ProductHome,
  Profile,
} from "@atlaskit/atlassian-navigation";
import { AtlassianIcon } from "@atlaskit/logo";
import Avatar from "@atlaskit/avatar";
import Badge from "@atlaskit/badge";
import Popup from "@atlaskit/popup";
import EmptyState from "@atlaskit/empty-state";
import { ButtonItem, MenuGroup, Section } from "@atlaskit/menu";

import styles from "./Base.module.scss";
import Connection from "../../pages/Connection/Connection";
import FlagCustom from "../../utils/FlagCustom/FlagCustom";
import { FlagGroup } from "@atlaskit/flag";

interface Props {
  checkingToken: boolean;
  children: React.ReactNode;
  isPopupProfilOpen: boolean;
  setIsPopupSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const Base: React.FC<Props> = ({
  checkingToken,
  isPopupProfilOpen,
  setIsPopupSettingsOpen,
  handleLogout,
  children,
}) => {
  const [isModalConnectionShown, setIsModalConnectionShown] =
    useState<boolean>(true);
  const [isFlagInfoOpen, setIsFlagInfoOpen] = useState<boolean>(false);
  const [isFlagSuccessOpen, setIsFlagSuccessOpen] = useState<boolean>(false);
  const [isFlagWarningOpen, setIsFlagWarningOpen] = useState<boolean>(false);

  const user = useSelector(fetchUser);
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const params = new URLSearchParams(document.location.search);
  const mailParams = params.get("mailValid");

  useEffect(() => {
    setIsModalConnectionShown(!user.isConnected);

    if (user.isConnected) {
      if (!user.isValidated) {
        if (mailParams !== null) {
          setIsFlagWarningOpen(true);
        }
      } else if (user.isValidated) {
        if (mailParams !== null) {
          setIsFlagSuccessOpen(true);
        }
      }
    }
  }, [user.isConnected, mailParams, user.isValidated]);

  const AtlassianProductHome = () => (
    <ProductHome
      icon={AtlassianIcon}
      logo={AtlassianIcon}
      siteTitle={"VPlanner"}
      onClick={() => {
        navigate("/", { replace: true });
      }}
    />
  );

  const DefaultProfile = () => {
    const flNom = user?.Nom && user?.Nom[0];
    const flPrenom = user?.Prenom && user?.Prenom[0];

    return (
      <Popup
        isOpen={isPopupProfilOpen}
        onClose={() => setIsPopupSettingsOpen(false)}
        placement="bottom-end"
        content={() => (
          <MenuGroup
            maxWidth={800}
            minWidth={150}
            onClick={(e) => e.stopPropagation()}
          >
            <Section>
              <ButtonItem
                onClick={() => {
                  navigate("/profile", { replace: true });
                  setIsPopupSettingsOpen(false);
                }}
              >
                Profile
              </ButtonItem>
            </Section>
            <Section>
              <ButtonItem
                onClick={() => {
                  handleLogout();
                }}
              >
                Logout
              </ButtonItem>
            </Section>
          </MenuGroup>
        )}
        trigger={(triggerProps) => (
          <Profile
            {...triggerProps}
            icon={
              flNom && flPrenom ? (
                <div className={styles.badge}>
                  <Badge>{`${flNom}${flPrenom}`.toUpperCase()}</Badge>
                </div>
              ) : (
                <Avatar size="small" />
              )
            }
            onClick={() => {
              setIsPopupSettingsOpen(!isPopupProfilOpen);
            }}
            tooltip=""
          />
        )}
      />
    );
  };

  const navButtons: JSX.Element[] = user.isValidated
    ? [
        <PrimaryButton
          onClick={() => {
            navigate("/reunions", { replace: true });
          }}
        >
          Reunions
        </PrimaryButton>,
      ]
    : [];

  const navButtonsAdmins: JSX.Element[] = user.isAdmin
    ? [
        <PrimaryButton
          onClick={() => {
            navigate("/users", { replace: true });
          }}
        >
          Gestion users
        </PrimaryButton>,
        <PrimaryButton
          onClick={() => {
            navigate("/errors", { replace: true });
          }}
        >
          Logs Error
        </PrimaryButton>,
        <PrimaryButton
          onClick={() => {
            navigate("/moderation", { replace: true });
          }}
        >
          Modérations
        </PrimaryButton>,
        <PrimaryButton
          onClick={() => {
            navigate("/pushMarketing", { replace: true });
          }}
        >
          Marketing Push
        </PrimaryButton>,
      ]
    : [];

  const sendConfirmMail = () => {
    axios
      .post(url + "/users/validateMail", {
        id: user.id,
        mail: user.mail,
      })
      .then(() => {
        setIsFlagInfoOpen(false);
        setIsFlagWarningOpen(false);
      })
      .catch((err) => {
        console.log("debug", err);
      });
  };

  const dismissFlag = (type: string) => {
    switch (type) {
      case "info": {
        setIsFlagInfoOpen(false);
        break;
      }
      case "success": {
        setIsFlagSuccessOpen(false);
        break;
      }
      case "danger": {
        setIsFlagWarningOpen(false);
        break;
      }
    }
  };

  if (user.isBannished) {
    return (
      <EmptyState
        header="Vous avez été banni"
        description="Vous pouvez désormais réfléchir à vos actes et comportements dangereux"
      />
    );
  }

  return (
    <>
      {checkingToken ? (
        <div className={styles.checkingToken}>
          <div>
            Nous sommes entrains de vérifier l&#39;état de votre connexion
          </div>
          <div>Cela peut prendre quelques secondes</div>
        </div>
      ) : isModalConnectionShown ? (
        <Connection />
      ) : (
        <>
          <FlagGroup
            onDismissed={() => {
              dismissFlag("info");
            }}
          >
            {isFlagInfoOpen ? (
              <FlagCustom
                title="Veuillez valider votre compte"
                content="Cliquer sur ce lien pour envoyer le mail de confirmation"
                actions={[
                  {
                    content: "Envoyer mail",
                    onClick: () => {
                      sendConfirmMail();
                    },
                  },
                ]}
                type="info"
              />
            ) : null}
          </FlagGroup>
          <FlagGroup
            onDismissed={() => {
              dismissFlag("success");
            }}
          >
            {isFlagSuccessOpen && (
              <FlagCustom
                title="Votre mail a été validé"
                content="Vous pouvez désormais utiliser toutes les fonctinnalités de l'application"
                actions={[]}
                type="safe"
              />
            )}
          </FlagGroup>
          <FlagGroup
            onDismissed={() => {
              dismissFlag("danger");
            }}
          >
            {isFlagWarningOpen && (
              <FlagCustom
                title="Le lien a expiré"
                content="Cliquer sur ce lien pour renvoyer le mail de confirmation"
                actions={[
                  {
                    content: "Renvoyer mail",
                    onClick: () => {
                      sendConfirmMail();
                    },
                  },
                ]}
                type="danger"
              />
            )}
          </FlagGroup>

          <div className={styles.navBar}>
            <AtlassianNavigation
              label="site"
              primaryItems={[...navButtonsAdmins, ...navButtons]}
              renderProfile={DefaultProfile}
              renderProductHome={AtlassianProductHome}
            />
          </div>

          {children}
        </>
      )}
    </>
  );
};

export default Base;
