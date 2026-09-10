import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = { title: `Docs — ${BRAND}` };

const code1 = `// Node/Express example: /api/assistant
// Autogram POSTs { "query": "<customer message>" }.
// Return { "context": "<facts the bot should use>" }.
app.post("/api/assistant", async (req, res) => {
  const q = (req.body.query || "").toLowerCase();

  // 1) search YOUR data (DB, sheet, CMS…) for matching products/courses
  const items = await db.products.find({
    // simple keyword match — use your own search
    $text: { $search: q }
  });

  // 2) build a short, factual context string
  if (!items.length) {
    return res.json({ context: "No matching product found." });
  }
  const context = items.slice(0, 5).map(p =>
    \`\${p.name} — \${p.price}৳ — \${p.inStock ? "in stock" : "out of stock"}. \${p.summary}\`
  ).join(" | ");

  // 3) return it
  res.json({ context });
});`;

const code2 = `# Python/Flask example
@app.post("/api/assistant")
def assistant():
    q = (request.json or {}).get("query", "").lower()
    items = search_products(q)            # your own search
    if not items:
        return {"context": "No matching product found."}
    ctx = " | ".join(
        f"{p['name']} — {p['price']}tk — "
        f"{'in stock' if p['stock'] else 'out of stock'}. {p['summary']}"
        for p in items[:5]
    )
    return {"context": ctx}`;

