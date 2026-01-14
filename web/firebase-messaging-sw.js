importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyCG0DKeXZw6oTJqr9Poj-oweijED_ERMNY",
  authDomain: "ezeatz-40d36.firebaseapp.com",
  projectId: "ezeatz-40d36",
  storageBucket: "ezeatz-40d36.firebasestorage.app",
  messagingSenderId: "434424765439",
  appId: "1:434424765439:web:14753579df958e681ae5ca",
  measurementId: "G-8TMYLPNZTT"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/Icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
