"use client";

import { useEffect, useMemo, useState } from "react";

type Conversation = {
  contact_id: string;
  persona_id?: string;
  last_channel?: "call" | "email" | "chat" | string;
  drift_score?: number | null;
  last_reply?: string | null;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function Chip({ label, tone }: { label: string; tone?: "neutral" | "good" | "warn" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        tone === "good" && "bg-emerald-100 text-emerald-800",
        tone === "warn" && "bg-amber-100 text-amber-900",
        (!tone || tone === "neutral") && "bg-zinc-100 text-zinc-800"
      )}
    >
      {label}
    </span>
  );
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [items, setItems] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<string>("");
  const [detail, setDetail] = useState<any>(null);

  const [contactId, setContactId] = useState("u1");
  const [channel, setChannel] = useState<"call" | "email" | "chat">("call");
  const [text, setText] = useState("Hi, my name is Yasemin. I need an appointment next week.");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("GEMINI_API_KEY") || "";
    setApiKey(saved);
    if (!saved) setShowKeyModal(true);
  }, []);

  function saveKey(v: string) {
    setApiKey(v);
    localStorage.setItem("GEMINI_API_KEY", v);
  }

  async function loadConversations() {
    setError("");
    const res = await fetch("http://localhost:8000/v1/conversations");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }

  async function loadDetail(id: string) {
    setError("");
    setSelected(id);
    const res = await fetch(`https://reimagined-tribble-pq7p6gw56xwhrpvv-8000.app.github.dev/chat);
    const data = await res.json();
    setDetail(data);
  }

  async function sendMessage() {
    setError("");
    setToast("");
    if (!apiKey || apiKey.trim().length < 10) {
      setShowKeyModal(true);
      setError("API key missing. Add it to continue.");
      return;
    }
    if (!contactId.trim()) {
      setError("contact_id required");
      return;
    }
    if (!text.trim()) {
      setError("message required");
      return;
    }

    try {
      setSending(true);
      const res = await fetch("http://localhost:8000/v1/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GEMINI-KEY": apiKey,
        },
        body: JSON.stringify({ contact_id: contactId, channel, text }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail ? String(data.detail) : "Request failed");
        return;
      }

      setToast("Sent. State updated.");
      await loadConversations();
      await loadDetail(contactId);
      setSelected(contactId);
    } catch {
      setError("Cannot reach backend. Is it running on port 8000?");
    } finally {
      setSending(false);
      setTimeout(() => setToast(""), 1800);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => x.contact_id.toLowerCase().includes(q));
  }, [items, search]);

  const driftTone =
    typeof detail?.drift_score === "number"
      ? detail.drift_score >= 85
        ? "good"
        : detail.drift_score >= 75
          ? "neutral"
          : "warn"
      : "neutral";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-900" />
            <div>
              <div className="text-sm font-semibold">PersonaCore</div>
              <div className="text-xs text-zinc-500">One AI employee, one memory, every channel</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selected ? <Chip label={`Selected: ${selected}`} /> : <Chip label="No selection" />}
            {detail?.last_channel ? <Chip label={`Channel: ${detail.last_channel}`} /> : null}
            {detail?.drift_score != null ? (
              <Chip label={`Drift: ${Math.round(detail.drift_score)}`} tone={driftTone as any} />
            ) : null}

            <button
              onClick={() => setShowKeyModal(true)}
              className="ml-2 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
            >
              API Key
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[320px_1fr]">
        {/* Left: conversations */}
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Conversations</div>
            <button
              onClick={loadConversations}
              className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contact_id…"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="mt-3 grid gap-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-zinc-500">
                No conversations yet. Send a message to create one.
              </div>
            ) : (
              filtered.map((x) => {
                const isActive = x.contact_id === selected;
                const tone =
                  typeof x.drift_score === "number"
                    ? x.drift_score >= 85
                      ? "good"
                      : x.drift_score >= 75
                        ? "neutral"
                        : "warn"
                    : "neutral";
                return (
                  <button
                    key={x.contact_id}
                    onClick={() => loadDetail(x.contact_id)}
                    className={cx(
                      "w-full rounded-2xl border p-3 text-left transition hover:bg-zinc-50",
                      isActive && "border-zinc-900 bg-zinc-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{x.contact_id}</div>
                      {x.last_channel ? <Chip label={String(x.last_channel)} /> : <Chip label="-" />}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {x.drift_score != null ? (
                        <Chip label={`Drift ${Math.round(x.drift_score)}`} tone={tone as any} />
                      ) : (
                        <Chip label="Drift -" />
                      )}
                      <span className="text-xs text-zinc-500">persona: {x.persona_id ?? "—"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right: composer + detail */}
        <section className="grid gap-4">
          {/* Composer */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Channel Simulator</div>
                <div className="text-xs text-zinc-500">Send message as call, email or chat. Same persona, unified memory.</div>
              </div>
              <div className="flex items-center gap-2">
                {toast ? <Chip label={toast} tone="good" /> : null}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-zinc-600">contact_id</div>
                <input
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-600">channel</div>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                >
                  <option value="call">call</option>
                  <option value="email">email</option>
                  <option value="chat">chat</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <div className="text-xs font-semibold text-zinc-600">message</div>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                disabled={sending}
                onClick={sendMessage}
                className={cx(
                  "rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white",
                  "hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                {sending ? "Sending…" : "Send"}
              </button>
              <button
                onClick={() => {
                  setChannel("email");
                  setText("Following up on the appointment we discussed. What times are available?");
                }}
                className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
              >
                Load “email follow-up”
              </button>
              <button
                onClick={() => {
                  setChannel("chat");
                  setText("Book it for Tuesday 14:00 and send confirmation.");
                }}
                className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
              >
                Load “chat confirm”
              </button>
            </div>

            {error ? <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
          </div>

          {/* Detail */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Conversation Detail</div>
              {detail?.drift_score != null && detail.drift_score < 75 ? (
                <Chip label="⚠ Persona drift detected" tone="warn" />
              ) : null}
            </div>

            {!detail ? (
              <div className="mt-3 rounded-xl border border-dashed p-4 text-sm text-zinc-500">
                Select a conversation on the left, or send a message to create one.
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl border p-4">
                  <div className="text-xs font-semibold text-zinc-600">Last reply</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{detail.last_reply}</div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border p-4 md:col-span-1">
                    <div className="text-xs font-semibold text-zinc-600">Memory</div>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">Ephemeral</div>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs">
{JSON.stringify(detail.memory?.ephemeral ?? [], null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">Working</div>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs">
{JSON.stringify(detail.memory?.working ?? [], null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">Long-term keys</div>
                        <pre className="mt-1 max-h-32 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs">
{JSON.stringify(detail.memory?.long_term_keys ?? [], null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4 md:col-span-2">
                    <div className="text-xs font-semibold text-zinc-600">Trace (timeline)</div>
                    <div className="mt-3 max-h-[420px] overflow-auto">
                      {(detail.trace ?? []).slice().reverse().slice(0, 30).map((t: any, idx: number) => (
                        <div key={idx} className="relative pl-6 pb-4">
                          <div className="absolute left-2 top-1.5 h-2 w-2 rounded-full bg-zinc-900" />
                          <div className="text-xs text-zinc-500">{t.ts}</div>
                          <div className="text-sm font-semibold">{t.agent}</div>
                          <div className="text-sm text-zinc-700">{t.action}</div>
                          {t.meta ? (
                            <pre className="mt-2 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs">
{JSON.stringify(t.meta, null, 2)}
                            </pre>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">Showing last 30 events.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* API Key modal */}
      {showKeyModal ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Enter OpenAI API Key</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Stored locally in your browser. Not sent anywhere except your requests to the backend.
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
              >
                Close
              </button>
            </div>

            <input
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="sk-..."
              className="mt-4 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  if (!apiKey || apiKey.trim().length < 10) return;
                  setShowKeyModal(false);
                }}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
