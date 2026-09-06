/**
 * Single source of truth for all copy & config.
 * Edit brand, nav, metrics, pricing, faqs, legal here — nowhere else.
 */

export const BRAND = "Autogram";
export const TAGLINE = "Your business, answered while you sleep.";
export const CONTACT_EMAIL = "hello@yourdomain.com";
export const LEGAL_UPDATED = "September 2026";

export const site = {
  brand: BRAND,
  tagline: TAGLINE,
  contact: CONTACT_EMAIL,
  links: {
    signup: "/signup",
    login: "/login",
    dashboard: "/dashboard",
  },
  // Real routes (each is its own page.tsx) — highlighted when active.
  nav: [
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
  ],
  legalNav: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export const demoScript = [
  { from: "customer", text: "vai wordpress theme ache?" },
  { from: "sathi", text: "Yes! Blog, eCommerce, portfolio — সব ধরনের আছে 😊 কোন ধরনের সাইট?" },
  { from: "customer", text: "ecommerce. price koto?" },
  { from: "sathi", text: "eCommerce themes $25 থেকে শুরু। বাজেট বললে সেরাটা দেখাই।" },
];

// Honest product facts (no fabricated traction, no absolute "0% ban" claims).
export const metrics = [
  { value: "Inbound", accent: "-only", label: "No cold DMs — safer account" },
  { value: "AES", accent: "-256", label: "Encrypted sessions & keys" },
  { value: "BYOK", accent: "", label: "Free with your own key" },
  { value: "24", accent: "/7", label: "Always answering" },
];

export const steps = [
  {
    num: "01",
    title: "Connect Telegram securely",
    body: "Give your API ID, hash and phone — we handle the login code. Your session is encrypted (AES-256) and stored safely, so you stay logged in and never re-connect.",
  },
  {
    num: "02",
    title: "Configure the persona",
    body: "Bring your own Gemini key. Give the assistant its name, tone (e.g. polite Banglish), the topics it handles, your prices, and what it must never do.",
  },
  {
    num: "03",
    title: "Go live & monitor",
    body: "Hit start and it begins replying. Watch conversations from your dashboard, and type your take-over command in any chat to step in for high-value customers.",
  },
];

export const features = [
  { key: "guardrails", title: "No made-up prices. Ever.", body: "Strict guardrails keep it to the prices and policies you provided. If it doesn't know, it waits for you instead of inventing an answer.", size: "lead" as const },
  { key: "takeover", title: "Human take-over", body: "Type your command in any chat to instantly pause the assistant for that one customer and reply yourself. One command brings it back.", size: "wide" as const },
  { key: "media", title: "Voice & vision", body: "Reads images, voice notes and files natively.", size: "sm" as const },
  { key: "isolation", title: "Isolated & encrypted", body: "Row-level security. Your session stays strictly yours.", size: "sm" as const },
];

export const pricing = [
  {
    name: "BYOK Starter",
    price: "৳0",
    cadence: "/ forever",
    highlight: false,
    blurb: "For indie sellers and small shops. You provide the Gemini key, we provide the engine.",
    features: [
      "1 Telegram account",
      "Bring your own key (Gemini)",
      "Inbound-only guardrails",
      "Vision & document reading",
      "edge-tts voice replies",
      "Human take-over commands",
    ],
    cta: "Start free",
  },
  {
    name: "Managed Pro",
    price: "Coming soon",
    cadence: "",
    highlight: true,
    blurb: "Zero setup. We handle the keys, higher limits, and premium voice.",
    features: [
      "No API key needed",
      "Higher limits (fair use)",
      "Premium ElevenLabs voice",
      "Priority workers",
      "Daily conversation summaries",
      "Priority support",
    ],
    cta: "Join the waitlist",
  },
];

export const faqs = [
  { q: "Is there a risk my Telegram account gets banned?", a: "The assistant is inbound-only — it never sends bulk cold DMs or starts conversations, it only replies to people who message you first. That keeps your account far safer than spam-style automation. No automation is completely risk-free, so we also pace replies naturally and give you full control." },
  { q: "Can the AI make up fake prices or discounts?", a: "No. It's locked to the prices and policies in your settings. If it doesn't know something, it tells the customer it will check rather than inventing an answer." },
  { q: "How does human take-over work?", a: "Type your take-over command (e.g. //stop) in a specific chat and the assistant goes silent for that customer while you reply. Type your resume command (e.g. //start) to switch it back on. It keeps reading and remembering the whole time." },
  { q: "Is my Telegram session secure?", a: "Your session and API keys are encrypted at rest (AES-256 / Fernet). The key lives only in our environment, never in the database, and tenant data is isolated with row-level security. You can disconnect your account in one click." },
  { q: "Will customers know it's an assistant?", a: "It's warm and fast, and honest when asked — it helps as your assistant rather than pretending to be a human. That keeps you compliant and your customers' trust intact." },
];
