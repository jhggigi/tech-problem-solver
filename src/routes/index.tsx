import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: IndexPage,
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

function IndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/$threadId", params: { threadId: nanoid() } });
  }, [navigate]);

  return null;
}
