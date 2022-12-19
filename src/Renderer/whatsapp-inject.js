// prevent update browser from showing
// taken from https://github.com/frealgagu/archlinux.whatsapp-nativefier/blob/master/whatsapp-nativefier-inject.js

const TIME_BETWEEN_INVOCATIONS = 1500; // Time between invocations (ms)
const NUMBER_OF_INVOCATIONS = 15;      // Number of invocations

console.info("Checking time between invocations:", TIME_BETWEEN_INVOCATIONS, ", Number of invocations:", NUMBER_OF_INVOCATIONS);

let isReady = false;
let invocationNumber = 0;

module.exports = {
	whatsappReady() {
		isReady = true;
	}
}

async function injectWhatsapp() {
	if (isReady) {
		return;
	}

	console.info("*****", ++invocationNumber, "******")
	console.info("Checking for service worker in navigator...");
	if ("serviceWorker" in navigator) {
		console.info("Service worker found in navigator. Checking for unsupported browser message...");
		if (document.querySelector("a[href='https://support.google.com/chrome/answer/95414']")) {
			console.info("Checking cache names from service worker...");
			const cacheNames = await caches.keys();
			console.info("CacheNames:", cacheNames);
			const cachePromises = cacheNames.map(async function (cacheName) {
				console.info("Deleting cache", cacheName, "...");
				const result = await caches.delete(cacheName);
				console.info("Cache", cacheName, "deleted:", result);
			});

			console.info("Checking service worker registrations...");
			const registrations = await navigator.serviceWorker.getRegistrations();
			console.info("Registrations:", registrations);
			const workerPromises = registrations.map(async function (registration) {
				console.info("Unregistering registration", registration, "...");
				const result = await registration.unregister();
				console.info("Registration", registration, "unregistered:", result);
			});

			await Promise.all([...cachePromises, ...workerPromises]);
			document.location.reload();
			return;
		} else {
			console.info("Unsupported browser message not found.");
		}
	} else {
		console.info("Service worker not found in navigator.");
	}

	if (invocationNumber < NUMBER_OF_INVOCATIONS) {
		setTimeout(injectWhatsapp, TIME_BETWEEN_INVOCATIONS);
	}
}

injectWhatsapp();
