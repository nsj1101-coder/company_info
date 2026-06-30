# 3spension (하늘별바다 힐링스테이) 데모

스테이폴리오풍 블랙앤화이트 단일 페이지 데모.

## 구성
- `index.html` — 단일 HTML(자체완결, CSS/JS 인라인). 로컬 사진만 `img/` 참조.
- `img/p1~p5.jpg` — 메인 배너 슬라이드 + 9경 그리드 + 스토리 카드 사진.

## 배포 (maximpact 서버 정적)
- URL: https://maximpact.co.kr/3spension/
- 위치: `/var/www/maximpact/3spension/` (이미지 `img/`)
- nginx: `maximpact-site` 의 `location /3spension { root /var/www/maximpact; try_files ... /3spension/index.html; }`

재배포(헬퍼 `_maxserver.ps1` 필요, git 미포함):
```powershell
. "c:\workspace\company_info\_maxserver.ps1"
Send-Max "C:\workspace\company_info\3spension\index.html" "/var/www/maximpact/3spension"
Send-Max "C:\workspace\company_info\3spension\img\p1.jpg" "/var/www/maximpact/3spension/img"  # 이미지 변경 시
Invoke-Max 'cd /var/www/maximpact/3spension && curl -s -o /dev/null -w "%{http_code}\n" https://maximpact.co.kr/3spension/'
```
