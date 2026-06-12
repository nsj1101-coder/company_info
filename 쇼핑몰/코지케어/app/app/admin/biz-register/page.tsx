'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function digitsOnly(s: string): string {
  return s.replace(/[^0-9]/g, '');
}

const BIZ_TYPE_CODE: Record<string, string> = {
  welfare: 'welfare_shop',
  internet: 'internet_shop',
  homecare: 'home_care',
  etc: 'etc',
};

export default function Page() {
  const router = useRouter();
  const [bizType, setBizType] = useState<string>('welfare');
  const [fileName, setFileName] = useState<string>('PDF 또는 이미지 파일을 선택하세요 (최대 10MB)');
  const [companyName, setCompanyName] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [bizNo, setBizNo] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [roadAddress, setRoadAddress] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [hasFile, setHasFile] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const navigateTo = (path: string): void => {
    const map: Record<string, string> = {
      'biz-members.html': '/admin/biz-approval',
    };
    router.push(map[path] ?? '/admin/biz-approval');
  };

  const showSuccess = (title: string, message: string): void => {
    alert(`${title}\n${message}`);
    router.push('/admin/biz-approval');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      setHasFile(true);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!companyName || !owner || !bizNo || !phone) {
      alert('상호, 대표, 사업자번호, 대표 전화는 필수 항목입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const digits = digitsOnly(bizNo);
      const loginId = `biz_${digits}`;
      const res = await fetch('/cozycare/api/biz-members', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          loginId,
          password: digits || 'biz1234',
          companyName,
          bizNo,
          owner,
          phone,
          email: email || null,
          roadAddress: roadAddress || null,
          businessType: BIZ_TYPE_CODE[bizType] ?? bizType,
          memo: memo.trim() ? memo.trim() : null,
          licenseUrl: hasFile ? `/uploads/biz/license-${loginId}.pdf` : null,
          status: 'approved',
        }),
      });
      if (res.ok) {
        showSuccess('등록이 완료되었습니다', '사업자 회원이 정상적으로 등록되었습니다.');
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (data?.error === 'duplicate') {
        alert('이미 등록된 사업자번호 또는 로그인 ID입니다.');
      } else {
        alert('등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        body{background:var(--bg-primary)}
        .reg-wrap{display:flex;flex-direction:column;min-height:100vh}
        .reg-header{display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg-card)}
        .reg-header .back-link{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:var(--fg-primary);cursor:pointer;text-decoration:none}
        .reg-header .head-sub{font-size:13px;color:var(--fg-muted);margin-top:2px}
        .reg-header .cancel-btn{font-size:14px;color:var(--fg-muted);cursor:pointer;font-weight:500}
        .reg-body{flex:1;display:flex;flex-direction:column;align-items:center;padding:32px 20px;overflow-y:auto}
        .reg-form{width:100%;max-width:640px;display:flex;flex-direction:column;gap:22px}
        .reg-form h2{font-size:18px;font-weight:700;color:var(--fg-primary);margin:0}
        .reg-form .reg-desc{font-size:13px;color:var(--fg-muted);margin:-14px 0 0}
        .radio-row{display:flex;flex-wrap:wrap;gap:10px}
        .radio-chip{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card);cursor:pointer;font-size:14px;color:var(--fg-secondary)}
        .radio-chip input{accent-color:var(--accent)}
        .radio-chip:has(input:checked){border-color:var(--accent);background:var(--accent-light);color:var(--accent);font-weight:600}
        .file-box{display:flex;align-items:center;gap:12px;padding:14px;border:1px dashed var(--border);border-radius:var(--radius-sm);background:var(--bg-card);font-size:14px;color:var(--fg-muted)}
        .file-box i{font-size:18px;color:var(--accent)}
        .reg-footer-split{display:flex;justify-content:center;gap:16px;padding:24px}
        .reg-footer-split .btn{min-width:160px;padding:14px 0;font-size:16px}
      `}</style>
      <div className="reg-wrap">
        <div className="reg-header">
          <Link href="/admin/biz-approval" className="back-link">
            <i className="icon-chevron-left" style={{ fontSize: '18px' }}></i>
            <span>
              사업자 회원 등록
              <div className="head-sub">관리자가 직접 사업자를 추가합니다</div>
            </span>
          </Link>
          <span className="cancel-btn" onClick={() => navigateTo('biz-members.html')}>취소</span>
        </div>

        <div className="reg-body">
          <div className="reg-form">
            <h2>사업자 정보</h2>
            <p className="reg-desc">코지워커 SHOP 도매 거래를 위한 사업자 정보를 입력하세요</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">상호 <span className="required">*</span></label>
                <input className="form-input" placeholder="㈜이로움파트너" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">대표 <span className="required">*</span></label>
                <input className="form-input" placeholder="대표자 이름" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">사업자번호 <span className="required">*</span></label>
              <input className="form-input" placeholder="000-00-00000" value={bizNo} onChange={(e) => setBizNo(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">사업자 유형 <span className="required">*</span></label>
              <div className="radio-row">
                <label className="radio-chip"><input type="radio" name="biztype" value="welfare" checked={bizType === 'welfare'} onChange={() => setBizType('welfare')} /> 복지용구사업소</label>
                <label className="radio-chip"><input type="radio" name="biztype" value="internet" checked={bizType === 'internet'} onChange={() => setBizType('internet')} /> 인터넷 사업소</label>
                <label className="radio-chip"><input type="radio" name="biztype" value="homecare" checked={bizType === 'homecare'} onChange={() => setBizType('homecare')} /> 재가복지센터</label>
                <label className="radio-chip"><input type="radio" name="biztype" value="etc" checked={bizType === 'etc'} onChange={() => setBizType('etc')} /> 기타 관련업체</label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">대표 전화 <span className="required">*</span></label>
                <input className="form-input" placeholder="02-000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">이메일</label>
                <input className="form-input" placeholder="biz@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">주소</label>
              <input className="form-input" placeholder="사업장 주소를 입력하세요" value={roadAddress} onChange={(e) => setRoadAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">사업자등록증 첨부 <span className="required">*</span></label>
              <label className="file-box" htmlFor="bizFile">
                <i className="icon-upload"></i>
                <span>{fileName}</span>
                <input id="bizFile" type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">특이사항</label>
              <textarea className="form-textarea" placeholder="포인트율 협의·지점 정보 등 특이사항을 입력하세요" value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
            </div>
          </div>
        </div>

        <div className="reg-footer-split">
          <button className="btn btn-secondary" onClick={() => navigateTo('biz-members.html')}>취소</button>
          <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}><i className="icon-check" style={{ fontSize: '16px' }}></i> 등록</button>
        </div>
      </div>
    </>
  );
}

