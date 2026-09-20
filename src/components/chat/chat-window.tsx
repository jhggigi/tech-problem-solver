"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { Cpu } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageAction,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { toast } from "sonner";

import type { Thread } from "@/hooks/use-threads";

type ChatWindowProps = {
  thread: Thread;
  onThreadUpdate: (thread: Thread) => void;
};

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function ChatWindow({ thread, onThreadUpdate }: ChatWindowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
  } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (err) => {
      toast.error(err.message || "Failed to send message");
    },
  });

  // Persist messages to localStorage-backed thread state.
  useEffect(() => {
    if (messages === thread.messages) return;
    onThreadUpdate({
      ...thread,
      messages,
      updatedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Keep textarea focused after assistant response finishes.
  useEffect(() => {
    if (status === "ready" || status === "error") {
      textareaRef.current?.focus();
    }
  }, [status]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async ({ text }: { text: string }) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    await sendMessage({ text: trimmed });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Conversation className="flex-1 px-4 py-6">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="Ask about a bug, system design, deployment issue, or any technical challenge."
              icon={<Cpu className="h-8 w-8" />}
              title="What technical problem are you solving?"
            />
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isLoading && messages.length > 0 && messages.at(-1)?.role === "user" && (
            <div className="flex w-full max-w-[95%] flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                <Shimmer>Thinking...</Shimmer>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              Something went wrong: {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              disabled={isLoading}
              placeholder="Describe your technical problem..."
              ref={textareaRef}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                onStop={stop}
                status={status}
                tooltip={isLoading ? "Stop" : "Send message"}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const textParts = message.parts.filter((p) => p.type === "text");
  const reasoningParts = message.parts.filter((p) => p.type === "reasoning");

  return (
    <Message from={message.role}>
      <MessageContent>
        {reasoningParts.length > 0 && message.role === "assistant" && (
          <div className="mb-3 rounded-md border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium uppercase tracking-wide">Thinking</p>
            {reasoningParts.map((part, i) => (
              <div key={i}>
                {part.type === "reasoning" && (
                  <MessageResponse>{part.reasoning}</MessageResponse>
                )}
              </div>
            ))}
          </div>
        )}
        {textParts.map((part, i) => (
          <MessageResponse key={i}>
            {part.type === "text" ? part.text : ""}
          </MessageResponse>
        ))}
      </MessageContent>
      {message.role === "assistant" && (
        <MessageToolbar>
          <MessageActions>
            <MessageAction
              label="Copy"
              onClick={() => {
                const text = textParts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                navigator.clipboard.writeText(text);
                toast.success("Copied to clipboard");
              }}
              tooltip="Copy"
              variant="ghost"
            >
              Copy
            </MessageAction>
          </MessageActions>
        </MessageToolbar>
      )}
    </Message>
  );
}
