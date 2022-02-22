importScripts("https://www.gstatic.com/firebasejs/8.2.5/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.5/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyAE2dYllUY4DOzMnIbrbK2N5-LselonGK4",
  authDomain: "gigstimer.firebaseapp.com",
  projectId: "gigstimer",
  storageBucket: "gigstimer.appspot.com",
  messagingSenderId: "768974872886",
  appId: "1:768974872886:web:bfa7d92b95adc51c42d397",
  measurementId: "G-RCKLE7Y59N",
});
const messaging = firebase.messaging();
if (messaging) {
  // When tab is inactive
  messaging.setBackgroundMessageHandler((payload) => {
    console.log("bg notif", payload);
    let options = {
      body: payload.data.body,
      icon: payload.data.icon,
      data: payload.data,
      requireInteraction: true,
    };
    payload.data.actions
      ? (options.actions = JSON.parse(payload.data.actions))
      : () => {};
    return self.registration.showNotification(payload.data.title, options);
  });

  self.addEventListener("notificationclick", (event) => {
    console.log("notif clicked", event);
    const action = event.action;
    const clickedNotification = event.notification;
    const data = event.notification.data;
    clickedNotification.close();
    if (action == "complete-task" && data.task_id) {
      data.action = "complete-task";
    }
    const promiseChain = self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        let matchingClient = null;
        windowClients.forEach((client) => {
          let clientURL = new URL(client.url);
          if (clientURL.host == "gigstimer.com") {
            matchingClient = client;
          }
        });
        if (matchingClient) {
          console.log("to matching client", data);
          sendMessageToClient(matchingClient, data);
          return matchingClient.focus();
        }

        return clients.openWindow("https://gigstimer.com/task");
      });
    event.waitUntil(promiseChain);
  });

  const sendMessageToClient = (client, message) => {
    const messageChannel = new MessageChannel();
    client.postMessage(message, [messageChannel.port2]);
  };
}
