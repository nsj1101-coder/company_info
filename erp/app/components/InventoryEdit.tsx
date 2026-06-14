"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE } from "@/lib/base";

export default function InventoryEdit({ id, currentStock, safeStock }: { id: number; currentStock: number; safeStock: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(String(currentStock));
  const [safe, setSafe] = useState(String(safeStock));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await fetch(`${BASE}/api/inventory/update`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, currentStock: Number(cur), safeStock: Number(safe) }),
    });
    setBusy(false); setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setOpen(true)}>수정</button>;
  }
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <input className="f" value={cur} onChange={(e) => setCur(e.target.value)} title="현재고(실사)"
        style={{ width: 56, padding: "4px 6px", fontSize: 12 }} />
      <input className="f" value={safe} onChange={(e) => setSafe(e.target.value)} title="안전재고"
        style={{ width: 56, padding: "4px 6px", fontSize: 12 }} />
      <button className="btn primary" disabled={busy} style={{ padding: "5px 9px", fontSize: 12 }} onClick={save}>저장</button>
      <button className="btn ghost" disabled={busy} style={{ padding: "5px 8px", fontSize: 12 }} onClick={() => setOpen(false)}>취소</button>
    </div>
  );
}
