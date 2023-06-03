"use client";

import { UserButton } from "@clerk/nextjs";
import { IconButton } from "../components/button";
import { useSwitchTheme } from "../components/home";
import styles from "./styles.module.scss";

const Plans = () => {
  useSwitchTheme();

  const onOpen = (id: string) => {
    window.open(`/account/checkout?id=${id}`, "_self");
  };

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
        <h1 className={styles.heading}>SUBSCRIBE NOW</h1>
        <div className={styles.planContainer}>
          <div className={styles.plans}>
            <div className={styles.plan}>
              <p className={styles.type}>Manage Subscription</p>
              <h2 className={styles.price}>Manage</h2>
              <p className={styles.description}>
                Manage everything regarding your subscription with a state of the art Self Serve Portal.
              </p>
              <IconButton
                onClick={() => {
                  onOpen("portal");
                }}
                bordered
                className={styles.button}
                text="Manage"
              />
            </div>
            
            <div className={styles.plan}>
              <p className={styles.type}>Monthly</p>
              <h2 className={styles.price}>$19</h2>
              <p className={styles.description}>
                Monthly Plan For Casual Users
                This plan is perfect for those who want to test the waters and experience our top-notch AI solutions.
                You'll get:
                  + Unlimited access to our AI chatbot, Cognitiev PRO
                  + Regular updates and improvements
                  + Flexibility to cancel anytime
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
              <h2 className={styles.price}>$149</h2>
              <p className={styles.description}>
                Yearly Plan For PRO Users With Extra Savings
                Upgrade to our annual plan and save big! You'll get everything in the Monthly Plan, plus:
                  + Save over 35% compared to the monthly plan
                  + Access to the Telegram and WhatsApp bots
                  + Exclusive offers and discounts on future products and services
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
              <p className={styles.type}>5 YEARLY</p>
              <h2 className={styles.price}>$299</h2>
              <p className={styles.description}>
                Ultimate Plan for Prime Users
                Get the best value with our 5-Year Plan and enjoy Cognitiev PRO's AI capabilities for the long haul!
                You'll get everything in the Annual Plan, plus:
                  + Save over 60% compared to the monthly plan
                  + Telegram and WhatsApp bots as a FREE add-on
                  + VIP access to new features and beta testing
                  + Exclusive connects and learning materials
              </p>
              <IconButton
                onClick={() => {
                  onOpen("app-USD-Every-5-years");
                }}
                bordered
                className={styles.button}
                text="Subsribe"
              />
            </div>
          </div>
          <div className={styles.addonsContainer}>
            <h2>Available Add-Ons</h2>
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
