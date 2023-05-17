#!/bin/bash

# Change the working directory to the directory of the script
cd "$(dirname "$0")"

# Run the Node.js script and get the value of appDir
appDir=$(node ./getAppDir.mjs)

echo "appDir is $appDir"

if [ "$appDir" = "true" ]; then
  echo "Compressing pages directory"
  echo "Unable to use 'next export' when 'appDir' is set to true"
  # If appDir is true, compress the pages directory
  if [ -d "../pages" ]; then
    # If pages.zip already exists, delete it
    if [ -f "../pages.zip" ]; then
      rm ../pages.zip
    fi
    # Compress the pages directory and delete it
    zip -r ../pages.zip ../pages
    rm -rf ../pages
  fi
else
  echo "Decompressing pages.zip"
  # If appDir is false, check if the pages directory exists
  if [ -d "../pages" ]; then
    echo "pages directory already exists, no action needed"
  else
    # If the pages directory does not exist, check if pages.zip exists
    if [ -f "../pages.zip" ]; then
      # If pages.zip exists, decompress it
      unzip ../pages.zip -d ..
    else
      # If pages.zip does not exist, print an error message
      echo "Error: pages directory and pages.zip file are both missing. Please set appDir to true or download the necessary files from the source repository."
    fi
  fi
fi
