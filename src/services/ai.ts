const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://jornaldestaque.bluesparkmz.com";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SummarizeCallbacks {
  onStart?: () => void;
  onDelta?: (text: string, fullText: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (message: string) => void;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = "message";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  return data ? { event, data } : null;
}

async function streamAiEndpoint(
  endpoint: string,
  body: Record<string, unknown>,
  callbacks: SummarizeCallbacks
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    callbacks.onError?.("Não foi possível comunicar com a IA.");
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.("Resposta inválida do servidor.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";

    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (!parsed) continue;

      try {
        const payload = JSON.parse(parsed.data);
        if (parsed.event === "start") callbacks.onStart?.();
        if (parsed.event === "delta") callbacks.onDelta?.(payload.text, payload.full_text);
        if (parsed.event === "done") callbacks.onDone?.(payload.reply || payload.full_text || "");
        if (parsed.event === "error") callbacks.onError?.(payload.detail || "Erro na IA.");
      } catch {
        // ignore malformed chunks
      }
    }
  }
}

function plainNewsContent(content: string) {
  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function streamNewsSummary(
  title: string,
  content: string,
  callbacks: SummarizeCallbacks
): Promise<void> {
  await streamAiEndpoint(
    "/api/ai/summarize",
    {
      news_title: title,
      news_content: plainNewsContent(content),
      action: "summary",
    },
    callbacks
  );
}

export async function streamNewsChat(
  title: string,
  content: string,
  question: string,
  chatHistory: ChatMessage[],
  callbacks: SummarizeCallbacks
): Promise<void> {
  await streamAiEndpoint(
    "/api/ai/chat",
    {
      news_title: title,
      news_content: plainNewsContent(content),
      action: "chat",
      chat_history: [
        ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: question },
      ],
    },
    callbacks
  );
}
