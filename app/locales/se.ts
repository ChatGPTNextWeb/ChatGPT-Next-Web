import { SubmitKey } from "../store/config";

const se = {
  WIP: "Pågår...",
  Error: {
    Unauthorized: "Obehörig åtkomst, ange åtkomstkod på inställningssidan.",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} meddelanden`,
  },
  Chat: {
    SubTitle: (count: number) => `Totalt ${count} meddelanden`,
    Actions: {
      ChatList: "Gå till chattlista",
      CompressedHistory: "Komprimerad historikminnelse",
      Export: "Exportera alla meddelanden som Markdown",
      Copy: "Kopiera",
      Stop: "Stoppa",
      Retry: "Försök igen",
    },
    Rename: "Byt namn på chatt",
    Typing: "Skriver...",
    Input: (submitKey: string) => {
      var inputHints = `Skriv något och tryck på ${submitKey} för att skicka`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", tryck på Skift + Enter för att göra en ny rad";
      }
      return inputHints;
    },
    Send: "Skicka",
  },
  Export: {
    Title: "Alla meddelanden",
    Copy: "Kopiera allt",
    Download: "Ladda ner",
    MessageFromYou: "Meddelande från dig",
    MessageFromChatGPT: "Meddelande från ChatGPT",
  },
  Memory: {
    Title: "Minneshjälp",
    EmptyContent: "Inget än.",
    Send: "Skicka minne",
    Copy: "Kopiera minne",
    Reset: "Återställ session",
    ResetConfirm:
      "Återställning kommer att rensa den aktuella konversationshistoriken och historiska minnet. Är du säker på att du vill återställa?",
  },
  Home: {
    NewChat: "Ny chatt",
    DeleteChat: "Bekräfta att du vill ta bort den valda konversationen?",
    DeleteToast: "Chatt borttagen",
    Revert: "Återgå",
  },
  Settings: {
    Title: "Inställningar",
    SubTitle: "Alla inställningar",
    Actions: {
      ClearAll: "Rensa all data",
      ResetAll: "Återställ alla inställningar",
      Close: "Stäng",
    },
    Lang: {
      Name: "Språk", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      Options: {
        no: "Norsk",
        cn: "简体中文",
        en: "English",
        tw: "繁體中文",
        es: "Español",
        it: "Italiano",
        se: "Svenska",
      },
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Teckenstorlek",
      SubTitle: "Justera teckenstorleken för chattinnehållet",
    },
    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Senaste versionen",
      CheckUpdate: "Kontrollera uppdatering",
      IsChecking: "Kontrollerar uppdatering...",
      FoundUpdate: (x: string) => `Hittade ny version: ${x}`,
      GoToUpdate: "Uppdatera",
    },
    SendKey: "Skicka tangent",
    PrePrompt: "Inledande kontext",
    Theme: "Tema",
    TightBorder: "Tätt gränssnitt",
    SendPreviewBubble: "Förhandsgranska skickad bubbla",
    Prompt: {
      Disable: {
        Title: "Inaktivera automatisk komplettering",
        SubTitle: "Skriv / för att utlösa automatisk komplettering",
      },
      List: "Kompletteringslista",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} inbyggda, ${custom} användardefinierade`,
      Edit: "Redigera",
    },
    HistoryCount: {
      Title: "Antal bifogade meddelanden",
      SubTitle: "Antal skickade meddelanden som bifogas per förfrågan",
    },
    CompressThreshold: {
      Title: "Tröskel för historikkomprimering",
      SubTitle:
        "Komprimeras om längden på okomprimerade meddelanden överskrider värdet",
    },
    Token: {
      Title: "API-nyckel",
      SubTitle: "Använd din nyckel för att ignorera åtkomstbegränsningen",
      Placeholder: "OpenAI API-nyckel",
    },
    Usage: {
      Title: "Kontosaldo",
      SubTitle(used: any, total: any) {
        return `Använt denna månad ${used}, prenumeration ${total}`;
      },
      IsChecking: "Kontrollerar...",
      Check: "Kontrollera igen",
      NoAccess: "Ange API-nyckel för att kontrollera saldo",
    },
    AccessCode: {
      Title: "Åtkomstkod",
      SubTitle: "Åtkomstkontroll aktiverad",
      Placeholder: "Behöver åtkomstkod",
    },
    Context: {
      Title: "Kontext",
      SubTitle: "Ange global kontext",
      Placeholder: "Användarkontext",
    },
    Model: "Språkmodell",
    Temperature: {
      Title: "Temperatur",
      SubTitle: "Ett större värde gör utdata mer slumpmässig",
    },
    MaxTokens: {
      Title: "Maximalt antal token",
      SubTitle: "Maximal längd på inmatade token och genererade token",
    },
    PresencePenlty: {
      Title: "Tillgänglighetsstraff",
      SubTitle: "Ett större värde ökar sannolikheten att prata om nya ämnen",
    },
  },
  Store: {
    DefaultTopic: "Ny konversation",
    BotHello: "Hallå, hur kan jag hjälpa dig idag?",
    Error: "Något gick fel, försök igen senare.",
    Prompt: {
      History: (content: string) =>
        "Detta är en sammanfattning av chattens historik mellan AI:n och användaren som en sammanfattning: " +
        content,
      Topic:
        "Generera en fyra till fem ord lång titel som sammanfattar vår konversation utan något inledande, skiljetecken, citationstecken, punkter, symboler eller annan text. Ta bort inneslutande citationstecken.",
      Summarize:
        "Sammanfatta vår diskussion kortfattat på 200 ord eller mindre för att använda som en påminnelse för framtida kontext.",
    },
    ConfirmClearAll:
      "Bekräfta att du vill rensa all chatt- och inställningsdata?",
  },
  Copy: {
    Success: "Kopierat till urklipp",
    Failed: "Kopiering misslyckades, ge behörighet att komma åt urklipp",
  },
  Context: {
    Toast: (x: any) => `Med ${x} kontextuella ledtrådar`,
    Edit: "Kontextuella och minnesledtrådar",
    Add: "Lägg till en",
  },
};

export type LocaleType = typeof se;

export default se;
