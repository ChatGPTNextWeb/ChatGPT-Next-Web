import { create } from "zustand";

export type AuthStore = {
  isAuthModalVisible: boolean;
  updateAuthModalVisible: (visible: boolean) => void;
  isPayModalVisible: boolean;
  updatePayModalVisible: (visible: boolean) => void;
};

export const authStore = create<AuthStore, []>((set, get) => ({
  isAuthModalVisible: false,
  isPayModalVisible: false,
  updateAuthModalVisible: (visible: boolean) => {
    const auth = get();
    set({ ...auth, isAuthModalVisible: visible });
  },
  updatePayModalVisible: (visible: boolean) => {
    const auth = get();
    set({ ...auth, isPayModalVisible: visible });
  },
}));
