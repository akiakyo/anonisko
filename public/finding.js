(() => {
const sessionUuid = localStorage.getItem("anonisko-session");
const profile = JSON.parse(localStorage.getItem("anonisko-profile") || "null");
if (!sessionUuid || !profile) {
window.location.replace("/");
return;
}
const socket = io({ auth: { sessionUuid }, transports: ["websocket", "polling"] });
const title = document.getElementById("findingTitle");
const text = document.getElementById("findingText");
const vibeText = document.getElementById("findingVibe");
const interestsText = document.getElementById("findingInterests");
const onlineCount = document.getElementById("findingOnlineCount");
const waitingCount = document.getElementById("findingWaitingCount");
const matchReveal = document.getElementById("matchReveal");
const matchRevealName = document.getElementById("matchRevealName");
const matchRevealMeta = document.getElementById("matchRevealMeta");
const introLayer = document.getElementById("findingIntroLayer");
const introTitle = document.getElementById("findingIntroTitle");
let searchStarted = false;
let redirecting = false;
const target = profile.gender === "female" ? "Isko" : "Iska";
title.textContent = `Finding an ${target}...`;
if (introTitle) introTitle.textContent = `Finding an ${target}...`;
requestAnimationFrame(() => {
document.body.classList.add("finding-intro-active");
});
setTimeout(() => {
if (introLayer) introLayer.classList.add("finding-intro-complete");
document.body.classList.remove("finding-entering");
}, 1200);
const searchPhrases = [
"checking who is around...",
`looking for an ${target.toLowerCase()}...`,
"matching your vibe and interests...",
"still looking. the right chat might take a second..."
];
let phraseIndex = 0;
text.textContent = searchPhrases[0];
const phraseTimer = setInterval(() => {
phraseIndex = (phraseIndex + 1) % searchPhrases.length;
text.classList.remove("phrase-in");
requestAnimationFrame(() => {
text.textContent = searchPhrases[phraseIndex];
text.classList.add("phrase-in");
});
}, 3800);
vibeText.textContent = profile.vibe ? `vibe: ${profile.vibe}` : "";
interestsText.textContent = profile.interests?.length ? `interests: ${profile.interests.join(", ")}` : "";
socket.on("connect", () => {
if (searchStarted) return;
searchStarted = true;
socket.emit("set-profile", profile, (profileResult) => {
if (!profileResult?.ok) {
searchStarted = false;
return window.location.replace("/");
}
socket.emit("find-match", (result) => {
if (!result?.ok) {
searchStarted = false;
text.textContent = result?.error || "Could not start matchmaking.";
}
});
});
});
socket.on("stats", ({ online, waiting }) => {
onlineCount.textContent = online;
waitingCount.textContent = waiting;
});

socket.on("matched", ({ partner }) => {
if (redirecting) return;
redirecting = true;
searchStarted = false;
sessionStorage.setItem("anonisko-pending-match", JSON.stringify({ partner, matchedAt: Date.now() }));
clearInterval(phraseTimer);
document.body.classList.add("match-found");
title.textContent = "found someone.";
text.textContent = "opening your conversation...";
matchRevealName.textContent = partner.nickname;
matchRevealMeta.textContent = [partner.vibe, ...(partner.interests || []).slice(0, 2)].filter(Boolean).join(" · ");
matchReveal.classList.remove("hidden");
if (navigator.vibrate) navigator.vibrate([18, 35, 18]);
setTimeout(() => window.location.replace("/conversation"), 1450);
});
document.getElementById("cancelFindButton").addEventListener("click", () => {
const cancelButton = document.getElementById("cancelFindButton");
cancelButton.disabled = true;
searchStarted = true;
document.body.classList.add("finding-canceling");
socket.emit("cancel-search");
setTimeout(() => {
clearInterval(phraseTimer);
socket.disconnect();
window.location.href = "/home";
}, 650);
});
})();