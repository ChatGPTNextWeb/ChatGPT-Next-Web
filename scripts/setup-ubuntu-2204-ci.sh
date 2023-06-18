# Execute then line below on a fresh, minimal install of Ubuntu Server 22.04 LTS
# to set up the dependencies for the GitHub Runner.
#
# bash <(curl -s https://raw.githubusercontent.com/yeenbean/ChatGPT-Next-Web/main/scripts/setup-ubuntu-2204-ci.sh)

# initial os update
sudo apt update
sudo apt upgrade -y

# install build-essential
sudo apt install -y build-essential

# install nodejs
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt install -y nodejs

# install yarn
sudo npm i -g yarn

# install rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# install tauri dependencies
sudo apt install -y libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libappindicator3-dev \
    librsvg2-dev
    
# install AppImage dependencies
sudo apt install -y file
