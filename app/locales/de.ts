import { SubmitKey } from "../store/config";
import type { PartialLocaleType } from "./index";

const de: PartialLocaleType = {
  WIP: "In Bearbeitung...",
  Error: {
    Unauthorized:
      "Unbefugter Zugriff, bitte geben Sie den Zugangscode auf der [Einstellungsseite](/#/auth) ein.",
  },
  Auth: {
    Title: "Zugangscode benötigt",
    Tips: "Bitte geben sie den Zugangscode ein.",
    Input: "Zugangs Code",
    Confirm: "Bestätigen",
    Later: "Später",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} Nachrichten`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} Nachrichten mit ChatGPT`,
    EditMessage: {
      Topic: {
        Title: "Titel",
        SubTitle: "Titel des Chats ändern",
      },
    },
    Actions: {
      ChatList: "Zur Chat-Liste gehen",
      CompressedHistory: "komprimierter Verlauf",
      Export: "Alle Nachrichten als Markdown exportieren",
      Copy: "Kopieren",
      Stop: "Stop",
      Retry: "Wiederholen",
      Pin: "Anheften",
      PinToastContent: "Es wurde eine Nachricht an den Context angeheftet",
      PinToastAction: "Anzeigen",
      Delete: "Löschen",
      Edit: "Bearbeiten",
    },
    Commands: {
      new: "Neuen Chat starten",
      newm: "Neuen Chat mit Persona starten",
      next: "Nächster Chat",
      prev: "Vorheriger Chat",
      clear: "Kontext zurücksetzen",
      del: "Chat löschen",
    },
    InputActions: {
      Stop: "Stop",
      ToBottom: "zur letzen Nachricht",
      Theme: {
        auto: "Auto",
        light: "Helle Farben",
        dark: "Dunkle Farben",
      },
      Prompt: "Prompts",
      Masks: "Personas",
      Clear: "Kontext löschen",
      Settings: "Einstellungen",
    },
    Rename: "Chat umbenennen",
    Typing: "Tippen...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} um zu Senden`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Umschalt + Eingabe für Zeilenumbruch";
      }
      return inputHints + ", / zum Durchsuchen von Prompts";
    },
    Send: "Senden",
    Config: {
      Reset: "Zurücksetzen",
      SaveAs: "Als Persona speichern",
    },
    IsContext: "Kontext Prompt",
  },
  Export: {
    Title: "Alle Nachrichten",
    Copy: "Alles kopieren",
    Download: "Herunterladen",
    MessageFromYou: "Deine Nachricht",
    MessageFromChatGPT: "Nachricht von ChatGPT",
    Share: "Teilen mit ShareGPT",
    Format: {
      Title: "Export Format",
      SubTitle: "Markdown oder PNG Bild",
    },
    IncludeContext: {
      Title: "Kontext einschließen",
      SubTitle: "Export Kontextprompts in eine Persona",
    },
    Steps: {
      Select: "Auswählen",
      Preview: "Vorschau",
    },
    Image: {
      Toast: "Screenshot...",
      Modal: "Langes klicken oder Rechtsklick um Chat als Bild zu speichern",
    },
  },
  Select: {
    Search: "Suche",
    All: "Alles auswählen",
    Latest: "Aktuellste Auswählen",
    Clear: "Löschen",
  },
  Memory: {
    Title: "Verlauf",
    EmptyContent: "Bisher kein Gesprächsverlauf.",
    Send: "Verlauf senden",
    Copy: "Verlauf kopieren",
    Reset: "Sitzung zurücksetzen",
    ResetConfirm:
      "Zurücksetzen löscht den aktuellen Gesprächsverlauf und das Langzeitgedächtnis. Möchten Sie wirklich zurücksetzen?",
  },
  Home: {
    NewChat: "Neuer Chat",
    DeleteChat: "Den ausgewählten Chat wirklich löschen?",
    DeleteToast: "Chat gelöscht",
    Revert: "Zurücksetzen",
    Logout: "Abmelden",
    Login: "Anmelden",
    LoginMessage: "☝️ Um zu chatten, melde dich bitte an! 😊",
  },
  Settings: {
    Title: "Einstellungen",
    SubTitle: "Alle Einstellungen",
    Danger: {
      Reset: {
        Title: "Alle Einstellungen zurücksetzen",
        SubTitle:
          "Alle Einstellungen auf die Standardeinstellungen zurücksetzen",
        Action: "Zurücksetzen",
        Confirm: "Wirklich auf Standardeinstellungen zurücksetzen?",
      },
      Clear: {
        Title: "Alle Daten löschen",
        SubTitle: "Lösche alle Chats und Einstellungen",
        Action: "Löschen",
        Confirm: "Wirklich alle Chats und Einstellungen löschen?",
      },
    },
    Lang: {
      Name: "Sprache", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "Alle Sprachen",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Schriftgröße",
      SubTitle: "Schriftgröße des Chat-Inhalts anpassen",
    },
    InjectSystemPrompts: {
      Title: "Systemprompts einfügen",
      SubTitle:
        "Erzwingt das Hinzufügen eines simulierten systemweiten Prompts von ChatGPT am Anfang der Nachrichtenliste bei jeder Anfrage",
    },
    InputTemplate: {
      Title: "Eingabe Template",
      SubTitle: "Neue Nachrichten werden mit diesem Template gesendet.",
    },

    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Neueste Version",
      CheckUpdate: "Auf Update prüfen",
      IsChecking: "Update wird geprüft...",
      FoundUpdate: (x: string) => `Neue Version gefunden: ${x}`,
      GoToUpdate: "Aktualisieren",
    },
    SendKey: "Nachricht Senden",
    Theme: "Erscheinungsbild",
    TightBorder: "Schmaler Rahmen",
    SendPreviewBubble: {
      Title: "Nachricht als Vorschau-Bubble",
      SubTitle: "Markdown-Vorschau der aktuellen Chat-Nachricht",
    },
    Mask: {
      Splash: {
        Title: "Persona-Startbildschirm",
        SubTitle:
          "Vor dem Start eines neuen Chats einen Startbildschirm anzeigen",
      },
      Builtin: {
        Title: "Vorinstallierte Personas ausblenden",
        SubTitle:
          "Ausblenden der vorinstallierten Personas in der Auswahlliste",
      },
    },
    Prompt: {
      Disable: {
        Title: "Autovervollständigung deaktivieren",
        SubTitle: "Autovervollständigung mit / starten",
      },
      List: "Prompt-Liste",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} integriert, ${custom} benutzerdefiniert`,
      Edit: "Bearbeiten",
      Modal: {
        Title: "Prompt-Liste",
        Add: "Hinzufügen",
        Search: "Suche Prompts",
      },
      EditModal: {
        Title: "Prompt bearbeiten",
      },
    },
    HistoryCount: {
      Title: "Anzahl angehängte Nachrichten",
      SubTitle:
        "Anzahl der pro Anfrage angehängten Nachrichten aus dem Verlauf",
    },
    CompressThreshold: {
      Title: "Schwellenwert für Verlaufskomprimierung",
      SubTitle:
        "Komprimiert den Verlauf, wenn die Länge der unkomprimierten Nachrichten den Wert überschreitet",
    },
    Token: {
      Title: "API-Schlüssel",
      SubTitle:
        "Verwenden Sie Ihren eignen API-Schlüssel, um nicht an das Nutzungslimit gebunden zu sein",
      Placeholder: "API-Schlüssel",
    },
    Usage: {
      Title: "Kontostand",
      SubTitle(used: any, total: any) {
        return `Diesen Monat ausgegeben $${used}, Abonnement $${total}`;
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
    Endpoint: {
      Title: "Endpunkt",
      SubTitle: "Benutzerdefinierter Endpunkt, muß mit http(s):// beginnen",
    },
    CustomModel: {
      Title: "Benutzerdefinierte Modelle",
      SubTitle:
        "Hinzufügen von eigenen, fine-getunten Modellen. Modellnamen sind durch Komma getrennt.",
    },
    Model: "Modell",
    Temperature: {
      Title: "Temperatur",
      SubTitle: "Ein größerer Wert führt zu zufälligeren Antworten",
    },
    TopP: {
      Title: "Top P",
      SubTitle:
        "Ändern sie diesen Werte nicht gleichzeitig mit der Temperatur.",
    },
    MaxTokens: {
      Title: "Max Tokens",
      SubTitle: "Maximale Anzahl der Anfrage- plus Antwort-Token",
    },
    PresencePenalty: {
      Title: "Presence Penalty",
      SubTitle:
        "Ein größerer Wert erhöht die Wahrscheinlichkeit, dass über neue Themen gesprochen wird",
    },
    FrequencyPenalty: {
      Title: "Frequency Penalty",
      SubTitle:
        "Ein größerer Wert verringert die Wahrscheinlichkeit, dass dieselbe Zeile wiederholt wird",
    },
  },
  Store: {
    DefaultTopic: "Neues Gespräch",
    BotHello: "Hallo! Wie kann ich Ihnen heute helfen?",
    Error:
      "Etwas ist schief gelaufen, bitte versuchen Sie es später noch einmal.",
    Prompt: {
      History: (content: string) =>
        "Dies ist eine Zusammenfassung des Chatverlaufs zwischen der KI und dem Benutzer: " +
        content,
      Topic:
        "Thema des Chats, darf aus vier bis fünf Wörtern bestehen und soll diesen Chat zusammenfassen. Nur Buchstaben, keine Sonderzeichen, Satzzeichen, Symbole/Emojis oder zusätzlichen Text.",
      Summarize:
        "Fasse diesen Chat kurz, in 200 Wörtern oder weniger, zusammen. Die Zusammenfassung sollte so beschrieben sein, das sie als Prompt für zukünftige Chats verwendet werden kann.",
    },
  },
  Copy: {
    Success: "In die Zwischenablage kopiert",
    Failed:
      "Kopieren fehlgeschlagen, bitte geben Sie die Berechtigung zum Zugriff auf die Zwischenablage frei",
  },
  Context: {
    Toast: (x: any) => `Mit ${x} Kontext-Prompts`,
    Edit: "Kontext und Verlauf",
    Add: "Hinzufügen",
    Clear: "Kontext gelöscht",
    Revert: "Rückgängig machen",
  },
  Plugin: {
    Name: "Plugin",
  },
  Mask: {
    Name: "Persona",
    Page: {
      Title: "Prompt Template",
      SubTitle: (count: number) => `${count} prompt templates`,
      Search: "Templates suchen",
      Create: "Anlegen",
    },
    Item: {
      Info: (count: number) => `${count} prompts`,
      Chat: "Chat",
      View: "Anzeigen",
      Edit: "Bearbeiten",
      Delete: "Löschen",
      DeleteConfirm: "Wirklich löschen?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Prompt Template bearbeiten ${readonly ? "(schreibgeschützt)" : ""}`,
      Download: "Download",
      Clone: "Duplizieren",
    },
    Config: {
      Avatar: "Bot Avatar",
      Name: "Bot Name",
      Sync: {
        Title: "Globale Konfiguration",
        SubTitle: "Globale Konfiguration für diesen Chat übernehmen",
        Confirm: "Wirklich globale Konfiguration übernehmen?",
      },
      HideContext: {
        Title: "Kontextprompts ausblenden",
        SubTitle: "Kontextabhängige Prompts im Chat nicht anzeigen",
      },
      Share: {
        Title: "Persona teilen",
        SubTitle: "Generiere einen Link für diese Persona",
        Action: "Link kopieren",
      },
    },
  },
  NewChat: {
    Return: "Zurück",
    Skip: "Überspringen",
    Title: "Persona wählen",
    SubTitle:
      "Eine Persona enthält eine Rollenbeschreibung für deinen Bot und einen vordefinierten Prompt.",
    More: "Weitere finden",
    NotShow: "Nicht nochmal anzeigen",
    ConfirmNoShow:
      "Wirklich deaktivieren? Du kannst diese Einstellung später wieder aktivieren.",
  },

  UI: {
    Confirm: "Bestätigen",
    Cancel: "Abbrechen",
    Close: "Schließen",
    Create: "Anlegen",
    Edit: "Bearbeiten",
  },
  Exporter: {
    Model: "Modell",
    Messages: "Nachrichten",
    Topic: "Thema",
    Time: "Zeit",
  },

  URLCommand: {
    Code: "Zugangscode-URL erkannt. Zugangscode übernehmen?",
    Settings: "Konfigurations-URL erkannt. Konfiguration aus URL übernehmen?",
  },
};

export default de;
