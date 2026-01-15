/**
 * ============================================================
 * 모바일 청첩장 JavaScript
 * ============================================================
 *
 * 이 파일은 청첩장의 모든 동적 기능을 담당합니다.
 *
 * 주요 기능:
 * 1. D-day 카운트다운 - 결혼식까지 남은 일수 계산
 * 2. 클립보드 복사 - 계좌번호, 링크 등 복사 기능
 * 3. 공유하기 - Web Share API 또는 링크 복사
 * 4. 토스트 알림 - 사용자에게 피드백 메시지 표시
 * 5. 라이트박스 - 갤러리 이미지 확대 보기
 *
 * 참고: Firebase 관련 코드(방명록)는 index.html 내에 인라인으로 작성됨
 */


/* ============================================================
   1. D-day 카운트다운
   ============================================================
   결혼식 날짜까지 남은 일수를 계산하여 표시합니다.
   - D-N : 결혼식 N일 전
   - D-Day : 결혼식 당일
   - D+N : 결혼식 N일 후
   ============================================================ */
(function initDday() {
  // 결혼식 날짜 설정 (월은 0부터 시작하므로 3 = 4월)
  const weddingDate = new Date(2026, 3, 11); // 2026년 4월 11일

  // 오늘 날짜 가져오기
  const today = new Date();

  // 시간을 00:00:00으로 설정하여 날짜만 비교
  today.setHours(0, 0, 0, 0);
  weddingDate.setHours(0, 0, 0, 0);

  // 날짜 차이 계산 (밀리초 단위)
  const diffTime = weddingDate - today;

  // 밀리초를 일수로 변환 (1000ms * 60초 * 60분 * 24시간)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // D-day 표시 요소 찾기
  const ddayEl = document.getElementById("dday-text");

  if (ddayEl) {
    if (diffDays > 0) {
      // 결혼식 전: D-N 형식으로 표시
      ddayEl.innerHTML = "<b>D-" + diffDays + "</b>";
    } else if (diffDays === 0) {
      // 결혼식 당일: D-Day 표시
      ddayEl.innerHTML = "<b>D-Day</b> 오늘이에요!";
    } else {
      // 결혼식 후: D+N 형식으로 표시
      ddayEl.innerHTML = "<b>D+" + Math.abs(diffDays) + "</b>";
    }
  }
})(); // 즉시 실행 함수 (IIFE)로 페이지 로드 시 자동 실행


/* ============================================================
   2. 클립보드 복사 헬퍼
   ============================================================
   텍스트를 클립보드에 복사하는 유틸리티 함수입니다.
   계좌번호 복사 등에 사용됩니다.

   동작 방식:
   1. 최신 Clipboard API 시도 (navigator.clipboard)
   2. 실패 시 구형 브라우저용 fallback 사용 (execCommand)
   ============================================================ */
async function copyText(text) {
  try {
    // 최신 Clipboard API 사용 (비동기)
    await navigator.clipboard.writeText(text);
    toast("복사되었습니다");
  } catch (e) {
    // 구형 브라우저 fallback
    // 임시 textarea 요소를 생성하여 복사 수행
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select(); // 텍스트 선택
    document.execCommand("copy"); // 복사 명령 실행
    document.body.removeChild(ta); // 임시 요소 제거
    toast("복사되었습니다");
  }
}


/* ============================================================
   3. 공유하기 헬퍼
   ============================================================
   페이지 URL을 공유하는 함수입니다.

   동작 방식:
   1. Web Share API 지원 시: 네이티브 공유 UI 표시 (모바일)
   2. 미지원 시: 링크를 클립보드에 복사
   ============================================================ */
async function sharePage() {
  // 공유할 데이터 객체 구성
  const shareData = {
    title: document.title,    // 페이지 제목
    text: "모바일 청첩장",     // 공유 텍스트
    url: location.href        // 현재 페이지 URL
  };

  // Web Share API 지원 여부 확인
  if (navigator.share) {
    try {
      // 네이티브 공유 UI 표시
      await navigator.share(shareData);
    } catch (e) {
      // 사용자가 공유를 취소한 경우 - 별도 처리 없음
    }
  } else {
    // Web Share API 미지원 시 링크 복사로 대체
    await copyText(location.href);
    toast("링크를 복사했어요");
  }
}


/* ============================================================
   4. 토스트 알림
   ============================================================
   화면 하단에 짧은 알림 메시지를 표시합니다.
   - 복사 완료, 공유 완료 등의 피드백에 사용
   - 1.3초 후 자동으로 사라짐
   - 동시에 여러 토스트 호출 시 마지막 것만 표시
   ============================================================ */
let toastTimer = null; // 토스트 타이머 (중복 방지용)

