import toast from "react-hot-toast";
import i18next from "i18next";

const notificationStyle = {
  borderRadius: "24px",
  padding: "8px 16px", // x, y
};

export const clearedNotify = () => {
  toast.success(i18next.t("notification.cleared") as string, {
    style: notificationStyle,
  });
};

export const copiedNotify = () => {
  toast.success(i18next.t("notification.copied") as string, {
    style: notificationStyle,
  });
};

export const resetNotify = () => {
  toast.success(i18next.t("notification.reset") as string, {
    style: notificationStyle,
  });
};

export const invalidAccessCodeNotify = () => {
  toast.error(i18next.t("notification.invalid-access-code") as string, {
    style: notificationStyle,
  });
};

// OpenAI
export const invalidOpenAiKeyNotify = () => {
  toast.error(i18next.t("notification.invalid-openai-key") as string, {
    style: notificationStyle,
  });
};

export const invalidOpenAiRequestNotify = () => {
  toast.error(i18next.t("notification.invalid-openai-request") as string, {
    style: notificationStyle,
  });
};

export const invalidOpenAiModelNotify = () => {
  toast.error(i18next.t("notification.invalid-openai-model") as string, {
    style: notificationStyle,
  });
};

export const openAiErrorNotify = () => {
  toast.error(i18next.t("notification.openai-error") as string, {
    style: notificationStyle,
  });
};

export const emptyOpenAiKeyNotify = () => {
  toast.error(i18next.t("notification.empty-openai-key") as string, {
    style: notificationStyle,
  });
};

export const networkErrorNotify = () => {
  toast.error(i18next.t("notification.network-error") as string, {
    style: notificationStyle,
  });
};

export const deletedNotify = () => {
  toast.success(i18next.t("notification.deleted") as string, {
    style: notificationStyle,
  });
};

export const cannotBeEmptyNotify = () => {
  toast.error(i18next.t("notification.cannot-be-empty") as string, {
    style: notificationStyle,
  });
};

// Builtin services
export const errorBuiltinSpeechRecognitionNotify = () => {
  toast.error(i18next.t("notification.builtin-recognition-error") as string, {
    style: notificationStyle,
  });
};

export const errorBuiltinSpeechSynthesisNotify = () => {
  toast.error(i18next.t("notification.builtin-synthesis-error") as string, {
    style: notificationStyle,
  });
};

// Azure
export const emptyAzureKeyNotify = () => {
  toast.error(i18next.t("notification.empty-azure-key") as string, {
    style: notificationStyle,
  });
};

export const azureRecognitionErrorNotify = () => {
  toast.error(i18next.t("notification.azure-recognition-error") as string, {
    style: notificationStyle,
  });
};

export const azureSynthesisErrorNotify = () => {
  toast.error(i18next.t("notification.azure-synthesis-error") as string, {
    style: notificationStyle,
  });
};

export const invalidAzureKeyNotify = () => {
  toast.error(i18next.t("notification.invalid-azure-key") as string, {
    style: notificationStyle,
  });
};

// AWS
export const awsErrorNotify = () => {
  toast.error(i18next.t("notification.polly-synthesis-error") as string, {
    style: notificationStyle,
  });
};

export const allConversationClearNotify = () => {
  toast.success(i18next.t("notification.all-conversations-clear") as string, {
    style: notificationStyle,
  });
};
