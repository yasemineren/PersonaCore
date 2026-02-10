"use client";

import { FormEvent, useMemo, useState } from "react";

type TraceItem = {
  agent: string;
  action: string;
  meta: Record<string, unknown>;
  ts: string;
};

type MessageResponse = {
  contact_id: string;
  channel: "call" | "email" | "chat";
  reply: string;
  drift_score: number;
  drift_detected: boolean;
  escalation: boolean;
  memory_snapshot: {
    ephemeral: string[];
    working: string[];
    long_term_keys: string[];
  };
  trace: TraceItem[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/v1";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [contactId, setContactId] = useState("customer-001");
  const [channel, setChannel] = useState<"call" | "email" | "chat">("call");
  const [text, setText] = useState("Merhaba, geçen hafta konuştuğumuz paket için devam etmek istiyorum.");
  const [result, setResult] = useState<MessageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => apiKey.trim().length > 0 && contactId.trim().length > 0 && text.trim().length > 0,
    [apiKey, contactId, text],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GEMINI-KEY": apiKey.trim(),
        },
        body: JSON.stringify({ contact_id: contactId.trim(), channel, text: text.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail ?? "Request failed");
      }

      const payload: MessageResponse = await response.json();
      setResult(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <main className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
          <h1 className="text-3xl font-semibold">AI Employee Control Panel</h1>
          <p className="mt-2 text-sm text-slate-300">
            A single AI employee. One memory. Every channel.
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1 text-sm">
              Gemini API Key (yalnızca bu oturum için)
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 outline-none ring-cyan-400 focus:ring"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Contact ID
                <input
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 outline-none ring-cyan-400 focus:ring"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Channel
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as "call" | "email" | "chat")}
                  className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 outline-none ring-cyan-400 focus:ring"
                >
                  <option value="call">/call (phone simulation)</option>
                  <option value="email">/email</option>
                  <option value="chat">/chat</option>
                </select>
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              Message
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 outline-none ring-cyan-400 focus:ring"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {loading ? "Running orchestration..." : "Send to PersonaCore"}
            </button>
          </form>

          {error && <p className="mt-3 rounded-md bg-rose-950/60 p-3 text-sm text-rose-200">{error}</p>}
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">Trace & Memory Snapshot</h2>
          {!result ? (
            <p className="mt-3 text-sm text-slate-400">Henüz bir istek gönderilmedi.</p>
          ) : (
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded-md border border-slate-700 bg-slate-800/70 p-3">
                <p><span className="font-semibold">Reply:</span> {result.reply}</p>
                <p className="mt-2">Drift score: <span className="font-semibold">{result.drift_score.toFixed(1)}</span></p>
                <p>Escalation: <span className="font-semibold">{result.escalation ? "Yes" : "No"}</span></p>
              </div>

              <div className="rounded-md border border-slate-700 bg-slate-800/70 p-3">
                <p className="font-semibold">Working Memory</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                  {result.memory_snapshot.working.map((item, i) => (
                    <li key={`${item}-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-slate-700 bg-slate-800/70 p-3">
                <p className="font-semibold">Agent Trace</p>
                <ul className="mt-2 space-y-2">
                  {result.trace.map((item, i) => (
                    <li key={`${item.agent}-${i}`} className="rounded border border-slate-700 bg-slate-900 p-2">
                      <p className="font-medium">{item.agent} → {item.action}</p>
                      <p className="text-xs text-slate-400">{JSON.stringify(item.meta)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
