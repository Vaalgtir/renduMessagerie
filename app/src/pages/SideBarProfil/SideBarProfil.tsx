import { HORIZONTAL_GLOBAL_NAV_HEIGHT } from "@atlaskit/atlassian-navigation";
import {
  ButtonItem,
  Header,
  NavigationContent,
  NavigationHeader,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../../Redux/States/users";

import styles from "./SideBarProfil.module.scss";

interface Props {
  page: string;
}

export const SideBarProfil: React.FC<Props> = ({ page }) => {
  const user = useSelector(fetchUser);
  const navigate = useNavigate();

  return (
    <div
      className={styles.leftNav}
      style={{ minHeight: `calc(100vh - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)` }}
    >
      <div>
        <SideNavigation label="project">
          <NavigationHeader>
            <Header>{`${user.Prenom} ${user.Nom}`}</Header>
          </NavigationHeader>
          <NavigationContent showTopScrollIndicator>
            <Section>
              <ButtonItem
                isSelected={page === "info perso"}
                onClick={() => {
                  navigate("/profile", { replace: true });
                }}
              >
                Info Personnelles
              </ButtonItem>
            </Section>
          </NavigationContent>
        </SideNavigation>
      </div>
    </div>
  );
};

export default SideBarProfil;
