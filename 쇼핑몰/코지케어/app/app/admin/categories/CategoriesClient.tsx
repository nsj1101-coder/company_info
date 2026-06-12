'use client';

import { useState, DragEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

type ModalId = 'logoutModal' | 'deleteModal' | null;

export type CategoryView = {
  id: number;
  order: number;
  icon: string;
  name: string;
  count: number;
  slug: string;
  visible: boolean;
  parentId: number | null;
  parentName: string | null;
};

type Props = { categories: CategoryView[] };

export default function CategoriesClient({ categories: initial }: Props) {
  const router = useRouter();
  const [openModalId, setOpenModalId] = useState<ModalId>(null);
  const [categories, setCategories] = useState<CategoryView[]>(initial);
  const [busy, setBusy] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [newSlug, setNewSlug] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [reordering, setReordering] = useState<boolean>(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState<boolean>(false);

  const persistOrder = async (list: CategoryView[]): Promise<void> => {
    setSavingOrder(true);
    try {
      const res = await fetch('/cozycare/api/categories/reorder', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: list.map((c, idx) => ({ id: c.id, order: idx + 1 })),
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSavingOrder(false);
    }
  };

  const onDragStart = (e: DragEvent<HTMLElement>, id: number): void => {
    if (!reordering) return;
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: DragEvent<HTMLElement>, overId: number): void => {
    if (!reordering || dragId === null || dragId === overId) return;
    e.preventDefault();
    setCategories((prev) => {
      const from = prev.findIndex((c) => c.id === dragId);
      const to = prev.findIndex((c) => c.id === overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((c, idx) => ({ ...c, order: idx + 1 }));
    });
  };

  const onDrop = async (e: DragEvent<HTMLElement>): Promise<void> => {
    if (!reordering) return;
    e.preventDefault();
    setDragId(null);
    await persistOrder(categories);
  };

  const onDragEnd = (): void => {
    setDragId(null);
  };

  // 위/아래 버튼: 같은 상위(형제) 안에서 순서 이동 (터치/모바일에서도 동작)
  const move = async (id: number, dir: 'up' | 'down'): Promise<void> => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    const siblings = categories.filter((c) => c.parentId === cat.parentId);
    const sIdx = siblings.findIndex((c) => c.id === id);
    const swapWith = dir === 'up' ? siblings[sIdx - 1] : siblings[sIdx + 1];
    if (!swapWith) return;
    const next = [...categories];
    const i = next.findIndex((c) => c.id === id);
    const j = next.findIndex((c) => c.id === swapWith.id);
    [next[i], next[j]] = [next[j], next[i]];
    const renumbered = next.map((c, idx) => ({ ...c, order: idx + 1 }));
    setCategories(renumbered);
    await persistOrder(renumbered);
  };

  const openModal = (id: Exclude<ModalId, null>): void => {
    setOpenModalId(id);
  };

  const closeModal = (_id: Exclude<ModalId, null>): void => {
    setOpenModalId(null);
  };

  const doLogout = (): void => {
    setOpenModalId(null);
  };

  const toggleVisible = async (id: number, current: boolean): Promise<void> => {
    setBusy(id);
    try {
      const res = await fetch(`/cozycare/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ visible: !current }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, visible: !current } : c)),
        );
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const [newParent, setNewParent] = useState<string>('');
  const [addError, setAddError] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);

  const addCategory = async (): Promise<void> => {
    setAddError('');
    const name = newName.trim();
    if (!name) { setAddError('카테고리명을 입력하세요.'); return; }
    const ascii = newSlug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = ascii || `cat-${Date.now().toString(36)}`;
    setAdding(true);
    try {
      const res = await fetch('/cozycare/api/categories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          parentId: newParent ? Number(newParent) : null,
          order: categories.length + 1,
        }),
      });
      if (res.ok) {
        setNewName('');
        setNewSlug('');
        setNewParent('');
        router.refresh();
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setAddError(j.error === 'missing_fields' ? '필수 항목 누락' : '추가에 실패했습니다.');
      }
    } finally {
      setAdding(false);
    }
  };

  const askDelete = (id: number): void => {
    setDeleteTarget(id);
    setOpenModalId('deleteModal');
  };

  const confirmDelete = async (): Promise<void> => {
    if (deleteTarget === null) {
      setOpenModalId(null);
      return;
    }
    const id = deleteTarget;
    setBusy(id);
    try {
      const res = await fetch(`/cozycare/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      }
    } finally {
      setBusy(null);
      setDeleteTarget(null);
      setOpenModalId(null);
    }
  };

  const stop = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation();
  };

  // 1·2·3뎁스 트리 계산
  const byId = new Map(categories.map((c) => [c.id, c]));
  const depthOf = (c: CategoryView): number => {
    let d = 1;
    let p = c.parentId;
    while (p !== null && d < 6) { d += 1; p = byId.get(p)?.parentId ?? null; }
    return d;
  };
  const ordered: { cat: CategoryView; depth: number }[] = [];
  const walk = (pid: number | null, depth: number): void => {
    categories.filter((c) => c.parentId === pid).forEach((c) => {
      ordered.push({ cat: c, depth });
      walk(c.id, depth + 1);
    });
  };
  walk(null, 1);
  const parentOptions = ordered.filter((o) => o.depth <= 2); // 3뎁스까지 (3뎁스는 부모 불가)

  // 형제 그룹 내 첫/끝 여부 (위/아래 버튼 비활성화용)
  const siblingFlag = new Map<number, { isFirst: boolean; isLast: boolean }>();
  {
    const groups = new Map<number | string, CategoryView[]>();
    categories.forEach((c) => {
      const key = c.parentId ?? 'root';
      const arr = groups.get(key) ?? [];
      arr.push(c);
      groups.set(key, arr);
    });
    groups.forEach((arr) =>
      arr.forEach((c, i) => siblingFlag.set(c.id, { isFirst: i === 0, isLast: i === arr.length - 1 })),
    );
  }

  return (
    <>
      <style>{`
        .cat-wrap{display:flex;flex-direction:column;gap:16px;padding:0 24px 24px}
        .cat-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .cat-toolbar-left{font-size:14px;color:var(--fg-muted)}
        .cat-toolbar-left b{color:var(--fg-primary);font-weight:600;font-family:var(--font-mono)}
        .cat-toolbar-right{display:flex;gap:8px}
        .cat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
        .cat-row{display:flex;align-items:center;gap:16px;padding:16px 20px;border-bottom:1px solid var(--border-light)}
        .cat-row:last-child{border-bottom:0}
        .cat-row:hover{background:var(--bg-secondary)}
        .cat-grip{color:var(--fg-muted);cursor:grab;font-size:18px;flex-shrink:0}
        .cat-grip:active{cursor:grabbing}
        .cat-reorder{display:flex;flex-direction:column;gap:3px;flex-shrink:0}
        .cat-ord-btn{width:26px;height:18px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);background:#fff;border-radius:4px;font-size:9px;color:var(--fg-secondary);cursor:pointer;line-height:1;padding:0}
        .cat-ord-btn:hover:not(:disabled){background:var(--accent-light);color:var(--accent);border-color:var(--accent)}
        .cat-ord-btn:disabled{opacity:.3;cursor:default}
        .cat-order{font-family:var(--font-mono);font-size:13px;color:var(--fg-muted);width:24px;text-align:center;flex-shrink:0}
        .cat-icon{width:36px;height:36px;border-radius:8px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--accent);font-size:18px}
        .cat-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
        .cat-name{font-size:15px;font-weight:600;color:var(--fg-primary)}
        .cat-meta{font-size:13px;color:var(--fg-muted)}
        .cat-meta .cm-count{font-family:var(--font-mono);color:var(--fg-secondary);font-weight:500}
        .cat-status{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--fg-secondary);flex-shrink:0}
        .cat-actions{display:flex;gap:6px;flex-shrink:0}
        .cat-actions .btn{padding:6px 12px;font-size:13px}
        .cat-add{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px 20px}
        .cat-add-title{font-size:14px;font-weight:600;color:var(--fg-primary);margin-bottom:10px}
        .cat-add-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
        .cat-add-row input,.cat-add-row select{height:38px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:#fff;color:var(--fg-primary)}
        .cat-add-row input:first-child{flex:1;min-width:200px}
        .cat-add-row select{min-width:160px}
        .cat-add-err{color:#dc2626;font-size:13px;margin-top:8px}
      `}</style>

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>카테고리 관리</h1>
          <p>상품 카테고리 추가 · 수정 · 노출 관리</p>
        </div>
        <div className="top-bar-right" />
      </div>

      <div className="content-scroll">
        <div className="cat-wrap">

          <div className="cat-add">
            <div className="cat-add-title">새 카테고리 추가</div>
            <div className="cat-add-row">
              <input type="text" placeholder="카테고리명 (예: 욕창예방용품)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }} />
              <input type="text" placeholder="슬러그 (비우면 자동)" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
              <select value={newParent} onChange={(e) => setNewParent(e.target.value)}>
                <option value="">상위 없음 (1뎁스 대분류)</option>
                {parentOptions.map(({ cat, depth }) => (
                  <option key={cat.id} value={cat.id}>{' '.repeat((depth - 1) * 3)}{depth === 1 ? '└ ' : '└ '}{cat.name} 하위 ({depth + 1}뎁스)</option>
                ))}
              </select>
              <button className="btn btn-dark" type="button" onClick={addCategory} disabled={adding}>
                <i className="icon-plus" />{adding ? '추가중...' : '추가'}
              </button>
            </div>
            {addError && <div className="cat-add-err">{addError}</div>}
          </div>

          <div className="cat-toolbar">
            <div className="cat-toolbar-left">
              총 <b>{categories.length}</b>개 카테고리 · 노출 <b>{categories.filter((c) => c.visible).length}</b>개 · 비노출 <b>{categories.filter((c) => !c.visible).length}</b>개
            </div>
            <div className="cat-toolbar-right">
              <button
                type="button"
                className={`btn btn-secondary btn-sm${reordering ? ' active' : ''}`}
                onClick={() => setReordering((v) => !v)}
                disabled={savingOrder}
              ><i className="icon-grip-vertical"></i>{reordering ? '순서 변경 완료' : '순서 변경'}</button>
            </div>
          </div>

          <div className="cat-card">
            {ordered.map(({ cat, depth }) => (
              <div
                className="cat-row"
                key={cat.id}
                draggable={reordering}
                onDragStart={(e) => onDragStart(e, cat.id)}
                onDragOver={(e) => onDragOver(e, cat.id)}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
                style={{ paddingLeft: 20 + (depth - 1) * 28, ...(reordering ? { cursor: 'move', opacity: dragId === cat.id ? 0.5 : 1 } : {}) }}
              >
                {depth > 1 && <span style={{ color: 'var(--fg-muted)', marginRight: 2 }}>└</span>}
                {reordering && (
                  <div className="cat-reorder">
                    <button type="button" className="cat-ord-btn" aria-label="위로" disabled={savingOrder || siblingFlag.get(cat.id)?.isFirst} onClick={() => move(cat.id, 'up')}>▲</button>
                    <button type="button" className="cat-ord-btn" aria-label="아래로" disabled={savingOrder || siblingFlag.get(cat.id)?.isLast} onClick={() => move(cat.id, 'down')}>▼</button>
                  </div>
                )}
                <i className="icon-grip-vertical cat-grip"></i>
                <span className="cat-order">{cat.order}</span>
                <div className="cat-icon"><i className={cat.icon}></i></div>
                <div className="cat-body">
                  <div className="cat-name">{cat.name} <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>{depth}뎁스</span></div>
                  <div className="cat-meta"><span className="cm-count">{cat.count}</span>개 상품 · 슬러그 {cat.slug}{cat.parentName ? ` · 상위 ${cat.parentName}` : ''}</div>
                </div>
                <div className="cat-status">
                  <span>{cat.visible ? '노출' : '비노출'}</span>
                  <button
                    type="button"
                    className={`toggle-switch${cat.visible ? ' active' : ''}`}
                    onClick={() => toggleVisible(cat.id, cat.visible)}
                    disabled={busy === cat.id}
                    style={{ border: 'none', cursor: 'pointer' }}
                  ></button>
                </div>
                <div className="cat-actions">
                  <button className="btn btn-ghost" type="button" onClick={() => askDelete(cat.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Shared Modals */}
      <div
        className={`modal-overlay${openModalId === 'logoutModal' ? ' active' : ''}`}
        id="logoutModal"
        style={{ display: openModalId === 'logoutModal' ? 'flex' : 'none' }}
        onClick={() => closeModal('logoutModal')}
      >
        <div className="modal-content" style={{ width: 400 }} onClick={stop}>
          <div className="modal-icon" style={{ background: '#F3F4F6' }}>
            <i className="icon-log-out" style={{ color: '#4B5563', fontSize: 24 }}></i>
          </div>
          <div className="modal-title">로그아웃 하시겠습니까?</div>
          <div className="modal-desc">다시 로그인이 필요합니다.</div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => closeModal('logoutModal')}>취소</button>
            <button className="btn btn-dark" onClick={doLogout}>로그아웃</button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay${openModalId === 'deleteModal' ? ' active' : ''}`}
        id="deleteModal"
        style={{ display: openModalId === 'deleteModal' ? 'flex' : 'none' }}
        onClick={() => {
          setDeleteTarget(null);
          closeModal('deleteModal');
        }}
      >
        <div className="modal-content" style={{ width: 400 }} onClick={stop}>
          <div className="modal-icon" style={{ background: '#FEE2E2' }}>
            <i className="icon-trash-2" style={{ color: '#FF3B30', fontSize: 24 }}></i>
          </div>
          <div className="modal-title">카테고리를 삭제하시겠습니까?</div>
          <div className="modal-desc">
            카테고리에 포함된 상품은 [기타용품]으로 이동됩니다.<br />
            삭제된 카테고리는 복구할 수 없습니다.
          </div>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setDeleteTarget(null);
                closeModal('deleteModal');
              }}
            >취소</button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={confirmDelete}
              disabled={deleteTarget !== null && busy === deleteTarget}
            >삭제</button>
          </div>
        </div>
      </div>
    </>
  );
}
