import { createFileRoute, useParams } from "@tanstack/react-router";

import { ChatLayout } from "@/components/chat/chat-layout";

export const Route = createFileRoute("/$threadId")({
  component: ThreadPage,
  head: () => ({
    meta: [
      { title: "Technical AI" },
      { name: "description", content: "Solve technical problems with AI." },
      { property: "og:title", content: "Technical AI" },
      { property: "og:description", content: "Solve technical problems with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ThreadPage() {
  const { threadId } = useParams({ from: "/$threadId" });
  return <ChatLayout activeThreadId={threadId} />;
}
