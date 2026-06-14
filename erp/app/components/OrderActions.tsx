"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE } from "@/lib/base";

const STATUSES = ["접수", "생산중", "자수대기", "출고완료"];

export default function OrderActions({ id, status }: { id: number; status: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const canceled = status === "반품/취소";

  async function call(body: object) {
    setBusy(true);
    await fetch(`${BASE}/api/orders/update`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }),
    });
    setBusy(false);
    router.refresh();
  }

  if (canceled) {
    return (
      <button className="btn ghost" disabled={busy} style={{ padding: "5px 10px", fontSize: 12 }}
        onClick={() => call({ op: "status", status: "접수" })}>되돌리기</button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <select className="f" disabled={busy} value={status ?? "접수"} style={{ padding: "5px 8px", fontSize: 12 }}
        onChange={(e) => call({ op: "status", status: e.target.value })}>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button className="btn ghost" disabled={busy} style={{ padding: "5px 10px", fontSize: 12, color: "var(--danger)" }}
        onClick={() => { if (confirm("이 주문을 취소/환불 처리할까요? (반품 기록 생성 + 재고 복원)")) call({ op: "cancel" }); }}>
        취소/환불
      </button>
    </div>
  );
}
