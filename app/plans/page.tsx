"use client";

import { IconButton } from "../components/button";
import { useSwitchTheme } from "../components/home";
import styles from "./styles.module.scss";

const mainContainer = styles.scrollContainer + " " + styles["tight-container"];
const Plans = () => {
  useSwitchTheme();

  const onOpen = (id: string) => {
    window.open(`/account/checkout?id=${id}`, "_self");
  };

  return (
    <div className={mainContainer}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Plans</h1>
        <div className={styles.planContainer}>
          <div className={styles.plans}>
            <div className={styles.plan}>
              <p className={styles.type}>Monthly</p>
              <h2 className={styles.price}>$19</h2>
              <p className={styles.description}>
                Monthly Plan For Casual Users
              </p>
              <IconButton
                onClick={() => {
                  onOpen("app-USD-Monthly");
                }}
                bordered
                className={styles.button}
                text="Subsribe"
              />
            </div>
            <div className={styles.plan}>
              <p className={styles.type}>Annual</p>
              <h2 className={styles.price}>$159</h2>
              <p className={styles.description}>
                Yearly Plan For Extra Savings
              </p>
              <IconButton
                onClick={() => {
                  onOpen("app-USD-Yearly");
                }}
                bordered
                className={styles.button}
                text="Subsribe"
              />
            </div>
            <div className={styles.plan}>
              <p className={styles.type}>LIFETIME</p>
              <h2 className={styles.price}>$299</h2>
              <p className={styles.description}>Single Onetime Payment</p>
              <IconButton
                onClick={() => {
                  onOpen("app-USD-Lifetime");
                }}
                bordered
                className={styles.button}
                text="Subsribe"
              />
            </div>
          </div>
          <div className={styles.addonsContainer}>
            <h2>Buy These with</h2>
            <div className={styles.addons}>
              <div className={styles.addon}>
                <h2 className={styles.price}>$9</h2>
                <p className={styles.description}>Whatsapp Bot</p>
              </div>
              <div className={styles.addon}>
                <h2 className={styles.price}>$9</h2>
                <p className={styles.description}>Telegram Bot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
