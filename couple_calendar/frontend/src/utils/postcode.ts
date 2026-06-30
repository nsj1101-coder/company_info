// 다음(카카오) 우편번호 검색 — index.html 에서 스크립트 로드됨
interface DaumData {
  roadAddress: string;
  jibunAddress: string;
  buildingName?: string;
}
declare global {
  interface Window {
    daum?: { Postcode: new (opt: { oncomplete: (d: DaumData) => void }) => { open: () => void } };
  }
}

export function openPostcode(onPick: (address: string) => void) {
  const daum = window.daum;
  if (!daum?.Postcode) {
    alert('주소 검색을 불러오지 못했어요. 인터넷 연결을 확인해주세요.');
    return;
  }
  new daum.Postcode({
    oncomplete: (d) => {
      let addr = d.roadAddress || d.jibunAddress;
      if (d.buildingName) addr += ` (${d.buildingName})`;
      onPick(addr);
    },
  }).open();
}
