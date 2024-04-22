# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH=$HOME/.oh-my-zsh

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="devcontainers"

plugins=(git ssh-agent npm)

source $ZSH/oh-my-zsh.sh
source $WORKSPACE/.devcontainer/antigen.zsh

antigen use oh-my-zsh

antigen bundle git
antigen bundle docker
antigen bundle pip
antigen bundle command-not-found
antigen bundle agkozak/zsh-z
antigen bundle zsh-interactive-cd
antigen bundle chitoku-k/fzf-zsh-completions
antigen bundle zsh-users/zsh-autosuggestions
antigen bundle zsh-users/zsh-completions
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle darvid/zsh-poetry
antigen bundle klis87/yarn-run.plugin.zsh

antigen theme romkatv/powerlevel10k
antigen apply

if command -v pyenv 1>/dev/null 2>&1; then
    eval "$(pyenv init -)"
fi

DISABLE_AUTO_UPDATE=true
DISABLE_UPDATE_PROMPT=true

fpath+=~/.zfunc
autoload -Uz compinit && compinit

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
