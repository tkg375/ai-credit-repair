"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl: string | null;
}

export function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // poll every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
    setLoading(false);
  };

  const markAllRead = async () => {
    setLoading(true);
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) =>
        fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: n.id, read: true }),
        })
      )
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setLoading(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "dispute_reminder":
        return "⏰";
      case "score_change":
        return "📈";
      case "action_reminder":
        return "📋";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 hover:text-teal-600 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute ${align === "left" ? "left-0" : "right-0"} top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden flex flex-col`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${
                      !n.read ? "bg-teal-50/50" : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                      if (n.actionUrl) {
                        setOpen(false);
                      }
                    }}
                  >
                    {n.actionUrl ? (
                      <Link href={n.actionUrl} className="block" onClick={() => setOpen(false)}>
                        <div className="flex gap-2">
                          <span className="text-sm flex-shrink-0">{typeIcon(n.type)}</span>
                          <div className="min-w-0">
                            <p className={`text-sm ${!n.read ? "font-medium text-slate-900" : "text-slate-600"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</p>
                            <p className="text-xs text-slate-300 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <span className="text-sm flex-shrink-0">{typeIcon(n.type)}</span>
                        <div className="min-w-0">
                          <p className={`text-sm ${!n.read ? "font-medium text-slate-900" : "text-slate-600"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</p>
                          <p className="text-xs text-slate-300 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
