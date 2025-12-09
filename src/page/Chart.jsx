import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const loadMessages = async () => {
    const res = await fetch(`${API_BASE}/messages`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "You",
        to: "All",
        text: text.trim(),
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }),
    });

    setText("");
    await loadMessages();
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-50 px-6 md:px-10 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-xl md:text-2xl font-semibold">Mobile app chat</h1>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col gap-3 h-[60vh]">
          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl bg-slate-800/80 px-3 py-2 text-xs md:text-sm"
              >
                <p className="text-[11px] text-slate-400 mb-0.5">
                  {m.from} • {m.time}
                </p>
                <p>{m.text}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-[11px] text-slate-500">
                No messages yet. Start the conversation.
              </p>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex gap-2 pt-2 border-t border-slate-800"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-400 transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
