self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/favicon.ico',
    data: { url: data.url },
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  }
});