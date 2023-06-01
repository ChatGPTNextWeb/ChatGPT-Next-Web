import { useCallback, useEffect, useState } from "react";
import { create } from "zustand";

export interface Access {
  hasAppAccess: boolean;
  hasWhatsappAccess: boolean;
  hasTelegramAccess: boolean;
}

interface AccessState {
  data: undefined | Access;
  error: string | undefined;
  loading: boolean;
  refetching: boolean;
  fetched: boolean;
  update: (values: Partial<AccessState>) => void;
}

const useAccessStore = create<AccessState>((set) => ({
  data: undefined,
  error: undefined,
  loading: false,
  refetching: false,
  fetched: false,
  update: (values) =>
    set((state) => ({
      ...state,
      values,
    })),
}));

export const useAccess = () => {
  const { data, error, fetched, loading, refetching, update } = useAccessStore(
    (store) => store,
  );

  const fetchData = useCallback(
    async (signal?: AbortSignal, refresh?: boolean) => {
      update({
        loading: !refresh,
        refetching: !!refresh,
      });

      try {
        const res = await fetch("/api/plan", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal,
        });

        const data = await res.json();

        update({
          data,
          loading: false,
          refetching: false,
          fetched: true,
        });
      } catch (e: any) {
        if (e.name === "AbortError") {
          update({
            error: undefined,
            loading: false,
            refetching: false,
          });
          return;
        }

        update({
          error: e.message,
          loading: false,
          refetching: false,
        });
      }
    },
    [update],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(
    (signal?: AbortSignal) => {
      fetchData(signal, true);
    },
    [fetchData],
  );

  return {
    data,
    error,
    fetched,
    loading,
    refetching,
    refetch,
  };
};
