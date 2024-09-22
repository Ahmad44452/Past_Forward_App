import * as Notifications from "expo-notifications";

// Request permission for notifications (call this when your app starts)
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("You need to enable notifications to use this feature!");
    return false;
  }
  return true;
}

// Configure notification behavior (call this when your app starts)
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Schedule a notification for a todo item
export async function scheduleTodoNotification(task) {
  const trigger = new Date(task.time);
  trigger.setMinutes(trigger.getMinutes() - 2);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming Task",
      body: `"${task.title}" is coming up in 2 minutes!`,
    },
    trigger,
  });

  return notificationId;
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelTodoNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