function toast(message) {
  // 이전 타이머가 있으면 취소 (중복 토스트 방지)
  clearTimeout(toastTimer);

  // 기존 토스트 요소 찾기
  let el = document.getElementById("toast");

  // 토스트 요소가 없으면 새로 생성
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";

    // 토스트 스타일 설정
    el.style.position = "fixed";           // 고정 위치
    el.style.left = "50%";                 // 가로 중앙
    el.style.bottom = "18px";              // 하단에서 18px 위
    el.style.transform = "translateX(-50%)"; // 정확한 중앙 정렬
    el.style.padding = "10px 14px";        // 내부 여백
    el.style.borderRadius = "999px";       // 둥근 모서리 (pill 형태)
    el.style.background = "rgba(17,24,39,.92)"; // 어두운 배경 (반투명)
    el.style.color = "#fff";               // 흰색 텍스트
    el.style.fontWeight = "700";           // 굵은 글씨
    el.style.fontSize = "13px";            // 글자 크기
    el.style.zIndex = "9999";              // 최상위 레이어
    el.style.boxShadow = "0 10px 20px rgba(0,0,0,.18)"; // 그림자
    el.style.opacity = "0";                // 초기 투명도 (숨김)
    el.style.transition = "opacity .2s ease"; // 페이드 애니메이션

    // body에 추가
    document.body.appendChild(el);
  }

  // 메시지 내용 설정
  el.textContent = message;

  // 다음 프레임에서 페이드인 (부드러운 애니메이션을 위해)
  requestAnimationFrame(() => (el.style.opacity = "1"));

  // 1.3초 후 페이드아웃
  toastTimer = setTimeout(() => (el.style.opacity = "0"), 1300);
}


/* ============================================================
   5. 라이트박스 (이미지 확대 보기)
   ============================================================
   갤러리 이미지를 클릭하면 전체 화면으로 확대하여 보여줍니다.

   기능:
   - 이전/다음 버튼으로 이미지 탐색
   - 키보드 지원 (좌우 화살표, ESC)
   - 배경 클릭 또는 X 버튼으로 닫기
   - 현재 이미지 번호 / 전체 이미지 수 표시
   ============================================================ */
(function initLightbox() {
  // ===== DOM 요소 참조 =====
  const lightbox = document.getElementById("lightbox");

  // 라이트박스 요소가 없으면 초기화 중단
  if (!lightbox) return;

  // 라이트박스 내부 요소들
  const img = document.getElementById("lightbox-img");      // 확대 이미지
  const closeBtn = lightbox.querySelector(".lightbox-close"); // 닫기 버튼
  const prevBtn = lightbox.querySelector(".lightbox-prev");   // 이전 버튼
  const nextBtn = lightbox.querySelector(".lightbox-next");   // 다음 버튼
  const currentEl = document.getElementById("lightbox-current"); // 현재 번호
  const totalEl = document.getElementById("lightbox-total");     // 전체 개수

  // ===== 이미지 데이터 수집 =====
  // 갤러리의 모든 썸네일에서 원본 이미지 URL 추출
  const thumbs = document.querySelectorAll(".gallery .thumb");
  const images = Array.from(thumbs).map(t => t.dataset.img);

  // 현재 보고 있는 이미지의 인덱스
  let currentIndex = 0;

  // 전체 이미지 수 표시
  totalEl.textContent = images.length;

  // ===== 라이트박스 열기 =====
  function open(index) {
    currentIndex = index;
    img.src = images[currentIndex];           // 이미지 설정
    currentEl.textContent = currentIndex + 1; // 현재 번호 (1부터 시작)
    lightbox.classList.add("active");         // 표시
    lightbox.setAttribute("aria-hidden", "false"); // 접근성
    document.body.style.overflow = "hidden";  // 배경 스크롤 방지
  }

  // ===== 라이트박스 닫기 =====
  function close() {
    lightbox.classList.remove("active");      // 숨김
    lightbox.setAttribute("aria-hidden", "true"); // 접근성
    document.body.style.overflow = "";        // 스크롤 복원
  }

  // ===== 이전 이미지로 이동 =====
  function prev() {
    // 순환 탐색: 첫 번째에서 이전으로 가면 마지막으로
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    img.src = images[currentIndex];
    currentEl.textContent = currentIndex + 1;
  }

  // ===== 다음 이미지로 이동 =====
  function next() {
    // 순환 탐색: 마지막에서 다음으로 가면 첫 번째로
    currentIndex = (currentIndex + 1) % images.length;
    img.src = images[currentIndex];
    currentEl.textContent = currentIndex + 1;
  }

  // ===== 이벤트 리스너 등록 =====

  // 썸네일 클릭 시 해당 이미지로 라이트박스 열기
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => open(i));
  });

  // 닫기 버튼 클릭
  closeBtn.addEventListener("click", close);

  // 배경(오버레이) 클릭 시 닫기 (이미지 클릭은 제외)
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  // 이전/다음 버튼 클릭
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // 키보드 네비게이션
  document.addEventListener("keydown", (e) => {
    // 라이트박스가 열려있을 때만 동작
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") close();       // ESC: 닫기
    if (e.key === "ArrowLeft") prev();     // 좌측 화살표: 이전
    if (e.key === "ArrowRight") next();    // 우측 화살표: 다음
  });
})(); // 즉시 실행 함수로 페이지 로드 시 초기화


/* ============================================================
   6. 지도 탭 전환
   ============================================================
   카카오 지도 / 네이버 지도 탭을 클릭하면 해당 지도로 전환합니다.
   ============================================================ */
(function initMapTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // 탭 버튼이 없으면 초기화 중단
  if (!tabButtons.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab; // data-tab 속성값 (kakao 또는 naver)

      // 모든 버튼에서 active 제거
      tabButtons.forEach((b) => b.classList.remove("active"));
      // 클릭된 버튼에 active 추가
      btn.classList.add("active");

      // 모든 콘텐츠 숨기기
      tabContents.forEach((content) => content.classList.remove("active"));
      // 해당 탭 콘텐츠 표시
      const targetContent = document.getElementById("tab-" + tabId);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });
})();