export default function DocsPage() {
  return (
    <section className="legal" style={{ maxWidth: "52rem" }}>
      <h1 className="h2">Documentation</h1>
      <p className="muted" style={{ marginTop: 8 }}>Everything you need to set up your assistant: keys, voice, and connecting your website.</p>

      {/* KEYS */}
      <h2 className="doc-h">1. Keys you may need</h2>
      <div className="panel glass">
        <p><strong>Gemini (AI) — required unless you&apos;re on Pro with a platform key.</strong></p>
        <p className="muted">Get a free key at <span className="mono">aistudio.google.com/apikey</span> → Dashboard → <Link href="/dashboard/ai-key">AI keys</Link> → paste. Add several; if one hits its limit the bot uses the next.</p>
        <p style={{ marginTop: 14 }}><strong>Cloudinary (media) — only if you send photos/videos.</strong></p>
        <p className="muted">At cloudinary.com (free): copy your <span className="mono">cloud name</span> and create an <strong>unsigned upload preset</strong>. Put both in Dashboard → Media. No secret/API key is stored — uploads go straight from your browser.</p>
        <p style={{ marginTop: 14 }}><strong>Telegram.</strong></p>
        <p className="muted"><strong>Bot:</strong> @BotFather → <span className="mono">/newbot</span> → paste the token (no phone, no api_id/hash). <strong>Personal account:</strong> get <span className="mono">api_id</span> + <span className="mono">api_hash</span> from my.telegram.org, then phone + login code.</p>
      </div>

      {/* VOICE */}
      <h2 className="doc-h">2. Custom voice API (ElevenLabs or any TTS)</h2>
      <div className="panel glass">
        <p className="muted">By default the bot uses free voice (edge-tts). For premium voice, add a provider in Dashboard → Voice. Every field explained:</p>
        <ul className="doc-list">
          <li><strong>Name</strong> — any label, e.g. <span className="mono">ElevenLabs</span>.</li>
          <li><strong>Voice id</strong> — the provider&apos;s voice id. It replaces <span className="mono">{"{voice}"}</span> in the endpoint/body.</li>
          <li><strong>Endpoint</strong> — the TTS URL. May contain <span className="mono">{"{voice}"}</span>. ElevenLabs: <span className="mono">https://api.elevenlabs.io/v1/text-to-speech/{"{voice}"}</span></li>
          <li><strong>Auth header name</strong> — e.g. <span className="mono">xi-api-key</span> (ElevenLabs) or <span className="mono">Authorization</span> (OpenAI).</li>
          <li><strong>Auth header value</strong> — your key. For &quot;Bearer&quot; APIs, type <span className="mono">Bearer YOUR_KEY</span>. Stored encrypted.</li>
          <li><strong>Body template</strong> — JSON sent to the API; use <span className="mono">{"{text}"}</span> for the reply text. ElevenLabs: <span className="mono">{'{"text":"{text}","model_id":"eleven_multilingual_v2"}'}</span></li>
          <li><strong>Response type</strong> — <span className="mono">audio</span> (most TTS return raw audio), or <span className="mono">base64</span> / <span className="mono">url</span> if the audio is inside a JSON field.</li>
          <li><strong>JSON path</strong> — only for base64/url: the dot-path to the field, e.g. <span className="mono">data.audio</span>.</li>
        </ul>
        <p className="muted" style={{ marginTop: 10 }}>The customer just types &quot;voice please / ভয়েস দাও&quot; and the bot replies with a voice note.</p>
      </div>

      {/* INTEGRATION */}
      <h2 className="doc-h">3. Website / API integration (live product search)</h2>
      <div className="panel glass">
        <p className="muted">This lets the bot answer from <strong>your live website data</strong>. For every customer message, Autogram sends a POST to your URL and uses what you return.</p>
        <p style={{ marginTop: 10 }}><strong>Request Autogram sends:</strong></p>
        <pre className="doc-code">{`POST  https://yourstore.com/api/assistant
Content-Type: application/json
(optional) your-auth-header: your-secret

{ "query": "do you have a python course?" }`}</pre>
        <p style={{ marginTop: 10 }}><strong>Response your API should return</strong> (JSON with a <span className="mono">context</span> field — <span className="mono">answer/result/data/text</span> also accepted):</p>
        <pre className="doc-code">{`{ "context": "Python Basics — 1500tk — in stock. 20 lessons, beginner." }`}</pre>
        <p style={{ marginTop: 10 }}>Inside your endpoint you <strong>search your own database</strong> for the query and return the matching product details. The bot then answers the customer using only that. Keep it fast (≤8s).</p>

        <p style={{ marginTop: 16 }}><strong>Example — Node / Express:</strong></p>
        <pre className="doc-code">{code1}</pre>
        <p style={{ marginTop: 16 }}><strong>Example — Python / Flask:</strong></p>
        <pre className="doc-code">{code2}</pre>

        <p className="muted" style={{ marginTop: 14 }}>
          Set the URL + optional auth header in Dashboard → Website / API, turn it on, then hit
          <strong> &quot;Test endpoint&quot;</strong> to confirm it works before going live. If you have no site/DB,
          you can instead add products manually in Dashboard → Products.
        </p>

        <div className="doc-warn">
          <p><strong>⚠️ Important: use partial / keyword search, not exact match.</strong></p>
          <p className="muted" style={{ marginTop: 6 }}>
            Autogram sends the customer&apos;s whole sentence as <span className="mono">query</span> (e.g.
            <span className="mono"> &quot;do you have a video editing course?&quot;</span>). If your endpoint does an
            exact/whole-string match, it will wrongly say &quot;not found&quot; even when you have 3 video-editing
            courses. Split the query into keywords, drop filler words, and match if <em>any</em> keyword appears
            in a product&apos;s name/category/tags.
          </p>
          <pre className="doc-code">{`const q = (req.body.query || "").toLowerCase();

// 1) drop filler/stop words, keep real keywords
const stop = ["do","you","have","any","is","there","a","the","course",
              "ase","naki","ki","ache","কি","আছে","কোর্স","নাকি"];
const words = q.split(/[\\s,?!।]+/).filter(w => w && !stop.includes(w));

// 2) partial (contains) match on name/category/tags — ANY keyword hits
const all = await db.products.find({});
const items = all.filter(p => {
  const hay = (p.name + " " + p.category + " " + (p.tags||[]).join(" ")).toLowerCase();
  return words.some(w => hay.includes(w));
});

// 3) return matches (or a clear "not found")
res.json({ context: items.length
  ? items.slice(0,5).map(p => \`\${p.name} — \${p.price}৳ — \${p.summary}\`).join(" | ")
  : "No matching course found." });`}</pre>
          <p className="muted" style={{ marginTop: 6 }}>
            Even better: match by <strong>category</strong> (return all &quot;video editing&quot; courses), and add
            fuzzy matching (<span className="mono">fuse.js</span> / <span className="mono">rapidfuzz</span>) to
            handle typos.
          </p>
        </div>
      </div>

      {/* CONTACT */}
      <h2 className="doc-h">4. Need it built for you?</h2>
      <div className="panel glass">
        <p>Don&apos;t have a developer? <strong>We can build your integration API</strong> (product search endpoint) for you and connect it to your assistant.</p>
        <p className="muted" style={{ marginTop: 8 }}>Tell us your website/data source and what the bot should answer, and we&apos;ll set it up.</p>
        <div style={{ marginTop: 14 }}>
          <Link href="/contact" className="btn btn-primary btn-sm">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
