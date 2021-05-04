## 0.2.0

A few top level changes are as follows:

 - Migrated Offline Page to Vue
 - Added Dashbaord
 - WhatsApp Theme Tracking
 - Migrated to WhatsApp-Web.js to Electron specific Package
 - Migrated Build system to `electron-forge` ([@cstayyab](https://cstayyab.com))
 - Added Full Width Option
 - Added Chat Switching using `Ctrl+Num` keys
 
### Note
- As we migrated to `electron-forge` we are putting `snap` Support _on hold_. Meanwhile, we will be working on added it back as well as support for other package types e.g. `flatpak`, `deb`, `rpm`
- Unless otherwise mentioned all the work in this release has been done by [@Zzombiee2361](https://github.com/Zzombiee2361)

### Known Issues
- Tray Icon duplicates when "Close to Tray" option is toggled. (Upstream Electron Bug)

## 0.2.1

**Bug Fixes** (by @Zzombiee2361)

* update whatsap-web-electron.js
* make sure whatsapp web is not loaded in dashboard window
* unregister service worker when asked to update browser, fixes #138
* handle disconnect event and reload whatsapp

**Bug Fixes (Snap Version)** (by @cstayyab)
* #129 Added Microphone interface (Enable from `Snap Store > Search > WALC > Permissions` OR  use this command in Terminal `snap connect walc:audio-record`)

Reverted **Electron Forge** to **Electron Builder**


