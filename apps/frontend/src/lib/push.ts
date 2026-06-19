"use client";

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): string {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      ...options,
    });
  } catch {
    // ignore
  }
}
