// ======= D-day countdown =======
(function initDday() {
  const weddingDate = new Date(2026, 3, 11); // 2026년 4월 11일 (월은 0부터 시작)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDate.setHours(0, 0, 0, 0);

  const diffTime = weddingDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const ddayEl = document.getElementById("dday-text");
  if (ddayEl) {
    if (diffDays > 0) {
      ddayEl.innerHTML = "<b>D-" + diffDays + "</b>";
    } else if (diffDays === 0) {
      ddayEl.innerHTML = "<b>D-Day</b> 오늘이에요!";
    } else {
      ddayEl.innerHTML = "<b>D+" + Math.abs(diffDays) + "</b>";
    }
  }
})();

// ======= Copy helper =======
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("복사되었습니다");
  } catch (e) {
    // 구형 브라우저 fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    toast("복사되었습니다");
  }
}

// ======= Share helper =======
async function sharePage() {
  const shareData = {
    title: document.title,
    text: "모바일 청첩장",
    url: location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (e) { /* user cancel */ }
  } else {
    await copyText(location.href);
    toast("링크를 복사했어요");
  }
}

// ======= Tiny toast =======
let toastTimer = null;
function toast(message) {
  clearTimeout(toastTimer);
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "18px";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "999px";
    el.style.background = "rgba(17,24,39,.92)";
    el.style.color = "#fff";
    el.style.fontWeight = "700";
    el.style.fontSize = "13px";
    el.style.zIndex = "9999";
    el.style.boxShadow = "0 10px 20px rgba(0,0,0,.18)";
    el.style.opacity = "0";
    el.style.transition = "opacity .2s ease";
    document.body.appendChild(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => (el.style.opacity = "1"));
  toastTimer = setTimeout(() => (el.style.opacity = "0"), 1300);
}
