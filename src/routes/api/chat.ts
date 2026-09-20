import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  createLovableResponsesProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are a patient, expert technical problem-solver. Your job is to help the user understand and resolve technical issues in code, infrastructure, debugging, system design, or any technology area.

Guidelines:
- Ask clarifying questions when the problem is ambiguous.
- Break complex problems into clear steps.
- Explain the "why" behind your suggestions, not just the "what".
- Provide concrete, runnable examples or commands when useful.
- If you are uncertain, say so and outline reasonable alternatives.
- Keep answers focused and practical.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const { lovable, runIdFetch } = createLovableResponsesProvider(
          key,
          initialRunId,
        );

        const result = streamText({
          model: lovable.responses("openai/gpt-6-astra"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "medium",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            sendReasoning: true,
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId
                ? { "X-Lovable-AIG-Run-ID": initialRunId }
                : {}),
            }),
          }),
          runIdFetch,
        );
      },
    },
  },
});
