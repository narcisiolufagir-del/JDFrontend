import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { streamNewsChat, streamNewsSummary, type ChatMessage } from "@/services/ai";
import { cn } from "@/lib/utils";

const BRAND = "#2B58C5";

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

type AiNewsFabProps = {
  title: string;
  content: string;
};

export function AiNewsFab({ title, content }: AiNewsFabProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingReply, setStreamingReply] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const loadSummary = useCallback(async () => {
    if (summaryLoaded || summaryLoading) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummary("");

    await streamNewsSummary(title, content, {
      onStart: () => setSummaryLoading(true),
      onDelta: (_text, fullText) => {
        setSummary(fullText);
        setSummaryLoading(false);
        scrollToBottom();
      },
      onDone: (fullText) => {
        setSummary(fullText);
        setSummaryLoading(false);
        setSummaryLoaded(true);
        scrollToBottom();
      },
      onError: (msg) => {
        setSummaryError(msg);
        setSummaryLoading(false);
      },
    });
  }, [title, content, summaryLoaded, summaryLoading]);

  useEffect(() => {
    if (open) void loadSummary();
  }, [open, loadSummary]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed || chatLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const history = [...messages];
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setChatLoading(true);
    setStreamingReply("");
    scrollToBottom();

    await streamNewsChat(title, content, trimmed, history, {
      onDelta: (_text, fullText) => {
        setStreamingReply(fullText);
        scrollToBottom();
      },
      onDone: (fullText) => {
        setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
        setStreamingReply("");
        setChatLoading(false);
        scrollToBottom();
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Não consegui responder. Tente novamente." },
        ]);
        setStreamingReply("");
        setChatLoading(false);
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg shadow-[#2B58C5]/30 hover:opacity-90 active:scale-95 transition-all lg:bottom-8 lg:right-8"
        style={{ backgroundColor: BRAND }}
        aria-label="Resumo IA"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-white border-gray-100 max-h-[85vh] lg:max-w-lg lg:mx-auto">
          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: BRAND }} />
              <DrawerTitle className="text-base font-bold text-gray-900">Resumo IA</DrawerTitle>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[200px] max-h-[50vh]">
            {summaryLoading && !summary && <TypingDots />}

            {summaryError && !summary && (
              <p className="text-sm text-red-500">{summaryError}</p>
            )}

            {summary && (
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {summary}
                  {summaryLoading && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse rounded-sm" style={{ backgroundColor: BRAND }} />
                  )}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "text-white rounded-br-md"
                      : "bg-gray-50 text-gray-700 rounded-bl-md"
                  )}
                  style={msg.role === "user" ? { backgroundColor: BRAND } : undefined}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && !streamingReply && <TypingDots />}

            {streamingReply && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-gray-50 px-4 py-2.5 text-sm text-gray-700 leading-relaxed">
                  {streamingReply}
                  <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse rounded-sm" style={{ backgroundColor: BRAND }} />
                </div>
              </div>
            )}
          </div>

          <div className="px-4 pb-6 pt-2 border-t border-gray-100">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void handleAsk();
              }}
            >
              <Input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pergunte algo sobre a notícia..."
                disabled={chatLoading}
                className="flex-1 h-11 rounded-full border-0 bg-[#F0F2F6] text-sm placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#2B58C5]/25"
              />
              <button
                type="submit"
                disabled={!question.trim() || chatLoading}
                className="flex items-center justify-center w-11 h-11 rounded-full text-white shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: BRAND }}
                aria-label="Enviar pergunta"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
