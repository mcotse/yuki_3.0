"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useNotifications() {
  const subscriptionStatus = useQuery(
    api.notifications.getSubscriptionStatus
  );
  const subscribeMutation = useMutation(api.notifications.subscribe);
  const unsubscribeMutation = useMutation(api.notifications.unsubscribe);

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
    );
  }, []);

  const toggle = useCallback(async () => {
    if (!isSupported) return;

    if (subscriptionStatus?.subscribed) {
      // Unsubscribe
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      await unsubscribeMutation({});
    } else {
      // Request permission + subscribe
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const json = subscription.toJSON();
      await subscribeMutation({
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      });
    }
  }, [isSupported, subscriptionStatus, subscribeMutation, unsubscribeMutation]);

  return {
    isSubscribed: subscriptionStatus?.subscribed ?? false,
    isSupported,
    toggle,
    isLoading: subscriptionStatus === undefined,
  };
}
