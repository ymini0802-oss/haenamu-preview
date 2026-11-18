# 해나무한의원 통합 개발 미리보기 — 검수 안내

## 구현
- 메인: 핵심 진료, 의료진, 기타 진료, 진료 일정, 진료시간, 예약, 주소·주차, FAQ를 원페이지에서 확인
- 진료 상세 10개: 목·허리, 어깨·무릎, 손목·발목, 사고·운동 손상, 추나, 약침·초음파, 한약, 꽃길 다이어트, 공진단, 소화불편·두통·어지럼증
- 의료진 상세 3개: 김성수, 최영재, 박세운
- 비급여 진료비 안내 1개, 동선·모바일·예약 링크 및 기본 접근성 개선
- 일정 관리: 루트의 `schedule.json`에서 `month`, `weekly`, `overrides` 수정. 표준 진료 요일은 정적 HTML에도 남겨 JS 오류 시 표시합니다.
- 배포 파일의 `noindex`는 미리보기 검색 노출 방지용으로 설정되어 있습니다. 완전한 비공개 기능은 아닙니다.

## 대표원장님 검수 필요
1. 모든 의료진 학위·경력·자격 표기와 현재 재직 정보. 특히 APCA, RMSK 한글 번역과 자격 명칭은 원장 검수 필수.
2. 진료 내용과 시술 설명, 치료방법 관련 의료광고 준수 여부.
3. 진료 시간, 토요일·일요일·공휴일 운영, 접수 마감, 월별·임시 진료 일정.
4. 주차 지원 조건과 비급여 수가표 금액·항목, 요금 공지 의무.
5. 의료진 이미지·클리닉 이미지의 저작권 및 공개 동의.

## 정식 배포 전 기술 작업
- `noindex,nofollow,noarchive` 해제, 공개 도메인의 고유 canonical/OG 주소 설정.
- `sitemap.xml`/루트 `robots.txt` 공개 도메인 기준 생성 후 네이버 서치어드바이저·구글 서치콘솔 점검.
- 의료기관 구조화 데이터 값과 개별 페이지 제목·설명 검토.
- 404/없는 이미지, 모바일 레이아웃, HTML 유효성, 예약·지도·전화 링크, 접근성, PageSpeed 수동 확인.
- 실제 운영 사이트 `suntree365/suntree365.github.io`에 대한 수정은 대표원장님 승인 후 별도 진행.


## 2026-11 homepage restructuring
- Six substantive pages: index.html + spine.html, chuna.html, diet.html, herbal.html + price.html.
- Legacy nine URLs are lightweight redirect documents for previously shared links, not substantive separate pages.
- All doctors' qualification summaries and major experience now shown on the homepage. Verify credentials and current wording before public deployment.
- All old links route to the consolidated topic sections, preserving bookmarked paths.
- Schedule JSON remains maintained independently. Preview meta robots noindex stays enabled.
- Check published GitHub Pages behavior and clinical advertising/legal compliance before launch.
