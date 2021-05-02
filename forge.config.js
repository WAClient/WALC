module.exports = {
    "packagerConfig": {
        "name": "WALC",
        "executableName": "walc",
        "platform": [
            "linux"
        ],
        "icon": "src/icons/logo360x360.png",
        "arch": [
            "x64",
            "ia32"
        ],
        "appBundleId": "com.cstayyab.linux.walc",
        "overwrite": true
    },
    "makers": [
        {
            "name": "electron-forge-maker-appimage",
            "platforms": [
                "linux"
            ],
            "config": {
                "categories": [
                    "Network",
                    "Utility"
                ],
                "description": "A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.",
                "genericName": "Unofficial WhatsApp Web Client for Linux Desktops",
                "homepage": "https://cstayyab.com/projects/walc",
                "icon": "src/icons/logo360x360.png",
                "maintainer": "Muhammad Tayyab Sheikh (cstayyab)",
                "name": "walc",
                "productDescription": "A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.",
                "productName": "WALC",
                "section": "web"
            }
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {
                "categories": [
                    "Network",
                    "Utility"
                ],
                "description": "A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.",
                "genericName": "Unofficial WhatsApp Web Client for Linux Desktops",
                "homepage": "https://cstayyab.com/projects/walc",
                "icon": "src/icons/logo360x360.png",
                "maintainer": "Muhammad Tayyab Sheikh (cstayyab)",
                "name": "walc",
                "productDescription": "A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.",
                "productName": "WALC",
                "section": "web"
            }
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {
                "categories": [
                    "Network",
                    "Utility"
                ],
                "compressionLevel": 9,
                "description": "A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.",
                "genericName": "Unofficial WhatsApp Web Client for Linux Desktops",
                "homepage": "https://cstayyab.com/projects/walc",
                "icon": "src/icons/logo360x360.png",
                "license": "GPL-3.0",
                "productDescription": "A WhatsApp Desktop client for linux systems. This is an unofficial client. Use https://web.whatsapp.com for official web client as official desktop client for linux does not exist.",
                "productName": "WALC"
            }
        }
    ]
};