"use client";
import { useSwitchTheme } from "../components/home";
import { AuthProvider } from "../providers/auth";
import styles from "./styles.module.scss";

const Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    height="24"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const Products = () => {
  useSwitchTheme();

  return (
    <AuthProvider>
      <div className={styles.container + " " + styles["tight-container"]}>
        <div className={styles.products}>
          <div className={styles.product}>
            <Icon />
            <h2>App</h2>
            <p>Chat with GPT models directly from our app</p>
          </div>
          <div className={styles.product}>
            <Icon />
            <h2>Whatsapp Bot</h2>
            <p>Chat with GPT models directly through our whatsapp bot</p>
          </div>
          <div className={styles.product}>
            <Icon />
            <h2>Telegram Bot</h2>
            <p>Chat with GPT models directly through our telegram bot</p>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Products;
