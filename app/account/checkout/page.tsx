"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/app/components/loading";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    Chargebee: any;
  }
}

const createSession = (id: string | string[]) => {
  const priceId = Array.isArray(id) ? id[0] : id;

  return fetch(`/api/plan/hosted?id=${priceId}`).then((res) => res.json());
};

const Plans = () => {
  const [loaded, setLoaded] = useState(false);
  const [init, setInit] = useState(false);
  const search = useSearchParams();
  const router = useRouter();

  const id = search.get("id") || "";

  const openCheckout = useCallback(async () => {
    const cbInstance = window.Chargebee.getInstance();

    cbInstance.openCheckout({
      hostedPage: () => createSession(id),
      close: () => {
        router.push("/");
      },
    });
  }, [id, router]);

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
    if (!mountRef.current && init && id) {
      mountRef.current = true;
      openCheckout();
    }
  }, [openCheckout, init, id]);

  if (!id) {
    router.push("/plans");

    return <Loading noLogo />;
  }

  return (
    <>
      <Script
        src="https://js.chargebee.com/v2/chargebee.js"
        onLoad={() => {
          setLoaded(true);
        }}
      />
      <Loading noLogo />
    </>
  );
};

export default Plans;
