// added by kfear1337
// this module its for backup/restore all data [settings,chats,mask,prompt]
// it work all auto sync
import { usePromptStore, useMaskStore, useAppConfig, useChatStore, useAccessStore } from './index';
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { showToast } from "../components/ui-lib";
import Locale from "../locales";
import { StoreKey } from "../constant";

export type Backupdata = {
  BackupAllData: () => void; // Added for Export config
  RestoreAllData: (file: File) => Promise<void>; // added for Export config
  lastBackupDate?: string; // New property for storing the last backup date
} 

export const useBackupdata = create<Backupdata>()(
    persist(
      (set) => ({
        BackupAllData: (): void => {
          const data = {
            prompt: usePromptStore.getState(),
            mask: useMaskStore.getState(),
            config: useAppConfig.getState(),
            chat: useChatStore.getState(),
            access: useAccessStore.getState(),
          };
  
          const currentDate = new Date().toISOString().split("T")[0];
          const fileName = `Backup Data chatgpt ${currentDate}.json`;
  
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);

          useBackupdata.setState({ lastBackupDate: currentDate });
        },
  
        RestoreAllData: async (file: File): Promise<void> => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const data = event.target?.result as string;
            try {
              const importedData = JSON.parse(data);
              if (
                importedData.prompt &&
                importedData.mask &&
                importedData.config &&
                importedData.chat &&
                importedData.access
              ) {
                usePromptStore.setState(importedData.prompt);
                useMaskStore.setState(importedData.mask);
                useAppConfig.setState(importedData.config);
                useChatStore.setState(importedData.chat);
                useAccessStore.setState(importedData.access);
        
                // Store the last backup created date from the imported data
                const currentDate = new Date().toISOString().split("T")[0];
                useBackupdata.setState((state) => ({
                  ...state,
                  lastBackupDate: currentDate,
                }));
        
                showToast(Locale.Settings.Toast.ImportedSuccess);
                location.reload(); // when import success it will reload
              } else {
                console.error("[Import Data] Error: Invalid data format");
                showToast(Locale.Settings.Toast.InvalidFormat);
              }
            } catch (error) {
              console.error("[Import Data] Error: ", error);
              showToast(Locale.Settings.Toast.ImportError);
            }
          };
          reader.readAsText(file);
        },        
      }),
      {
        name: StoreKey.Backup,
        version: 1.1, // added last Backup Date when backup created
      },
    ),
  );  