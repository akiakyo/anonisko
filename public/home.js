(() => {
const cards = [...document.querySelectorAll(".reveal-card")];
if (!("IntersectionObserver" in window)) {
cards.forEach((card) => card.classList.add("visible"));
return;
}
const observer = new IntersectionObserver((entries) => {
for (const entry of entries) {
if (entry.isIntersecting) {
entry.target.classList.add("visible");
observer.unobserve(entry.target);
}
}
}, { threshold: 0.18 });
cards.forEach((card, i) => {
card.style.transitionDelay = `${i * 90}ms`;
observer.observe(card);
});
})();
(() => {
const modal = document.getElementById("homeChatModal");
const openButton = document.getElementById("openChatModal");
const closeButton = document.getElementById("closeHomeChatModal");
if (!modal || !openButton || !closeButton) return;
openButton.addEventListener("click", () => {
modal.classList.remove("modal-pop-in");
modal.showModal();
document.body.classList.add("modal-open");
requestAnimationFrame(() => {
modal.classList.add("modal-pop-in");
});
});
closeButton.addEventListener("click", () => {
modal.close();
});
modal.addEventListener("close", () => {
document.body.classList.remove("modal-open");
});
modal.addEventListener("click", (event) => {
const rect = modal.getBoundingClientRect();
const isBackdrop =
event.clientX < rect.left ||
event.clientX > rect.right ||
event.clientY < rect.top ||
event.clientY > rect.bottom;
if (isBackdrop) modal.close();
});
})();
(() => {
const intro = document.getElementById("siteIntro");
if (!intro) return;
function runHomeIntro() {
intro.classList.remove("intro-complete");
document.body.classList.add("home-entering");
requestAnimationFrame(() => {
intro.classList.add("intro-active");
});
setTimeout(() => {
intro.classList.add("intro-complete");
document.body.classList.remove("home-entering");
}, 1450);
}
window.addEventListener("pageshow", () => {
runHomeIntro();
});
})();