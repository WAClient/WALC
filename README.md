<p align="center">
<img src="https://socialify.git.ci/WAClient/WALC/image?description=1&font=Bitter&forks=1&logo=https%3A%2F%2Fgithub.com%2FWAClient%2FWALC%2Fraw%2Fmaster%2Fsrc%2Ficons%2Flogo360x360.png&pattern=Floating%20Cogs&stargazers=1&theme=Dark" alt="WALC" width="640" height="320" />
</p>
<h1 align="center">WALC - WhatsApp Linux Client (unofficial)</h1>
<p align="center">

![Contributors List](https://img.shields.io/badge/dynamic/json?label=Contributors&query=%24..login&url=https%3A%2F%2Fapi.github.com%2Frepos%2FWAClient%2FWALC%2Fcontributors) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/WAClient/WALC?color=%2325D366&label=Latest%20Release) ![GitHub Releases (by Release)](https://img.shields.io/github/downloads/WAClient/WALC/latest/total?color=%2325D366&label=Latest%20Version%20AppImage%20Downloads&logo=Linux&logoColor=%23FFFFFF) [![GitHub issues](https://img.shields.io/github/issues/WAClient/WALC.svg)](https://github.com/WAClient/WALC/issues) [![GitHub forks](https://img.shields.io/github/forks/WAClient/WALC.svg)](https://github.com/WAClient/WALC/network) [![GitHub stars](https://img.shields.io/github/stars/WAClient/WALC.svg)](https://github.com/WAClient/WALC/stargazers) [![GitHub license](https://img.shields.io/github/license/WAClient/WALC.svg)](https://github.com/WAClient/WALC/blob/master/LICENSE) [![Twitter](https://img.shields.io/twitter/url/https/github.com/WAClient/WALC.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2FWAClient%2FWALC) [![walc](https://snapcraft.io//walc/badge.svg)](https://snapcraft.io/walc) 

</p>

A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.

<hr/>

## Features
- **WhatsApp Multi Device** 📱🖥️  
Full support for the new WhatsApp Multi Device feature!
- **Tray icon & background running** 🏃  
Close app to tray, unread message badge (with number!), different tray icon when offline
- **Full width** ⬅️➡️  
Make WhatsApp occupy all available space on large screen (enable it first in settings)
- **Chat shortcut** ⚡  
Use <kbd>Ctrl</kbd>+<kbd>1</kbd> to <kbd>Ctrl</kbd>+<kbd>9</kbd> to switch between your chat quickly
- **Native notification** 💬  
Proper formatting of message (bold, italic, link), mark as read button, and for KDE >=5.18, inline/quick reply
- **Notification grouping** 🗯  
Group multiple rapid notification into one. Notifications now wouldn't cover half your screen when someone's angry 💢
- **Offline notification** 📶❌   
Notifies you when disconnected to network or phone (if you haven't used MD)
- **Mark all chat as read** ☑☑  
Have too many unread chats with too little time? You can _"read"_ them all at once!
- **App Lock** 🔒  
Secure your chat from prying eyes 👀! _Warning:_ it's not very safe, but it should deter most people away

and many more...

## Releases
[![Get it from The AUR](https://user-images.githubusercontent.com/79008923/170873436-821df1d3-b45f-441b-b756-d81c6ac8d474.png)](http://aur.archlinux.org/packages/walc)
[![Get it from linux-APPS](https://i.imgur.com/YGU3qMJ.png)](https://www.linux-apps.com/p/1383431/) 

To download the pre-built AppImage, please goto the [Latest Release](https://github.com/WAClient/WALC/releases/latest) Page

## Using  WALC - Prebuilt AppImage 
* Download the latest AppImage in ~/.local/bin which is a recommended location for AppImages
* Make it executable using `chmod +x ~/.local/bin/WALC.AppImage`
* When you open it first time, you will be asked for integration, click 'Yes' to add it to Applications menu.

## Manual Compilation and Usage

If you want to compile the code from its source (applies to the AUR version), you will need the following dependencies:

- Nodejs **<= v16** - later versions such as (17 and 18) crash in the install process, this version is an LTS (called `nodejs-lts-gallium`)
- npm
- git (you **do not need** `git` when installing WALC form the AUR)

After that you must:

```bash

# Clone the repo
git clone https://github.com/WAClient/WALC.git

# Move to WALC directory
cd WALC

# Install the dependencies
npm install

# Build the assets
npm run dev

# Or alternatively to watch for changes
npm run watch

# And to start the app
npm start
```

## Feature Requests
To suggest any new feature, please start a new discussion in the [Feature Requests](https://github.com/WAClient/WALC/discussions?discussions_q=category%3A%22Feature+Requests%22) section of [WALC Discussions](https://github.com/WAClient/WALC/discussions) 

## Troubleshooting
If you are having any problems relating to the usage, building or deploying of WALC please reach out to our community in [Troubleshoting](https://github.com/WAClient/WALC/discussions?discussions_q=category%3ATroubleshooting) section of [WALC Discussions](https://github.com/WAClient/WALC/discussions). Before starting a new discussion, please please check the previously created posts as other people might be having the same problem as yours or someone might have already addressed and answered the problem you are facing.

## Contributions
* You can refer to the Issues section to troubleshoot a problem and submit a PR.
* While it is not necessary to follow the priority order for bugs and the number of votes for a feature request, it would be really nice if you could.
* You can find a list of "Good First Issues" [here](https://github.com/WAClient/WALC/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
