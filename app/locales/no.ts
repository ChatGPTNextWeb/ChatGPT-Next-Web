import { SubmitKey } from "../store/config";
import type { PartialLocaleType } from "./index";

const no: PartialLocaleType = {
  WIP: "Under arbeid…",
  Error: {
    Unauthorized:
      "Uautorisert tilgang. Vennligst oppgi tilgangskode under 'Innstillinger'.",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} meldinger`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} meldinger med VariantGPT`,
    Actions: {
      ChatList: "Gå til samtalelisten",
      CompressedHistory: "Komprimert historikk for instrukser",
      Export: "Eksporter alle meldinger i markdown-format",
      Copy: "Kopier",
      Stop: "Stopp",
      Retry: "Prøv igjen",
      Delete: "Slett",
    },
    Rename: "Gi samtale nytt navn",
    Typing: "Skriver …",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} for å sende`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter for å omgi";
      }
      return inputHints + ", / for å søke instrukser";
    },
    Send: "Send",
  },
  Export: {
    Title: "Alle meldinger",
    Copy: "Kopiere alle",
    Download: "Last ned",
    MessageFromYou: "Melding fra deg",
    MessageFromChatGPT: "Melding fra VariantGPT",
  },
  Memory: {
    Title: "Minneinstruks",
    EmptyContent: "Ingenting enda",
    Send: "Send minne",
    Copy: "Kopiere minne",
    Reset: "Tilbakestill økt",
    ResetConfirm:
      "Alle samtalehistorikk og historisk minne vil bli slettet ved tilbakestilling. Er du sikker på at du vil tilbakestille?",
  },
  Home: {
    NewChat: "Ny samtale",
    DeleteChat: "Bekreft for å slette den valgte samtalen",
    DeleteToast: "Samtale slettet",
    Revert: "Tilbakestill",
  },
  Settings: {
    Title: "Innstillinger",
    SubTitle: "Alle innstillinger",
    Danger: {
      Reset: {
        Title: "Tilbakestill alle instillinger",
        SubTitle:
          "Tilbakestiller alle instillinger til de forhåndsvalgte innstilingene",
        Action: "Tilbakestill",
        Confirm: "Bekreft tilbakestill alt?",
      },
      Clear: {
        Title: "Slett all nettleserdata",
        SubTitle: "Sletter alle samtaler og innstillinger ",
        Action: "Slett",
        Confirm: "Bekreft for å slette all nettleserdata og innstillinger?",
      },
    },
    Lang: {
      Name: "Språk",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Fontstørrelsen",
      SubTitle: "Juster fontstørrelsen for samtaleinnholdet.",
    },
    InjectSystemPrompts: {
      Title: "Sett inn systemprompter",
      SubTitle:
        "Tving tillegg av en simulert systemprompt i begynnelsen av meldingslisten for hver forespørsel",
    },
    Update: {
      Version: (x: string) => `Versjon: ${x}`,
      IsLatest: "Siste versjon",
      CheckUpdate: "Se etter oppdatering",
      IsChecking: "Ser etter oppdatering ...",
      FoundUpdate: (x: string) => `Fant ny versjon: ${x}`,
      GoToUpdate: "Oppdater",
    },
    SendKey: "Send-nøkkel",
    Theme: "Tema",
    TightBorder: "Stram innramming",
    SendPreviewBubble: {
      Title: "Forhåndsvis tekst",
      SubTitle: "Forhåndsvis tekst med markdown",
    },
    Mask: {
      Splash: {
        Title: "Mask Splash Screen",
        SubTitle: "Vis splash screen før en ny samtale starter",
      },
      Builtin: {
        Title: "Skjul innebygde masker",
        SubTitle: "Skjul innebygde masker fra maskelisten",
      },
    },
    AutoGenerateTitle: {
      Title: "Autogenerer samtaletittel",
      SubTitle: "Generer en passende samtaletittel basert på samtalens innhold",
    },
    Prompt: {
      Disable: {
        Title: "Skru av autofullfør",
        SubTitle: "Skriv / for å trigge autofullfør",
      },
      List: "Instruksliste",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} innebygde, ${custom} brukerdefinerte`,
      Edit: "Endre",
      Modal: {
        Title: "Instruksliste",
        Add: "Legg til",
        Search: "Søk instrukser",
      },
    },
    HistoryCount: {
      Title: "Tall på tilhørende meldinger",
      SubTitle: "Antall sendte meldinger tilknyttet hver spørring",
    },
    CompressThreshold: {
      Title: "Terskeverdi for komprimering av historikk",
      SubTitle:
        "Komprimer dersom ikke-komprimert lengde på meldinger overskrider denne verdien",
    },

    Usage: {
      Title: "Saldo for konto",
      SubTitle(used: any, total: any) {
        return `Brukt denne måneden $${used}, abonnement $${total}`;
      },
      IsChecking: "Sjekker ...",
      Check: "Sjekk",
      NoAccess: "Skriv inn API-nøkkelen for å sjekke saldo",
    },

    Model: "Språkmodell",
    Temperature: {
      Title: "Temperatur",
      SubTitle: "Høyere verdi gir mer kreative svar",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Bør stå på 1. Ikke still ned ved temperatur over 0",
    },
    MaxTokens: {
      Title: "Maks tokens",
      SubTitle: "Maksimum lengde på tokens for instrukser og svar",
    },
  },
  Store: {
    DefaultTopic: "Ny samtale",
    BotHello: "Hei! Hva kan jeg hjelpe deg med i dag?",
    Error: "Noe gikk galt, vennligst prøv igjen senere.",
    Prompt: {
      History: (content: string) =>
        "Dette er et sammendrag av samtalehistorikken mellom AI-en og brukeren som en oppsummering: " +
        content,
      Topic:
        "Vennligst lag en fire til fem ords tittel som oppsummerer samtalen vår uten innledning, punktsetting, anførselstegn, punktum, symboler eller tillegg tekst. Fjern innrammende anførselstegn.",
      Summarize:
        "Oppsummer diskusjonen vår kort i 200 ord eller mindre for å bruke som en oppfordring til fremtidig sammenheng.",
    },
  },
  Copy: {
    Success: "Kopiert til utklippstavle",
    Failed: "Kopiering feilet. Vennligst gi tilgang til utklippstavlen.",
  },
  Context: {
    Toast: (x: any) => `Med ${x} kontekstuelle instrukser`,
    Edit: "Kontekstuelle -og minneinstrukser",
    Add: "Legg til",
  },
  Exporter: {
    Model: "Model",
    Messages: "Meldinger",
    Topic: "Emne",
    Time: "Tid",
  },
  SalesGPT: {
    Title: "SalgsGPT",
    Help: {
      Choose: "Hva trenger du hjelp til?",
      Summary: "Spisse sammendrag",
      MoreToCome: " (mer kommer!)",
    },
    ChooseEmployee: "Velg ansatt",
    SelectPlaceholder: "Hvilken ansatt vil du hente CV-en til?",
    Requirements: "Krav til kompetanse",
    RequirementsPlaceholder:
      "Lim inn kompetansekrav fra tilbudet, f.eks:\n- Backendutvikling\n- Dyktig på å visualisere innsikt \n- Konsulenten må ha erfaring med React",
    Summary: "Sammendrag",
    SummaryPlaceholder: "Kopier inn sammendrag om den ansatte",
    Analyse: "Analyser",
    EmployeeCVSummary: {
      Explanation: {
        Title:
          "SalgsGPT hjelper deg med å spisse sammendraget ditt til et tilbud (og snart med å fylle ut en kompetansematrise)!",
        First:
          "SalgsGPT kan hente prosjekterfaringene til alle Varianter fra CV-partner!",
        Second:
          "I tilbudsdokumentet fra kunden står det hvilke kompetansekrav de stiller til deg som konsulent. ",
        Third:
          "SalgsGPT finner relevante erfaringer fra CV-en din for hvert kompetansekrav du limer inn. ",
        Fourth:
          "SalgsGPT skriver et tekstforslag til deg som du kan jobbe videre med.",
      },
    },
    Consultant: "Konsulent",
    ResultTitle: "Spisset sammendrag fra SalgsGPT",
  },
};

export default no;
