#!/bin/bash

cp $WORKSPACE/.devcontainer/.p10k.zsh /home/vscode/.p10k.zsh
cp $WORKSPACE/.devcontainer/.zshrc /home/vscode/.zshrc

cd $WORKSPACE
git config --global --add safe.directory $WORKSPACE
pip install detect-secrets --break-system-packages

echo "Setting up pre-commit hooks"
if [ ! -f .secrets.baseline ]; then
    echo "Creating .secrets.baseline"
    detect-secrets scan > .secrets.baseline
fi
pre-commit install