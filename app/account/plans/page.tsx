"use client";

import Script from "next/script";
import styles from "./styles.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import openPopup from "../../utils/popup";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Chargebee: any;
  }
}

const createSession = () => {
  return fetch("/api/plan/session").then((res) => res.json());
};

const Plans = () => {
  const [loaded, setLoaded] = useState(false);
  const [init, setInit] = useState(false);
  const router = useRouter();

  const openCheckout = useCallback(async () => {
    const cbInstance = window.Chargebee.getInstance();

    cbInstance.setPortalSession(createSession);

    let cbPortal = cbInstance.createChargebeePortal();
    cbPortal.open({
      close() {
        router.push("/");
      },
    });
  }, [router]);

  useEffect(() => {
    if (loaded && !init) {
      window.Chargebee.init({
        site: process.env.NEXT_PUBLIC_CHARGEBEE_SITE,
        publishableKey: process.env.NEXT_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY,
      });

      setInit(true);
    }
  }, [loaded, init, openCheckout]);
  const mountRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current && init) {
      mountRef.current = true;
      openCheckout();
    }
  }, [openCheckout, init]);

  return (
    <div className={styles.container}>
      <Script
        src="https://js.chargebee.com/v2/chargebee.js"
        onLoad={() => {
          setLoaded(true);
        }}
      />
    </div>
  );
};

export default Plans;
