import { SubmitKey } from "../store/app";
import type { LocaleType } from "./index";

const fr: LocaleType = {
  WIP: "Travail en cours...",
  Error: {
    Unauthorized:
      "Accès non autorisé, veuillez saisir le code d'accès dans la page des paramètres.",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} messages`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} messages avec ChatGPT`,
    Actions: {
      ChatList: "Aller à la liste des chats",
      CompressedHistory: "Historique de mémoire prompt compressé",
      Export: "Exporter tous les messages au format Markdown",
      Copy: "Copier",
      Stop: "Arrêter",
      Retry: "Réessayer",
    },
    Rename: "Renommer le chat",
    Typing: "Écriture...",
    Input: (submitKey: string) => {
      var inputHints = `Tapez quelque chose et appuyez sur ${submitKey} pour envoyer`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", appuyez sur Shift + Entrée pour une nouvelle ligne";
      }
      return inputHints;
    },
    Send: "Envoyer",
  },
  Export: {
    Title: "Tous les messages",
    Copy: "Copier tout",
    Download: "Télécharger",
  },
  Memory: {
    Title: "Mémoire Prompt",
    EmptyContent: "Rien pour le moment.",
    Copy: "Copier tout",
  },
  Home: {
    NewChat: "Nouveau chat",
    DeleteChat: "Confirmer la suppression de la conversation sélectionnée ?",
  },
  Settings: {
    Title: "Paramètres",
    SubTitle: "Tous les paramètres",
    Actions: {
      ClearAll: "Effacer toutes les données",
      ResetAll: "Réinitialiser tous les paramètres",
      Close: "Fermer",
    },
    Lang: {
      Name: "Language",
      Options: {
        cn: "简体中文",
        en: "English",
        tw: "繁體中文",
        es: "Español",
        fr: "Français",
      },
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Taille de la police",
      SubTitle: "Taille de la police de l'application",
    },
    Update: {
      Version: (x: string) => `Version ${x}`,
      IsLatest: "Dernière version",
      CheckUpdate: "Vérifier les mises à jour",
      IsChecking: "Vérification en cours...",
      FoundUpdate: (x: string) => `Nouvelle version ${x} trouvée`,
      GoToUpdate: "Mettre à jour",
    },
    SendKey: "Touche d'envoi",
    Theme: "Thème",
    TightBorder: "Bordures serrées",
    Prompt: {
      Disable: {
        Title: "Désactiver le prompt",
        SubTitle: "Désactiver le prompt pour les conversations",
      },
      List: "Liste de prompt",
      ListCount: (builtin: number, custom: number) =>
        `Prompt intégré: ${builtin}, Prompt personnalisé: ${custom}`,
      Edit: "Modifier",
    },
    HistoryCount: {
      Title: "Nombre de messages attachés par requête",
      SubTitle: "Nombre de messages envoyés et joints par demande",
    },
    CompressThreshold: {
      Title: "Seuil de compression de l'historique",
      SubTitle:
        "Compression si la longueur des messages non compressés dépasse la valeur",
    },
    Token: {
      Title: "Clé API",
      SubTitle: "Utilisez votre clé pour ignorer la limite du code d'accès",
      Placeholder: "Clé API OpenAI",
    },
    Usage: {
      Title: "Solde du compte",
      SubTitle(granted: any, used: any) {
        return `Total $${granted}, Utilisé $${used}`;
      },
      IsChecking: "Vérification...",
      Check: "Vérifier à nouveau",
    },
    AccessCode: {
      Title: "Code d'accès",
      SubTitle: "Contrôle d'accès activé",
      Placeholder: "Besoin d'un code d'accès",
    },
    Model: "Modèle",
    Temperature: {
      Title: "Température",
      SubTitle: "Une valeur plus élevée rend la sortie plus aléatoire",
    },
    MaxTokens: {
      Title: "Jetons maximums",
      SubTitle: "Longueur maximale des jetons d'entrée et des jetons générés",
    },
    PresencePenlty: {
      Title: "Présence Sanction",
      SubTitle:
        "Une valeur plus élevée augmente la probabilité d'aborder de nouveaux sujets",
    },
  },
  Store: {
    DefaultTopic: "Nouvelle conversation",
    BotHello: "Bonjour, comment puis-je vous aider aujourd'hui ?",
    Error: "Un problème s'est produit, veuillez réessayer plus tard.",
    Prompt: {
      History: (content: string) =>
        "Il s'agit d'un résumé de l'historique des discussions entre l'IA et l'utilisateur :" +
        content,
      Topic:
        "Veuillez rédiger un titre de quatre à cinq mots résumant notre conversation sans introduction, ponctuation, guillemets, points, symboles ou texte supplémentaire. Supprimez les guillemets.",
      Summarize:
        "Résumez brièvement notre discussion en 50 caractères ou moins, afin de vous y référer dans un contexte ultérieur.",
    },
    ConfirmClearAll: "Confirmer l'effacement de toutes les données de chat et de réglage ?",
  },
  Copy: {
    Success: "Copié dans le presse-papiers",
    Failed: "La copie a échoué, veuillez accorder l'autorisation d'accéder au presse-papiers",
  },
};

export default fr;
