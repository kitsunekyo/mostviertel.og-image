# og image generator

this package is a serverless function that provides an api to dynamically generate og images for my blog.
send requests to `/api` with the following params:

```
title: blog post title
createdAt: utc date string
tags: array of strings (just pass the param multiple times)
```

example: `api?title=typesafe%20translations%20with%20react-i18next%20and%20typescript&tags=redux&tags=react&createdAt=2022-09-18`

# development

make sure you have the vercel-cli installed `npm i -g @vercel/cli`

run `npm install`

run `npm start` -> just runs `vercel dev`

## chromium executable

the application uses your locally installed chrome binary to skip the full download of playwright. to customize your chromium executable path create an `.env` file in the root, and add the env variable `OG_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome`

## wsl2 users

here's how you can install chrome in ubuntu inside wsl2

```bash
# install dependencies
sudo apt-get install -y curl unzip xvfb libxi6 libgconf-2-4 fonts-liberation
# get latest chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# install it
sudo apt install ./google-chrome-stable_current_amd64.deb
```
