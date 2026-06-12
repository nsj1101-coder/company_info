'use client';

import { useEffect, useRef, useState } from 'react';

export type DaumAddressData = {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName?: string;
  addressType: 'R' | 'J';
};

export type AddressSearchResult = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (opt: {
        oncomplete: (data: DaumAddressData) => void;
      }) => { open: () => void };
    };
    __daumPostcodeLoaded?: boolean;
  }
}

const POSTCODE_SCRIPT_SRC =
  '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

type Props = {
  onComplete: (result: AddressSearchResult) => void;
  className?: string;
  label?: string;
};

export default function AddressSearch({
  onComplete,
  className = 'btn btn-outline',
  label = '주소 검색',
}: Props) {
  const [ready, setReady] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.daum?.Postcode) {
      setReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${POSTCODE_SCRIPT_SRC}"]`
    );

    if (existing && window.__daumPostcodeLoaded) {
      setReady(true);
      return;
    }

    if (existing) {
      const onLoad = () => {
        window.__daumPostcodeLoaded = true;
        setReady(true);
      };
      existing.addEventListener('load', onLoad);
      return () => existing.removeEventListener('load', onLoad);
    }

    const script = document.createElement('script');
    script.src = POSTCODE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      window.__daumPostcodeLoaded = true;
      setReady(true);
    };
    document.body.appendChild(script);
  }, []);

  const handleOpen = () => {
    if (!window.daum?.Postcode) {
      alert('주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: DaumAddressData) => {
        onCompleteRef.current({
          zonecode: data.zonecode,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          buildingName: data.buildingName ?? '',
        });
      },
    }).open();
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleOpen}
      disabled={!ready}
    >
      {label}
    </button>
  );
}
