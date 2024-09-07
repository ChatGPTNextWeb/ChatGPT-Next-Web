import {
  ChatSession,
  useAccessStore,
  useAppConfig,
  useChatStore,
} from "../store";
import { useMaskStore } from "../store/mask";
import { usePromptStore } from "../store/prompt";
import { StoreKey } from "../constant";
import { merge } from "./merge";
import { removeOutdatedEntries } from "@/app/utils";

type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];
type NonFunctionFields<T> = Pick<T, NonFunctionKeys<T>>;

export function getNonFunctionFileds<T extends object>(obj: T) {
  const ret: any = {};

  Object.entries(obj).map(([k, v]) => {
    if (typeof v !== "function") {
      ret[k] = v;
    }
  });

  return ret as NonFunctionFields<T>;
}

export type GetStoreState<T> = T extends { getState: () => infer U }
  ? NonFunctionFields<U>
  : never;

const LocalStateSetters = {
  [StoreKey.Chat]: useChatStore.setState,
  [StoreKey.Access]: useAccessStore.setState,
  [StoreKey.Config]: useAppConfig.setState,
  [StoreKey.Mask]: useMaskStore.setState,
  [StoreKey.Prompt]: usePromptStore.setState,
} as const;

const LocalStateGetters = {
  [StoreKey.Chat]: () => getNonFunctionFileds(useChatStore.getState()),
  [StoreKey.Access]: () => getNonFunctionFileds(useAccessStore.getState()),
  [StoreKey.Config]: () => getNonFunctionFileds(useAppConfig.getState()),
  [StoreKey.Mask]: () => getNonFunctionFileds(useMaskStore.getState()),
  [StoreKey.Prompt]: () => getNonFunctionFileds(usePromptStore.getState()),
} as const;

export type AppState = {
  [k in keyof typeof LocalStateGetters]: ReturnType<
    (typeof LocalStateGetters)[k]
  >;
};

type Merger<T extends keyof AppState, U = AppState[T]> = (
  localState: U,
  remoteState: U,
) => U;

type StateMerger = {
  [K in keyof AppState]: Merger<K>;
};

// we merge remote state to local state
const MergeStates: StateMerger = {
  [StoreKey.Chat]: (localState, remoteState) => {
    // merge sessions
    const currentSession = useChatStore.getState().currentSession();

    const localSessions: Record<string, ChatSession> = {};
    const localDeletedSessionIds = localState.deletedSessionIds || {};
    localState.sessions.forEach((s) => (localSessions[s.id] = s));

    remoteState.sessions.forEach((remoteSession) => {
      // skip empty chats
      if (remoteSession.messages.length === 0) return;

      const localSession = localSessions[remoteSession.id];
      if (!localSession) {
        // if remote session is new, just merge it
        if (
          (localDeletedSessionIds[remoteSession.id] || -1) <
          remoteSession.lastUpdate
        ) {
          localState.sessions.push(remoteSession);
        }
      } else {
        // if both have the same session id, merge the messages
        const localMessageIds = new Set(localSession.messages.map((v) => v.id));
        const localDeletedMessageIds = localSession.deletedMessageIds || {};
        remoteSession.messages.forEach((m) => {
          if (!localMessageIds.has(m.id)) {
            if (
              !localDeletedMessageIds[m.id] ||
              new Date(localDeletedMessageIds[m.id]).toLocaleString() < m.date
            ) {
              localSession.messages.push(m);
            }
          }
        });

        const remoteDeletedMessageIds = remoteSession.deletedMessageIds || {};
        localSession.messages = localSession.messages.filter((localMessage) => {
          return (
            !remoteDeletedMessageIds[localMessage.id] ||
            new Date(localDeletedMessageIds[localMessage.id]).toLocaleString() <
              localMessage.date
          );
        });

        // sort local messages with date field in asc order
        localSession.messages.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        localSession.lastUpdate = Math.max(
          remoteSession.lastUpdate,
          localSession.lastUpdate,
        );

        const deletedMessageIds = {
          ...remoteDeletedMessageIds,
          ...localDeletedMessageIds,
        };
        removeOutdatedEntries(deletedMessageIds);
        localSession.deletedMessageIds = deletedMessageIds;
      }
    });

    const remoteDeletedSessionIds = remoteState.deletedSessionIds || {};

    const finalIds: Record<string, any> = {};
    localState.sessions = localState.sessions.filter((localSession) => {
      // 去除掉重复的会话
      if (finalIds[localSession.id]) {
        return false;
      }
      finalIds[localSession.id] = true;

      // 去除掉非首个空会话，避免多个空会话在中间，不方便管理
      if (
        localSession.messages.length === 0 &&
        localSession != localState.sessions[0]
      ) {
        return false;
      }

      // 去除云端删除并且删除时间小于本地修改时间的会话
      return (
        (remoteDeletedSessionIds[localSession.id] || -1) <=
        localSession.lastUpdate
      );
    });

    // sort local sessions with date field in desc order
    localState.sessions.sort(
      (a, b) =>
        new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime(),
    );

    const deletedSessionIds = {
      ...remoteDeletedSessionIds,
      ...localDeletedSessionIds,
    };
    removeOutdatedEntries(deletedSessionIds);
    localState.deletedSessionIds = deletedSessionIds;

    localState.currentSessionIndex = localState.sessions.findIndex(
      (session) => {
        return session && currentSession && session.id === currentSession.id;
      },
    );

    return localState;
  },
  [StoreKey.Prompt]: (localState, remoteState) => {
    localState.prompts = {
      ...remoteState.prompts,
      ...localState.prompts,
    };
    return localState;
  },
  [StoreKey.Mask]: (localState, remoteState) => {
    localState.masks = {
      ...remoteState.masks,
      ...localState.masks,
    };
    return localState;
  },
  [StoreKey.Config]: mergeWithUpdate<AppState[StoreKey.Config]>,
  [StoreKey.Access]: mergeWithUpdate<AppState[StoreKey.Access]>,
};

export function getLocalAppState() {
  const appState = Object.fromEntries(
    Object.entries(LocalStateGetters).map(([key, getter]) => {
      return [key, getter()];
    }),
  ) as AppState;

  return appState;
}

export function setLocalAppState(appState: AppState) {
  Object.entries(LocalStateSetters).forEach(([key, setter]) => {
    setter(appState[key as keyof AppState]);
  });
}

export function mergeAppState(localState: AppState, remoteState: AppState) {
  Object.keys(localState).forEach(<T extends keyof AppState>(k: string) => {
    const key = k as T;
    const localStoreState = localState[key];
    const remoteStoreState = remoteState[key];
    MergeStates[key](localStoreState, remoteStoreState);
  });

  return localState;
}

/**
 * Merge state with `lastUpdateTime`, older state will be override
 */
export function mergeWithUpdate<T extends { lastUpdateTime?: number }>(
  localState: T,
  remoteState: T,
) {
  const localUpdateTime = localState.lastUpdateTime ?? 0;
  const remoteUpdateTime = remoteState.lastUpdateTime ?? 1;

  if (localUpdateTime >= remoteUpdateTime) {
    merge(remoteState, localState);
    return { ...remoteState };
  } else {
    merge(localState, remoteState);
    return { ...localState };
  }
}
