#!/bin/bash

# Check if running on a supported system
case "$(uname -s)" in
  Linux)
    if [[ -f "/etc/lsb-release" ]]; then
      . /etc/lsb-release
      if [[ "$DISTRIB_ID" != "Ubuntu" ]]; then
        echo "This script only works on Ubuntu, not $DISTRIB_ID."
        exit 1
      fi
    else
      if [[ !"$(cat /etc/*-release | grep '^ID=')" =~ ^(ID=\"ubuntu\")|(ID=\"centos\")|(ID=\"arch\")|(ID=\"debian\")$ ]]; then
        echo "Unsupported Linux distribution."
        exit 1
      fi
    fi
    ;;
  Darwin)
    echo "Running on MacOS."
    ;;
  *)
    echo "Unsupported operating system."
    exit 1
    ;;
esac

# Check if needed dependencies are installed and install if necessary
if ! command -v node >/dev/null || ! command -v git >/dev/null || ! command -v pnpm >/dev/null; then
  case "$(uname -s)" in
    Linux)
      if [[ "$(cat /etc/*-release | grep '^ID=')" = "ID=ubuntu" ]]; then
        sudo apt-get update
        sudo apt-get -y install nodejs git pnpm
      elif [[ "$(cat /etc/*-release | grep '^ID=')" = "ID=debian" ]]; then
        sudo apt-get update
        sudo apt-get -y install nodejs git pnpm
      elif [[ "$(cat /etc/*-release | grep '^ID=')" = "ID=centos" ]]; then
        sudo yum -y install epel-release
        sudo yum -y install nodejs git pnpm
      elif [[ "$(cat /etc/*-release | grep '^ID=')" = "ID=arch" ]]; then
        sudo pacman -Syu -y
        sudo pacman -S -y nodejs git pnpm
      else
        echo "Unsupported Linux distribution"
        exit 1
      fi
      ;;
    Darwin)
      /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
      brew install node git pnpm
      ;;
  esac
fi

# Clone the repository and install dependencies
git clone https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web
cd ChatGPT-Next-Web
pnpm install

# Prompt user for environment variables
read -p "Enter OPENAI_API_KEY: " OPENAI_API_KEY
read -p "Enter CODE: " CODE
read -p "Enter PORT: " PORT

# Build and run the project using the environment variables
OPENAI_API_KEY=$OPENAI_API_KEY CODE=$CODE PORT=$PORT pnpm build
OPENAI_API_KEY=$OPENAI_API_KEY CODE=$CODE PORT=$PORT pnpm start
