messaging.onBackgroundMessage(async function (payload) {
  try {
    await self.registration.showNotification(payload.notification.title, {
      body: payload.notification.body,
    })
  } catch (error) {
    console.error('{sw}', error)
  }
})
