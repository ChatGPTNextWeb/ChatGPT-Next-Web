# Setup ubuntu node env
- curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
- source ~/.profile
- nvm -version
- nvm ls-remote
- nvm install v20.11.1
- npm install --global yarn
- npm install --global cross-env

# Build
- yarn install
- yarn build
- nohup yarn start > whereq.cc.out 2> whereq.cc.err &
- nohup yarn start > whereq.cc.out 2>&1 &
