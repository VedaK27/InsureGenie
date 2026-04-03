import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  dashboardUser,
  dashboardBreakdown,
} from "../constants/plan";

const SUGGESTED_QUESTIONS = [
    "Why is my premium high?",
    "How can I reduce my risk score?",
    "What does my policy level mean?",
    "How do I redeem wellness points?",
];

export default function InsuranceBot({ onClose }) {
    const u = dashboardUser;

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hi ${u.name.split(" ")[0]} 👋 I'm your Insurance AI. I can see your dashboard — ask me anything about your risk score, premium, policy, or how to save money!`,
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: userText }]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/bot/chat", {
                message: userText,
                context: {
                    name: u.name,
                    plan: u.plan,
                    riskScore: u.riskScore,
                    riskLevel: u.riskLevel,
                    premium: u.premium,
                    breakdown: dashboardBreakdown,
                },
            });

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: response.data.reply },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "⚠️ Sorry, I couldn't connect to the server. Please make sure the backend is running on port 8000.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(4px)",
                    zIndex: 1001,
                    animation: "fadeIn 0.2s ease",
                }}
            />

            {/* Chat Panel */}
            <div
                style={{
                    position: "fixed",
                    bottom: "1.5rem",
                    right: "1.5rem",
                    width: "min(420px, calc(100vw - 2rem))",
                    height: "min(620px, calc(100vh - 3rem))",
                    background: "#fff",
                    borderRadius: 24,
                    boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
                    zIndex: 1002,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "var(--navy-dark, #0d1b3e)",
                        padding: "1.1rem 1.4rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flexShrink: 0,
                    }}
                >
                    {/* Bot avatar */}
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                            <rect x="4" y="9" width="20" height="14" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" />
                            <rect x="9" y="14" width="3" height="3" rx="1.5" fill="white" />
                            <rect x="16" y="14" width="3" height="3" rx="1.5" fill="white" />
                            <path d="M10 21h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="14" y1="9" x2="14" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="14" cy="4" r="1.5" fill="white" />
                        </svg>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
                            InsureGenie AI
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                            Online · Llama 3.3 70B
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            color: "#fff",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            cursor: "pointer",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.85rem",
                        background: "#f8f9fc",
                    }}
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                animation: "fadeIn 0.2s ease",
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: "82%",
                                    padding: "0.7rem 1rem",
                                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                    background: msg.role === "user" ? "var(--navy-dark, #0d1b3e)" : "#fff",
                                    color: msg.role === "user" ? "#fff" : "#1a1a2e",
                                    fontSize: "0.88rem",
                                    lineHeight: 1.55,
                                    boxShadow: msg.role === "user"
                                        ? "0 2px 12px rgba(13,27,62,0.2)"
                                        : "0 2px 8px rgba(0,0,0,0.07)",
                                    border: msg.role === "assistant" ? "1px solid #ececf1" : "none",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #ececf1",
                                    borderRadius: "18px 18px 18px 4px",
                                    padding: "0.75rem 1rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                                    display: "flex",
                                    gap: 5,
                                    alignItems: "center",
                                }}
                            >
                                {[0, 1, 2].map((d) => (
                                    <span
                                        key={d}
                                        style={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            background: "var(--navy-dark, #0d1b3e)",
                                            opacity: 0.4,
                                            display: "inline-block",
                                            animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Suggested Questions (shown only at start) */}
                {messages.length === 1 && (
                    <div
                        style={{
                            padding: "0 1.25rem 0.75rem",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.4rem",
                            background: "#f8f9fc",
                            flexShrink: 0,
                        }}
                    >
                        {SUGGESTED_QUESTIONS.map((q) => (
                            <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #dde0ea",
                                    borderRadius: 50,
                                    padding: "0.35rem 0.75rem",
                                    fontSize: "0.75rem",
                                    color: "var(--navy-dark, #0d1b3e)",
                                    cursor: "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 500,
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--navy-dark, #0d1b3e)";
                                    e.currentTarget.style.color = "#fff";
                                    e.currentTarget.style.borderColor = "var(--navy-dark, #0d1b3e)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#fff";
                                    e.currentTarget.style.color = "var(--navy-dark, #0d1b3e)";
                                    e.currentTarget.style.borderColor = "#dde0ea";
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div
                    style={{
                        padding: "0.9rem 1.1rem",
                        borderTop: "1px solid #ececf1",
                        display: "flex",
                        gap: "0.6rem",
                        alignItems: "flex-end",
                        background: "#fff",
                        flexShrink: 0,
                    }}
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your policy, risk, premium…"
                        rows={1}
                        style={{
                            flex: 1,
                            border: "1.5px solid #dde0ea",
                            borderRadius: 14,
                            padding: "0.65rem 0.9rem",
                            fontSize: "0.88rem",
                            fontFamily: "'DM Sans', sans-serif",
                            outline: "none",
                            resize: "none",
                            lineHeight: 1.5,
                            color: "#1a1a2e",
                            transition: "border-color 0.15s",
                            maxHeight: 100,
                            overflowY: "auto",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--navy-dark, #0d1b3e)")}
                        onBlur={(e) => (e.target.style.borderColor = "#dde0ea")}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background: !input.trim() || loading ? "#e2e4ed" : "var(--navy-dark, #0d1b3e)",
                            border: "none",
                            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "background 0.2s",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
        </>
    );
}