# WALC - WhatsApp Linux Client (unofficial)
![Contributors List](https://img.shields.io/badge/dynamic/json?label=Contributors&query=%24..login&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fcstayyab%2FWALC%2Fcontributors) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/cstayyab/WALC?color=%2325D366&label=Latest%20Release) ![GitHub Releases (by Release)](https://img.shields.io/github/downloads/cstayyab/WALC/latest/total?color=%2325D366&label=Latest%20Version%20AppImage%20Downloads&logo=Linux&logoColor=%23FFFFFF) [![GitHub issues](https://img.shields.io/github/issues/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/issues) [![GitHub forks](https://img.shields.io/github/forks/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/network) [![GitHub stars](https://img.shields.io/github/stars/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/stargazers) [![GitHub license](https://img.shields.io/github/license/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/blob/master/LICENSE) [![Twitter](https://img.shields.io/twitter/url/https/github.com/cstayyab/WALC.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fcstayyab%2FWALC) [![walc](https://snapcraft.io//walc/badge.svg)](https://snapcraft.io/walc) [![walc](https://snapcraft.io//walc/trending.svg?name=0)](https://snapcraft.io/walc) 

A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.

<img src="https://ga-beacon.appspot.com/UA-144002431-2/walc/readme.md?useReferer&pixel" width="0" height="0" />

## Releases
[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/walc)
[![Get it from linux-APPS](https://i.imgur.com/YGU3qMJ.png)](https://www.linux-apps.com/p/1383431/)

To download an AppImage, please goto [Latest Release](https://github.com/cstayyab/WALC/releases/latest) Page

## From SnapStore
```
sudo snap install walc
```

## Using  WALC - Prebuilt AppImage 
* Download the latest AppImage in ~/.local/bin which is a recommended location for AppImages
* Make it executable using `chmod +x ~/.local/bin/WALC.AppImage`
* When you open it first time, you will be asked for integration, click 'Yes' to add it to Applications menu.

## Manual Compilation and Usage
If you want to get the version which is not yet released, follow the following steps 
```
# You must have git, npm and node installed

# clone the repo
git clone https://github.com/cstayyab/WALC.git

#Move to WALC directory
cd WALC

# install dependencies
npm install

# start the app
npm start

```
## Feature Requests
[![Feature Requests](http://feathub.com/cstayyab/WALC?format=svg)](http://feathub.com/cstayyab/WALC)

Request new features or vote for existing feature requests at https://feathub.com/cstayyab/WALC/
After you request a new feature please create an issue for that feature request too mentioned the feathub link of that feature. That issue will be used to track the implementation of that feature.

## License
This content of this repository is lisensed under GPL-3.0 apart from the `WhatsBot`folder which is a modified version of https://github.com/pedroslopez/whatsapp-web.js which is licensed under Apache-2.0. You may want to view it README inside that folder. A copy of license is also included.

## Contributions
* You may check the issues section to solve an issue and submit a PR.
* Although it isn't necessary to follow priority order for bugs and number of votes for feature request but it would be really good if you follow that.
