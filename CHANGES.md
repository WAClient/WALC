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
## 0.1.8
- Commit [bd912565fbad80bfd240ea8effff3d7dd2cfa146](https://github.com/cstayyab/WALC/commit/bd912565fbad80bfd240ea8effff3d7dd2cfa146)
    * Added Camera Interface so that Camera can be used in Snap Version of WALC ([#28](https://github.com/cstayyab/WALC/issues/28))
- Commit [9d1c8927e4251d4a8739f5c2308b47ac7bc1d761](https://github.com/cstayyab/WALC/commit/9d1c8927e4251d4a8739f5c2308b47ac7bc1d761)
    * Added Help Menu to access Bug report & feature request from WALC
    * New wide help menu to show help text under each menu item.
- Commit [cd1429ff607c6eb4863f5426270093124e1b3ba5](https://github.com/cstayyab/WALC/commit/cd1429ff607c6eb4863f5426270093124e1b3ba5)
    * Added Help Text to all menu items for easier understanding of what exactly the Menu Item is for.
- Commit [7a23a72241c052e950bee6e2a88a827ee83e329a](https://github.com/cstayyab/WALC/commit/7a23a72241c052e950bee6e2a88a827ee83e329a)
    * Added Force Reload to easily clear cache to resolve cache issues when they occur
    * Added Separators in Window menu for better appearance
- Commit [82943c1246119340a77cbca6e258fbc7aa83a720](https://github.com/cstayyab/WALC/commit/82943c1246119340a77cbca6e258fbc7aa83a720)
    * Added new WhatsApp menu for all functions strictly related to WhatsApp
    * Added menu item to archive all group and private chats
## 0.1.9
- Commit [04b8b15c58a2f332bf70939ead72e94f7aeba8a8](https://github.com/cstayyab/WALC/commit/04b8b15c58a2f332bf70939ead72e94f7aeba8a8)
    * Added WhatsApp Web's Dark Mode (#22 and #30)
- Commit [437dc4623825dc41182e172fc46985dedc9b2d38](https://github.com/cstayyab/WALC/commit/437dc4623825dc41182e172fc46985dedc9b2d38)
    * Auto Hide Menu Bar. (Please Alt to Toggle) (Feature: [https://feathub.com/cstayyab/WALC/+6](https://feathub.com/cstayyab/WALC/+6))
## 0.1.10
- Commit [04b8b15c58a2f332bf70939ead72e94f7aeba8a8](https://github.com/cstayyab/WALC/commit/4d217acfaeff5979627f6462356d72dc507a32f8) (Pull request [#34](https://github.com/cstayyab/WALC/pull/34))
    * Notification on Disconnect
    * Rework Offline Page
- Commit [c32e9d64716c0ef52647d6d93fd20b60076e4c0e](https://github.com/cstayyab/WALC/commit/f24f4e383d9b83284bed34ad194952581afd9c9a)
    * Tray Badge Update
    * Dark Mode Settings
- Commit [f24f4e383d9b83284bed34ad194952581afd9c9a](https://github.com/cstayyab/WALC/commit/f24f4e383d9b83284bed34ad194952581afd9c9a)
    * Don't show Dark Offline Page when Dark Mode is disabled
- Commit [d5b344c6b62f7d6b832203e66d5e9c082a4bdb66](d5b344c6b62f7d6b832203e66d5e9c082a4bdb66)
    * Update tray icon when a chat is added or removed from muted state (Pull request [#38](https://github.com/cstayyab/WALC/pull/38))
- Commit [66bf7fe6c5670fcdcd326047fb51632647edf1a2](https://github.com/cstayyab/WALC/commit/66bf7fe6c5670fcdcd326047fb51632647edf1a2)
    * Fixed Bug that prevented auto-hiding of Menu Bar
- Commit [29250ff481a3d50fd377b9de7c273fc958613d89](https://github.com/cstayyab/WALC/commit/29250ff481a3d50fd377b9de7c273fc958613d89)
    * Added Rate & Review Option to the Menu Bar
- Commit [dbad54f166b60095bbc5f4369fc071fc597abbcc](https://github.com/cstayyab/WALC/commit/dbad54f166b60095bbc5f4369fc071fc597abbcc)
    * Added Shortcut Keys in Menus
- Commit [d157ba879483e0ce28f57f1ef8043a36c1c7aa84](https://github.com/cstayyab/WALC/commit/d157ba879483e0ce28f57f1ef8043a36c1c7aa84)
    * Added Spell Check Feature
- Commit [f91f91039e61d8152c1100c9908226b18ca3175f](https://github.com/cstayyab/WALC/commit/f91f91039e61d8152c1100c9908226b18ca3175f) (Pull Request [#47](https://github.com/cstayyab/WALC/pull/47))
    * Fix WhatsApp Data Store Detection
    * Updated Electron Version
- Commit [696b23c1bd6916d353ddd18589eacb3a056a3aa3](https://github.com/cstayyab/WALC/commit/696b23c1bd6916d353ddd18589eacb3a056a3aa3) (Pull Request [#52](https://github.com/cstayyab/WALC/pull/52))
    * Fixed Issue of JS Error when LSB_Release Module is missing ([#39](https://github.com/cstayyab/WALC/issues/39))
- Commit [4ac093eb820b40acb590c1f694f51e0eb5998703](https://github.com/cstayyab/WALC/commit/4ac093eb820b40acb590c1f694f51e0eb5998703)
    * Fixed Detection when user is logged in
    * Updated Dependencies
    * Updated WhatsBot to latest Commit ([bfea74f5675941e2b5f15e3a9badffb8788ef1b9](https://github.com/pedroslopez/whatsapp-web.js/commit/bfea74f5675941e2b5f15e3a9badffb8788ef1b9)) as of 11th July, 2020
## 0.1.11
- Commit [54812b4148c4abba2e3f6996b9ac413ef1931b1e](https://github.com/cstayyab/WALC/commit/54812b4148c4abba2e3f6996b9ac413ef1931b1e) (Pull Request #60)
    * Show WALC instead of exit prompt on new instance (issue #56 and #57)
- Commit [968f5b2b4313873608845262bf8debf662a39e9d](https://github.com/cstayyab/WALC/commit/968f5b2b4313873608845262bf8debf662a39e9d) (Pull Request #62)
    * Added launcher script when installed with npm install (issue #61)  
    Please note that WALC installation using `npm install -g walc` is not officially supported.
- Commit [ff0fd327a2ec62c1fb9d327248865abf75c5f9b3](https://github.com/cstayyab/WALC/commit/ff0fd327a2ec62c1fb9d327248865abf75c5f9b3) (Pull Request #64)
    * Removed waStore since window.Store is already loaded by whatsapp-web.js
    * Removed dark mode toggle since whatsapp officially supports it
    * Better window.Store detection on preload.js
    * Added Ctrl+Q shortcut to exit WALC (issue #43)
    * Immediately retry connecting to whatsapp when internet is online

## 0.1.12
- Multiple Commits
    * Replaced WhatsBot with Forked NPM Pakcage for easy integration from upstream
    * Replaced WALC Logo
- Commit [ccdc526d0d52a7af8a782d0548b31410548094ab](https://github.com/cstayyab/WALC/tree/ccdc526d0d52a7af8a782d0548b31410548094ab)
    * Battery Low notification if battery is below 15%
