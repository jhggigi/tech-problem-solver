"use client";

import { useNavigate } from "@tanstack/react-router";
import { Cpu, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { useThreads } from "@/hooks/use-threads";

import { ChatWindow } from "./chat-window";

type ChatLayoutProps = {
  activeThreadId: string;
};

export function ChatLayout({ activeThreadId }: ChatLayoutProps) {
  const navigate = useNavigate();
  const { threads, activeThread, updateThread, deleteThread, loaded } =
    useThreads(activeThreadId);

  const handleNewThread = () => {
    navigate({ to: "/$threadId", params: { threadId: nanoid() } });
  };

  const handleSelectThread = (id: string) => {
    navigate({ to: "/$threadId", params: { threadId: id } });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="flex w-72 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">Technical AI</span>
        </div>

        <div className="p-3">
          <Button
            className="w-full justify-start gap-2"
            onClick={handleNewThread}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loaded && threads.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No chats yet. Start one to see it here.
            </p>
          )}
          <ul className="space-y-1">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  className={`group flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors ${
                    thread.id === activeThreadId
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => handleSelectThread(thread.id)}
                  type="button"
                >
                  <span className="truncate pr-2">{thread.title}</span>
                  {thread.id === activeThreadId && (
                    <span
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(thread.id);
                        if (thread.id === activeThreadId) {
                          handleNewThread();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          Stored in this browser only.
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <ChatWindow thread={activeThread} onThreadUpdate={updateThread} />
      </main>
    </div>
  );
}
