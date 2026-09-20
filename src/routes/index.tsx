import { createFileRoute, Navigate } from "@tanstack/react-router";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  return <Navigate to={`/${nanoid()}`} />;
}
