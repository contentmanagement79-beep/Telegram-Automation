```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Msg = {
  customer_id: number;
  role: string;
  content: string;
  created_at: string;
};

type Group = {
  customer_id: number;
  messages: Msg[];
};

export default function ConversationsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let uid: string | null = null;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      uid = user.id;

      const { data } = await supabase
        .from("conversations")
        .select("customer_id,role,content,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(400);

      const rows = (data as Msg[]) ?? [];

      const order: number[] = [];
      const map = new Map<number, Msg[]>();

      for (const r of rows) {
        if (!map.has(r.customer_id)) {
          map.set(r.customer_id, []);
          order.push(r.customer_id);
        }

        map.get(r.customer_id)!.push(r);
      }

      setGroups(
        order.map((id) => ({
          customer_id: id,
          messages: map.get(id)!.slice().reverse(),
        })),
      );

      setLoading(false);
    }

    load();

    // 🔴 Supabase Realtime:
    // নতুন message conversations table-এ INSERT হলেই সাথে সাথে reload হবে
    const channel = supabase
      .channel("conversations-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          // শুধু current user's conversation হলে reload করবে
          if (uid && payload.new?.user_id === uid) {
            load();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="dash">
      <Link href="/dashboard" className="back-link">
        <ChevronLeft size={16} /> Back to dashboard
      </Link>

      <div className="dash-head">
        <div>
          <h1 className="dash-title">Conversations</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            What your assistant said to each customer. Updates live. Raw
            messages kept ~7 days.
          </p>
        </div>

        <span
          className="muted"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
          }}
        >
          <RefreshCw size={13} /> live
        </span>
      </div>

      <div style={{ marginTop: 28 }}>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : groups.length === 0 ? (
          <p className="empty">
            No conversations yet. Once customers message your account, they
            show up here.
          </p>
        ) : (
          groups.map((g) => (
            <div key={g.customer_id} className="convo">
              <div className="convo-head">
                Customer #{g.customer_id}
              </div>

              {g.messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "msg-row",
                    m.role === "assistant" && "right",
                  )}
                >
                  <div
                    className={cn(
                      "msg",
                      m.role === "assistant" ? "bot" : "cust",
                    )}
                  >
                    {m.content}

                    <div className="msg-time">
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
```

### কী পরিবর্তন হলো

আগের এটা:

```tsx
const iv = setInterval(load, 5000);
```

এখন আর নেই।

এর পরিবর্তে:

```tsx
supabase
  .channel("conversations-live")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "conversations",
    },
    () => load(),
  )
  .subscribe();
```

ব্যবহার করা হয়েছে।

অর্থাৎ `conversations` table-এ **নতুন message INSERT হলেই dashboard সাথে সাথে reload করবে**—প্রতি ৫ সেকেন্ড পরপর database query করার দরকার হবে না।

আর আমি একটা ছোট নিরাপত্তা/efficiency check রেখেছি:

```tsx
if (uid && payload.new?.user_id === uid) {
  load();
}
```

তাই অন্য কোনো user's conversation insert হলে তোমার dashboard অযথা reload করবে না।

**একটা জিনিস নিশ্চিত করতে হবে:** Supabase-এর `conversations` table-এ Realtime/replication চালু থাকতে হবে। না থাকলে এই `postgres_changes` event আসবে না।
