'use client';

import { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const TB_BTN: React.CSSProperties = {
  height: 30, minWidth: 30, padding: '0 8px', border: '1px solid var(--border, #e5e7eb)',
  background: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer',
};

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 최초 마운트시에만 초기 HTML 주입 (커서 점프 방지 위해 value 변경마다 재설정하지 않음)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (): void => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (cmd: string, arg?: string): void => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const onPickImage = (file: File | null): void => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      ref.current?.focus();
      document.execCommand('insertImage', false, String(reader.result));
      emit();
    };
    reader.readAsDataURL(file);
  };

  const insertLink = (): void => {
    const url = window.prompt('링크 URL을 입력하세요', 'https://');
    if (url) exec('createLink', url);
  };

  return (
    <div className="re-wrap">
      <style>{`
        .re-wrap{border:1px solid var(--border,#e5e7eb);border-radius:10px;overflow:hidden;background:#fff}
        .re-toolbar{display:flex;flex-wrap:wrap;gap:4px;padding:8px;border-bottom:1px solid var(--border,#e5e7eb);background:#fafafa}
        .re-sep{width:1px;background:#e5e7eb;margin:0 2px}
        .re-editor{min-height:320px;max-height:640px;overflow-y:auto;padding:16px 18px;font-size:15px;line-height:1.7;color:#1f2937;outline:none}
        .re-editor:empty:before{content:attr(data-ph);color:#9ca3af}
        .re-editor img{max-width:100%;height:auto;border-radius:6px;display:block;margin:8px 0}
        .re-editor h2{font-size:22px;font-weight:700;margin:16px 0 8px}
        .re-editor h3{font-size:18px;font-weight:700;margin:14px 0 6px}
        .re-editor p{margin:6px 0}
        .re-editor ul,.re-editor ol{margin:8px 0;padding-left:22px}
        .re-editor a{color:#2563eb;text-decoration:underline}
      `}</style>
      <div className="re-toolbar">
        <button type="button" style={TB_BTN} onClick={() => exec('bold')} title="굵게"><b>B</b></button>
        <button type="button" style={{ ...TB_BTN, fontStyle: 'italic' }} onClick={() => exec('italic')} title="기울임">I</button>
        <button type="button" style={{ ...TB_BTN, textDecoration: 'underline' }} onClick={() => exec('underline')} title="밑줄">U</button>
        <span className="re-sep" />
        <button type="button" style={TB_BTN} onClick={() => exec('formatBlock', 'H2')} title="제목">제목</button>
        <button type="button" style={TB_BTN} onClick={() => exec('formatBlock', 'H3')} title="소제목">소제목</button>
        <button type="button" style={TB_BTN} onClick={() => exec('formatBlock', 'P')} title="본문">본문</button>
        <span className="re-sep" />
        <button type="button" style={TB_BTN} onClick={() => exec('insertUnorderedList')} title="목록">• 목록</button>
        <button type="button" style={TB_BTN} onClick={() => exec('insertOrderedList')} title="번호목록">1. 목록</button>
        <button type="button" style={TB_BTN} onClick={() => exec('justifyCenter')} title="가운데">가운데</button>
        <span className="re-sep" />
        <button type="button" style={{ ...TB_BTN, color: '#2563eb' }} onClick={() => fileRef.current?.click()} title="이미지 추가"><i className="icon-file-image" style={{ marginRight: 4 }} />이미지</button>
        <button type="button" style={TB_BTN} onClick={insertLink} title="링크">링크</button>
        <button type="button" style={TB_BTN} onClick={() => exec('removeFormat')} title="서식 지우기">서식 해제</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onPickImage(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      </div>
      <div
        ref={ref}
        className="re-editor"
        contentEditable
        suppressContentEditableWarning
        data-ph={placeholder ?? '상세 내용을 입력하고, 이미지 버튼으로 상세컷을 추가하세요'}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}
