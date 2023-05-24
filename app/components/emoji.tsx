import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";

import { ModelType } from "../store";

import BotIcon from "../icons/bot.svg";
import BlackBotIcon from "../icons/black-bot.svg";
import ClaudeIcon from "../icons/claude.svg";

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/${style}/64/${unified}.png`;
}

export function AvatarPicker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function Avatar(props: { model?: ModelType; avatar?: string }) {
  if (props.model) {
    let icon;
    if (props.model.startsWith("gpt-4")) {
      icon = <BlackBotIcon className="user-avatar" />;
    } else if (props.model.startsWith("claude")) {
      icon = <ClaudeIcon className="user-avatar" />;
    } else {
      icon = <BotIcon className="user-avatar" />;
    }

    return <div className="no-dark">{icon}</div>;
  }

  return (
    <div className="user-avatar">
      {props.avatar && <EmojiAvatar avatar={props.avatar} />}
    </div>
  );
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return (
    <Emoji
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  );
}
