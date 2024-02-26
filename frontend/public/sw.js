import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching"
import { clientsClaim } from "workbox-core"

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
	getMessaging,
	onBackgroundMessage,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-sw.js"

// Use the precache manifest generated by Vite
precacheAndRoute(self.__WB_MANIFEST)

// Clean up old caches
cleanupOutdatedCaches()

const jsonConfig = new URL(location).searchParams.get("config")
const firebaseApp = initializeApp(JSON.parse(jsonConfig))
const messaging = getMessaging(firebaseApp)

function isChrome() {
	return navigator.userAgent.toLowerCase().includes("chrome")
}

onBackgroundMessage(messaging, (payload) => {
	const notificationTitle = payload.data.title
	let notificationOptions = {
		body: payload.data.body || "",
	}
	if (isChrome()) {
		notificationOptions["data"] = {
			url: payload.data.click_action,
		}
	} else {
		if (payload.data.click_action) {
			notificationOptions["actions"] = [
				{
					action: payload.data.click_action,
					title: "View Details",
				},
			]
		}
	}
	self.registration.showNotification(notificationTitle, notificationOptions)
})

if (isChrome()) {
	self.addEventListener("notificationclick", (event) => {
		event.stopImmediatePropagation()
		event.notification.close()
		if (event.notification.data && event.notification.data.url) {
			clients.openWindow(event.notification.data.url)
		}
	})
}

self.skipWaiting()
clientsClaim()