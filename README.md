<p align="center">
<img src="https://socialify.git.ci/cstayyab/WALC/image?description=1&font=Bitter&forks=1&logo=https://github.com/YoungFellow-le/WALC/blob/update-logo/src/icons/logo360x360.png?raw=true&pattern=Floating%20Cogs&stargazers=1&theme=Dark" alt="WALC" width="640" height="320" />
</p>
<h1 align="center">WALC - WhatsApp Linux Client (unofficial)</h1>
<p align="center">

![Contributors List](https://img.shields.io/badge/dynamic/json?label=Contributors&query=%24..login&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fcstayyab%2FWALC%2Fcontributors) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/cstayyab/WALC?color=%2325D366&label=Latest%20Release) ![GitHub Releases (by Release)](https://img.shields.io/github/downloads/cstayyab/WALC/latest/total?color=%2325D366&label=Latest%20Version%20AppImage%20Downloads&logo=Linux&logoColor=%23FFFFFF) [![GitHub issues](https://img.shields.io/github/issues/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/issues) [![GitHub forks](https://img.shields.io/github/forks/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/network) [![GitHub stars](https://img.shields.io/github/stars/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/stargazers) [![GitHub license](https://img.shields.io/github/license/cstayyab/WALC.svg)](https://github.com/cstayyab/WALC/blob/master/LICENSE) [![Twitter](https://img.shields.io/twitter/url/https/github.com/cstayyab/WALC.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fcstayyab%2FWALC) [![walc](https://snapcraft.io//walc/badge.svg)](https://snapcraft.io/walc) [![walc](https://snapcraft.io//walc/trending.svg?name=0)](https://snapcraft.io/walc) 

</p>

A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.

<img src="https://ga-beacon.appspot.com/UA-144002431-2/walc/readme.md?useReferer&pixel" width="0" height="0" />

<hr/>

# WARNING! This repository is not under *ACTIVE* Development
> You may not get support for your issues but if you are able to fix any issue, feel free to send a PR and I will merge it after review.

<hr/>

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
```bash
# You must have git, npm and node installed

# clone the repo
git clone https://github.com/cstayyab/WALC.git

#Move to WALC directory
cd WALC

# install dependencies
npm install

# build assets
npm run dev

# or alternatively to watch for changes
npm run watch

# start the app
npm start

```
## Feature Requests
To suggest any new feature please start a new discussion in the [Feature Requests](https://github.com/cstayyab/WALC/discussions?discussions_q=category%3A%22Feature+Requests%22) section of [WALC Discussions](https://github.com/cstayyab/WALC/discussions) 

You can see the list of old Feature Requests from FeatHub account [here](http://feathub.com/cstayyab/WALC) and it will be closed as soon as we make sure that all the requests have been migrated to WALC Discussions.

<!-- [![Feature Requests](http://feathub.com/cstayyab/WALC?format=svg)]() -->

## Troubleshooting
If you are having any problem related to usage, building or deplying of WALC please reach out to commmunity in [Troubleshooting](https://github.com/cstayyab/WALC/discussions?discussions_q=category%3ATroubleshooting) section of WALC Discussions. Before starting a new discussion please check already created posts as other people might be having same problem as yours or someone might already have addressed and answered the problem you are having.

## License
This content of this repository is lisensed under GPL-3.0 or later.

## Contributions
* You may check the issues section to solve an issue and submit a PR.
* Although it isn't necessary to follow priority order for bugs and number of votes for feature request but it would be really good if you follow that.
* You can find a list of "Good First Issues" [here](https://github.com/cstayyab/WALC/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
