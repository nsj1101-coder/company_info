"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BASE } from "@/lib/base";

export default function InventoryEdit({ id, currentStock, safeStock }: { id: number; currentStock: number; safeStock: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const curRef = useRef<HTMLInputElement>(null);
  const safeRef = useRef<HTMLInputElement>(null);

  async function save() {
    setBusy(true);
    await fetch(`${BASE}/api/inventory/update`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        currentStock: Number(curRef.current?.value ?? currentStock),
        safeStock: Number(safeRef.current?.value ?? safeStock),
      }),
    });
    setBusy(false); setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <button className="btn ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setOpen(true)}>수정</button>;
  }
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <input className="f" type="number" defaultValue={currentStock} ref={curRef} title="현재고(실사)"
        style={{ width: 60, padding: "4px 6px", fontSize: 12 }} />
      <input className="f" type="number" defaultValue={safeStock} ref={safeRef} title="안전재고"
        style={{ width: 60, padding: "4px 6px", fontSize: 12 }} />
      <button className="btn primary" disabled={busy} style={{ padding: "5px 9px", fontSize: 12 }} onClick={save}>저장</button>
      <button className="btn ghost" disabled={busy} style={{ padding: "5px 8px", fontSize: 12 }} onClick={() => setOpen(false)}>취소</button>
    </div>
  );
}
