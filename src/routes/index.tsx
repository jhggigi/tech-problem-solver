import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/$threadId", params: { threadId: nanoid() } });
  }, [navigate]);

  return null;
}
