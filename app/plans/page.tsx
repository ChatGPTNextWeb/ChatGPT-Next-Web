"use client";

import { UserButton } from "@clerk/nextjs";
import { IconButton } from "../components/button";
import { useSwitchTheme } from "../components/home";
import styles from "./styles.module.scss";

const Plans = () => {
  useSwitchTheme();

  const onOpen = (id: string) => {
    window.open(`/account/checkout?id=${id}`, "_self");
  }

  return (
    <div className={`${styles.scrollContainer} ${styles["tight-container"]}`}>
      <div className={styles.profileContainer}>
        <UserButton
          signInUrl="/signin"
          userProfileMode="navigation"
          userProfileUrl="/account"
          afterSignOutUrl="https://cognitiev.com"
        />
      </div>
      <div className={styles.container}>
        <h1 className={styles.heading}>Subscribe</h1>
        <div className={styles.planContainer}>
          <div className={styles.plans}>
            <div className={styles.plan}>
              <p className={styles.type}>Monthly</p>
              <h2 className={styles.price}>$19</h2>
              <p className={styles.description}>
                Monthly Plan For Casual User
              </p>
              <IconButton
                onClick={() => {
                  onOpen("app-USD-Monthly");
                }}
                bordered
                className={styles.button}
                text="Subscribe 😘"
              />
            </div>
            
            <div className={`${styles.plan} ${styles["ultimate-value-plan"]}`}>
              <p className={styles.type}>5 YEARLY</p>
              <h2 className={styles.price}>$5/m</h2>
              <p className={styles.description}>
                Ultimate Plan for Prime Users | Billed at just $299/5y
              </p>
              <p className={styles.description}>
                🆓 USE BOTS AT NO EXTRA CHARGES 😲
              </p>
              <IconButton
                onClick={() => {
                  onOpen("app-USD-Every-5-years");
                }}
                bordered
                className={styles.button}
                text="Subscribe 😍"
              />
            </div>
            
            <div className={styles.plan}>
              <p className={styles.type}>Annual</p>
              <h2 className={styles.price}>$12.5/m</h2>
              <p className={styles.description}>
                Yearly Plan For PRO Users | Billed at just $149/y
              </p>
              <IconButton
                onClick={() => {
                  onOpen("app-USD-Yearly");
                }}
                bordered
                className={styles.button}
                text="Subscribe 🥰"
              />
            </div>
          </div>
            
            
          
          <div className={styles.plans}>
            <div className={styles.plan}>
              <p className={styles.type}>ADD-ON</p>
              <h2 className={styles.price}>$9/m</h2>
              <p className={styles.description}>
                WhatsApp Bot
              </p>
            </div>
          
            <div className={styles.plan}>
              <p className={styles.type}>ADD-ON</p>
              <h2 className={styles.price}>$9/m</h2>
              <p className={styles.description}>
                Telegram Bot
              </p>
            </div>
           </div>
      
        </div>
      </div>
    </div>
  );
};

export default Plans;
