"use client";

import { useEffect, useMemo, useState } from "react";
import type { UIMessage } from "ai";

const THREADS_KEY = "tech-ai-threads";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const text = firstUser.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
  if (!text) return "New chat";
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

export function useThreads(activeThreadId: string) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(THREADS_KEY);
      if (stored) {
        setThreads(JSON.parse(stored));
      }
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !loaded) return;
    try {
      localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    } catch {
      // storage may be full
    }
  }, [threads, loaded]);

  const activeThread = useMemo<Thread>(() => {
    const found = threads.find((t) => t.id === activeThreadId);
    if (found) return found;
    return {
      id: activeThreadId,
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
  }, [threads, activeThreadId]);

  const updateThread = (thread: Thread) => {
    const title = thread.title === "New chat" ? deriveTitle(thread.messages) : thread.title;
    const next = { ...thread, title };
    setThreads((prev) => {
      const exists = prev.some((t) => t.id === next.id);
      const updated = exists
        ? prev.map((t) => (t.id === next.id ? next : t))
        : [next, ...prev];
      return updated.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  return { threads, activeThread, updateThread, deleteThread, loaded };
}
