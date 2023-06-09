import { SubmitKey } from "../store/app";
import { LocaleType } from "./en";

const se: LocaleType = {
  WIP: "Pågår...",
  Error: {
    Unauthorized: "Ubehörig åtkomst, ange tillgångskod på inställningssidan.",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} meddelanden`,
  },
  Chat: {
    SubTitle: (count: number) => `Totalt ${count} meddelanden`,
    Actions: {
      ChatList: "Gå till chat",
      CompressedHistory: "Komprimerad Historia Memory Prompt",
      Export: "Exportera alla meddelanden som Markdown",
      Copy: "Kopiera",
      Stop: "Stopp",
      Retry: "Försök Igen",
    },
    Rename: "Byta Namn på Chatt",
    Typing: "Skriver...",
    Input: (submitKey: string) => {
      var inputHints = `Skriv något och tryck på ${submitKey} för att skicka`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", tryck på Shift + Enter för en ny rad";
      }
      return inputHints;
    },
    Send: "Skicka",
  },
  Export: {
    Title: "Alla Meddelanden",
    Copy: "Kopiera Alla",
    Download: "Ladda Ner",
    MessageFromYou: "Meddelande från Du",
    MessageFromChatGPT: "Meddelande från ChatGPT",
  },
  Memory: {
    Title: "Memory Prompt",
    EmptyContent: "Ingenting än.",
    Send: "Skicka Memory",
    Copy: "Kopiera Memory",
    Reset: "Återställ Session",
    ResetConfirm:
      "Återställningen kommer att rensa hela konversationshistoriken och historiskt minne. Är du säker på att du vill återställa?",
  },
  Home: {
    NewChat: "Ny Chatt",
    DeleteChat: "Bekräfta att du vill ta bort den valda konversationen?",
    DeleteToast: "Chatt Borttagen",
    Revert: "Återgå",
  },
  Settings: {
    Title: "Inställningar",
    SubTitle: "Alla Inställningar",
    Actions: {
      ClearAll: "Rensa All Data",
      ResetAll: "Återställ Alla Inställningar",
      Close: "Stäng",
    },
    Lang: {
      Name: "Språk", // OBS: om du vill lägga till en översättning, översätt inte detta värde, lämna det som 'Language'
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
      SubTitle: "Justera teckenstorlek för chattens innehåll",
    },
    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Senaste versionen",
      CheckUpdate: "Kolla Uppdatering",
      IsChecking: "Kollar uppdatering...",
      FoundUpdate: (x: string) => `Hittade ny version: ${x}`,
      GoToUpdate: "Uppdatering",
    },
    SendKey: "Skicka Nyckel",
    PrePrompt: "Initialt Sammanhang",
    Theme: "Tema",
    TightBorder: "Tät Kant",
    SendPreviewBubble: "Skicka Förhandsgranskningsbubbla",
    Prompt: {
      Disable: {
        Title: "Inaktivera Automatisk Fullbordning",
        SubTitle: "Ange / för att utlösa automatisk fullbordning",
      },
      List: "Prompt Lista",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} inbyggd, ${custom} användardefinierad`,
      Edit: "Redigera",
    },
    HistoryCount: {
      Title: "Antal Meddelanden",
      SubTitle: "Antal skickade meddelanden som bifogas vid varje förfrågan",
    },
    CompressThreshold: {
      Title: "Historisk Komprimeringströskel",
      SubTitle: "Komprimerar om meddelande som är längre än värdet",
    },
    Token: {
      Title: "API-nyckel",
      SubTitle: "Använd din nyckel för att ignorera tillgångskodbegränsningen",
      Placeholder: "OpenAI API-nyckel",
    },
    Usage: {
      Title: "Konto Balans",
      SubTitle(used: any, total: any) {
        return `Använt den här månaden $${used}, prenumeration $${total}`;
      },
      IsChecking: "Kollar...",
      Check: "Kolla Igen",
      NoAccess: "Ange API-nyckeln för att kolla balans",
    },
    AccessCode: {
      Title: "Tillgångskod",
      SubTitle: "Åtkomstkontroll aktiverad",
      Placeholder: "Behöver Tillgångskod",
    },
    Context: {
      Title: "Sammanhang",
      SubTitle: "Ange global sammanhang",
      Placeholder: "Användarsammanhang",
    },
    Model: "Modell",
    Temperature: {
      Title: "Temperatur",
      SubTitle: "Ett större värde ger mer slumpmässigt resultat",
    },
    MaxTokens: {
      Title: "Maximala Tokens",
      SubTitle: "Maximal längd på indata tokens och genererade tokens",
    },
    PresencePenlty: {
      Title: "Närvaroböter",
      SubTitle: "Ett större värde ökar sannolikheten att prata om nya ämnen",
    },
  },
  Store: {
    DefaultTopic: "Ny Konversation",
    BotHello: "Hallaisen, hvordan kan jeg hjelpe deg i dag?",
    Error: "Något gick fel, försök igen senare.",
    Prompt: {
      History: (content: string) =>
        "Detta är en sammanfattning av konversationshistoriken mellan AI och användaren som en sammanfattning: " +
        content,
      Topic:
        "Generera en fyra till fem ord lång titel som sammanfattar vår konversation utan någon ledtråd, skiljetecken, citationstecken, punkter, symboler eller ytterligare text. Ta bort inneslutande citattecken.",
      Summarize:
        "Summera vår diskussion kortfattat i 200 ord eller mindre för att använda som en prompt för framtida sammanhang.",
    },
    ConfirmClearAll:
      "Bekräfta att du vill rensa all chatt- och inställningsdata?",
  },
  Copy: {
    Success: "Kopierat till urklipp",
    Failed: "Kopiering misslyckades, bevilja behörighet att komma åt urklipp",
  },
  Context: {
    Toast: (x: any) => `Med ${x} kontextuella promptar`,
    Edit: "Kontextuella och Memory Promptar",
    Add: "Lägg till en",
  },
};

export default se;
