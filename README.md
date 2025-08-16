# Browsec

Browsec is a secure HTTP proxy extension for Chromium-based browsers.

## Installation

The extension is available on the <a href="https://chrome.google.com/webstore/detail/browsec-vpn-free-and-unli/omghfjlpggmjjaagoclmmobgdodcjboh">Chrome Web Store</a>.

## Installing from source

### Pre-requisites

* git
* [node.js](https://nodejs.org/)

### Installing dependencies

```
git clone git@bitbucket.org:browsec/browsec-chromium.git
cd browsec-extension

npm ci
```

### General building (includes tests)
Build production version:

```
npm run build
```

Build not production version (development, qa, stage, etc...):

```
ENV=development npm run build
```

Build production firefox version:

```
npm run build firefox
```

Build not production firefox version (development, qa, stage, etc...):

```
ENV=qa npm run build firefox
```

### Fast building
Build development version:

```
ENV=development npm run gulp
```

Build production version:

```
ENV=production npm run gulp
```

Build production firefox version:

```
ENV=production npm run gulp firefox
```

Build production opera version:

```
ENV=production npm run gulp opera
```

## General creating of archive:

```
npm run package
```

```
npm run package firefox
```

```
npm run package opera
```

## Updating version of project

Use command `npm version 1.11.0`, where 1.11.0 is desired version.

## Create archive of the source code

```
npm run gulp source-archive
```

## Download domain dependencies

```
npm run gulp downloaddomaindependencies
```

## Selenium

Create file `selenium/user.json`.
Like `{ "email": "1@1.io", "password": "123456" }`

All tests (must be called anyway first time):

```
ENV=development npm run selenium
```

Start specific test (5 is number of the test):

```
ENV=qa npm run selenium 5
```

## Advanced builds

```
# general build
npm run gulp

# general build for production
ENV=production npm run gulp

# all versions for all browsers (8 builds)
npm run gulp dist
  npm run gulp dist:v2
    npm run gulp dist:v2:chrome
    npm run gulp dist:v2:edge
    npm run gulp dist:v2:firefox
    npm run gulp dist:v2:opera
  npm run gulp dist:v3
    npm run gulp dist:v3:chrome
    npm run gulp dist:v3:edge
    npm run gulp dist:v3:firefox
    npm run gulp dist:v3:opera
```

## Upload gists

Config file: `buils/gists/gists.json`

Create token-file: `build/gists/.github-token`

Upload:
```
npm run gulp upload-gists
```

