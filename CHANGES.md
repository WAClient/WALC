## 0.1.0
- Opens WhatsApp Web in Electron using electron-prebuild
## 0.1.1
- Replaced electron-prebuild with electron
- External URLs now open in Default Browser instead of a new Electron Window
- Fixed a Bug in which WhatsApp was unable to recognozied the version of Chrome (pull request #7) (contributor: Carpediem94)
- Removed Default Menubar
## 0.1.2
- Updated Electron to latest version (v5.0.0)
- Added Confirmation Notification for "Desktop Notification Enabled"
- Added Network Connectivity Checker
- Ready to release v0.1.2
## 0.1.3-beta
- Reverted electron version to v4.1.5 due to a bug in electron v5.0.0
## 0.1.3
- Same as 0.1.3-beta
## 0.1.4
- Forced Single Instance of WALC
- Added Menus ( Window, Settings)
## 0.1.5
- Fixed Allow Multiple Windows
- Added Tray Icon
- Added initial support to for Bot (Not yet functional)
- Updated All Dependencies
- Removed System Integration support for AppImage because the option has been depcecated
- Added Snap Support
## 0.1.6
- Fixed Desktop Integration for AppImages with custom approach
## 0.1.7
- Commit [081959fcbea9bb112a1b3ee3a3c1b535be04c32f](https://github.com/cstayyab/WALC/commit/081959fcbea9bb112a1b3ee3a3c1b535be04c32f) (Merged PR [#23](https://github.com/cstayyab/WALC/pull/23) by [@Zzombiee2361](https://github.com/Zzombiee2361))
    * Tray menu reworked
    * Close to tray
    * Start hidden
    * Added exit menu under window
    * Fixed always on top
    * Remember window state (position, size, etc)
- Commit [289cbfe1b39dd02f568856248601c0617a0f334e](https://github.com/cstayyab/WALC/commit/289cbfe1b39dd02f568856248601c0617a0f334e)
    * Another attempt to update UserAgent before every request to prevent [#21](https://github.com/cstayyab/WALC/issues/21)
- Commit [25b1d6db13dcb567346436d02d47bb251c6c13e7](https://github.com/cstayyab/WALC/commit/25b1d6db13dcb567346436d02d47bb251c6c13e7)
    * Updated WhatsBot to latest commit([bcd02aa5e4cb96387487595ff02f2c0308793160](https://github.com/pedroslopez/whatsapp-web.js/commit/bcd02aa5e4cb96387487595ff02f2c0308793160)) of [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- Commit [46aa6ae325f6d3a1d0e35c8d3f4a80a79847f256](https://github.com/cstayyab/WALC/commit/46aa6ae325f6d3a1d0e35c8d3f4a80a79847f256)  (Merged PR [#27](https://github.com/cstayyab/WALC/pull/23) by [@Zzombiee2361](https://github.com/Zzombiee2361))
    * Implemented On Click Notification handler
    * Show Number of notifications on Tray Icon when it is below 99 otherwise show 99
- Commit [76d546787dee597654a84a4a4cc8337f808481b9](https://github.com/cstayyab/WALC/commit/76d546787dee597654a84a4a4cc8337f808481b9)
    * Displays a notification when your PC goes offline or WhatsApp Server is not accessible by PC (Same for Mobile is stilll needs to be done)
    * Fixed a bug where frequent change in network state caused WALC to go into an undetermined state
