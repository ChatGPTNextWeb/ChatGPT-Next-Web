import { SubmitKey } from "../store/app";
import type { LocaleType } from "./index";

const de: LocaleType = {
  WIP: "In Bearbeitung...",
  Error: {
    Unauthorized:
      "Unbefugter Zugriff, bitte geben Sie den Zugangscode auf der Einstellungsseite ein.",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} Nachrichten`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} Nachrichten mit ChatGPT`,
    Actions: {
      ChatList: "Zur Chat-Liste gehen",
      CompressedHistory: "Komprimierter VerlaufsGedächtnis-Prompt",
      Export: "Alle Nachrichten als Markdown exportieren",
      Copy: "Kopieren",
      Stop: "Stop",
      Retry: "Wiederholen",
    },
    Rename: "Chat umbenennen",
    Typing: "Tippen...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} zum Senden`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Umschalt + Eingabe zum Zeilenumbruch";
      }
      return inputHints + ", / zum Durchsuchen von Prompts";
    },
    Send: "Senden",
  },
  Export: {
    Title: "Alle Nachrichten",
    Copy: "Alles kopieren",
    Download: "Herunterladen",
    MessageFromYou: "Deine Nachricht",
    MessageFromChatGPT: "Nachricht von ChatGPT",
  },
  Memory: {
    Title: "Gedächtnis-Prompt",
    EmptyContent: "Noch nichts.",
    Send: "Gedächtnis senden",
    Copy: "Gedächtnis kopieren",
    Reset: "Sitzung zurücksetzen",
    ResetConfirm:
      "Das Zurücksetzen löscht den aktuellen Gesprächsverlauf und das Langzeit-Gedächtnis. Möchten Sie wirklich zurücksetzen?",
  },
  Home: {
    NewChat: "Neuer Chat",
    DeleteChat: "Bestätigen Sie, um das ausgewählte Gespräch zu löschen?",
    DeleteToast: "Chat gelöscht",
    Revert: "Zurücksetzen",
  },
  Settings: {
    Title: "Einstellungen",
    SubTitle: "Alle Einstellungen",
    Actions: {
      ClearAll: "Alle Daten löschen",
      ResetAll: "Alle Einstellungen zurücksetzen",
      Close: "Schließen",
      ConfirmResetAll: {
        Confirm: "Möchten Sie wirklich alle Konfigurationen zurücksetzen?",
      },
      ConfirmClearAll: {
        Confirm: "Möchten Sie wirklich alle Chats zurücksetzen?",
      },
    },
    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      Options: {
        cn: "简体中文",
        en: "English",
        tw: "繁體中文",
        es: "Español",
        it: "Italiano",
        tr: "Türkçe",
        jp: "日本語",
        de: "Deutsch",
      },
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Schriftgröße",
      SubTitle: "Schriftgröße des Chat-Inhalts anpassen",
    },
    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Neueste Version",
      CheckUpdate: "Update prüfen",
      IsChecking: "Update wird geprüft...",
      FoundUpdate: (x: string) => `Neue Version gefunden: ${x}`,
      GoToUpdate: "Aktualisieren",
    },
    SendKey: "Sendetaste",
    Theme: "Thema",
    TightBorder: "Enge Grenze",
    SendPreviewBubble: "Vorschau-Bubble senden",
    Prompt: {
      Disable: {
        Title: "Autovervollständigung deaktivieren",
        SubTitle: "Autovervollständigung mit / starten",
      },
      List: "Prompt-Liste",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} integriert, ${custom} benutzerdefiniert`,
      Edit: "Bearbeiten",
    },
    HistoryCount: {
      Title: "Anzahl der angehängten Nachrichten",
      SubTitle: "Anzahl der pro Anfrage angehängten gesendeten Nachrichten",
    },
    CompressThreshold: {
      Title: "Schwellenwert für Verlaufskomprimierung",
      SubTitle:
        "Wird komprimiert, wenn die Länge der unkomprimierten Nachrichten den Wert überschreitet",
    },
    Token: {
      Title: "API-Schlüssel",
      SubTitle:
        "Verwenden Sie Ihren Schlüssel, um das Zugangscodelimit zu ignorieren",
      Placeholder: "OpenAI API-Schlüssel",
    },
    Usage: {
      Title: "Kontostand",
      SubTitle(used: any, total: any) {
        return `Diesen Monat verwendet $${used}, Abonnement $${total}`;
      },
      IsChecking: "Wird überprüft...",
      Check: "Erneut prüfen",
      NoAccess: "API-Schlüssel eingeben, um den Kontostand zu überprüfen",
    },
    AccessCode: {
      Title: "Zugangscode",
      SubTitle: "Zugangskontrolle aktiviert",
      Placeholder: "Zugangscode erforderlich",
    },
    Model: "Modell",
    Temperature: {
      Title: "Temperature", //Temperatur
      SubTitle: "Ein größerer Wert führt zu zufälligeren Antworten",
    },
    MaxTokens: {
      Title: "Max Tokens", //Maximale Token
      SubTitle: "Maximale Anzahl der Anfrage- plus Antwort-Token",
    },
    PresencePenlty: {
      Title: "Presence Penalty", //Anwesenheitsstrafe
      SubTitle:
        "Ein größerer Wert erhöht die Wahrscheinlichkeit, dass über neue Themen gesprochen wird",
    },
  },
  Store: {
    DefaultTopic: "Neues Gespräch",
    BotHello: "Hallo! Wie kann ich Ihnen heute helfen?",
    Error:
      "Etwas ist schief gelaufen, bitte versuchen Sie es später noch einmal.",
    Prompt: {
      History: (content: string) =>
        "Dies ist eine Zusammenfassung des Chatverlaufs zwischen dem KI und dem Benutzer als Rückblick: " +
        content,
      Topic:
        "Bitte erstellen Sie einen vier- bis fünfwörtigen Titel, der unser Gespräch zusammenfasst, ohne Einleitung, Zeichensetzung, Anführungszeichen, Punkte, Symbole oder zusätzlichen Text. Entfernen Sie Anführungszeichen.",
      Summarize:
        "Fassen Sie unsere Diskussion kurz in 200 Wörtern oder weniger zusammen, um sie als Pronpt für zukünftige Gespräche zu verwenden.",
    },
    ConfirmClearAll:
      "Bestätigen Sie, um alle Chat- und Einstellungsdaten zu löschen?",
  },
  Copy: {
    Success: "In die Zwischenablage kopiert",
    Failed:
      "Kopieren fehlgeschlagen, bitte geben Sie die Berechtigung zum Zugriff auf die Zwischenablage frei",
  },
  Context: {
    Toast: (x: any) => `Mit ${x} kontextbezogene Prompts`,
    Edit: "Kontextbezogene und Gedächtnis-Prompts",
    Add: "Hinzufügen",
  },
};

export default de;
