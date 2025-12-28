"use client"

// @ts-ignore
import { useEffect, useState } from "react"
// @ts-ignore
import { sdk } from "@lib/config"
// @ts-ignore
import { useParams } from "next/navigation"
// @ts-ignore
import { getRegion } from "@lib/data/regions"

type NotificationType = {
  backgroundColor: string
  content: string
  id: string
  paddingSize: number
  priority: number
  textColor: string
  textPosition: "left" | "right" | "center"
  textSize: number
}
type TopBarNotificationsResponse = {
  notifications: NotificationType[]
}

const MagenableTopBarNotifications = () => {
  const { countryCode: paramsCountryCode } = useParams()
  const localStorageKey = "closed-top-bar-notifications";

  if (!paramsCountryCode) {
    return null
  }

  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [closedNotifications, setClosedNotifications] = useState<string[]>(
    (): string[] => {
      try {
        return JSON.parse(localStorage.getItem(localStorageKey) ?? "[]");
      } catch {
        return [];
      }
    }
  );

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(closedNotifications));
  }, [closedNotifications]);

  useEffect(() => {
    const countryCode = Array.isArray(paramsCountryCode) ?
      paramsCountryCode[0] : paramsCountryCode
    const region = getRegion(countryCode)

    region.then((region) => {
      sdk.client
        .fetch<TopBarNotificationsResponse>(
          `/store/top-bar-notifications?country=${countryCode}&region=${region?.id}`,
          {
            method: "GET",
          }
        )
        .then((data) => {
          setNotifications(data.notifications)
        })
        .catch((err) => {
          console.error("Failed to load top bar notifications", err)
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }, [])

  function onClose(notificationId: string) {
    setClosedNotifications((prev) =>
      prev.includes(notificationId) ? prev : [...prev, notificationId]
    );
  }

  if (loading || !notifications.length) {
    return null
  }

  return (
    <>
      {notifications
        .filter((n) => (!closedNotifications.includes(n.id)))
        .map((notification) => (
          <div key={notification.id} style={{
            backgroundColor: notification.backgroundColor,
            color: notification.textColor,
            padding: notification.paddingSize + 'px',
            fontSize: notification.textSize + 'px',
            textAlign: notification.textPosition,
          }} className="relative">
            {notification.content}
            <button
              type="button"
              aria-label="Close"
              className="flex h-4 w-4 items-center justify-center rounded-full
               bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900
                transition absolute right-1 top-1"
              onClick={() => {onClose(notification.id)}}
            >✕</button>
          </div>
      ))}
    </>
  )
}

export default MagenableTopBarNotifications
