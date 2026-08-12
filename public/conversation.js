(() => {
const storageKey = "anonisko-session";
const profileKey = "anonisko-profile";
const sessionUuid = localStorage.getItem(storageKey);
const profile = JSON.parse(localStorage.getItem(profileKey) || "null");

if (!sessionUuid || !profile) {
window.location.replace("/home");
return;
}

const socket = io({ auth: { sessionUuid }, transports: ["websocket", "polling"] });

const $ = (id) => document.getElementById(id);
const reconnectView = $("reconnectView");
const findingView = $("findingView");
const connectedAnimationView = $("connectedAnimationView");
const connectedAnimationTitle = $("connectedAnimationTitle");
const chatView = $("chatView");
const partnerNickname = $("partnerNickname");
const partnerDetails = $("partnerDetails");
const partnerContext = $("partnerContext");
const messages = $("messages");
const messageForm = $("messageForm");
const messageInput = $("messageInput");
const characterCounter = $("characterCounter");
const typingStatus = $("typingStatus");
const waitingCount = $("waitingCount");
const onlineCount = $("onlineCount");
const conversationClock = $("conversationClock");
const mobileConversationClock = $("mobileConversationClock");
const presenceHeadline = $("presenceHeadline");
const presenceMessage = $("presenceMessage");
const icebreakerButton = $("icebreakerButton");
const emptyConversationState = $("emptyConversationState");
const emptyIcebreakerButton = $("emptyIcebreakerButton");
const newMessagesButton = $("newMessagesButton");
const newMessagesCount = $("newMessagesCount");
const offlineBanner = $("offlineBanner");
const siteFavicon = $("siteFavicon");

const endedState = $("endedState");
const endedStatusText = $("endedStatusText");
const endedHeading = $("endedHeading");
const endedReportLink = $("endedReportLink");
const endedBlockLink = $("endedBlockLink");
const nextConversationButton = $("nextConversationButton");

const endConfirmDialog = $("endConfirmDialog");
const cancelEndConfirm = $("cancelEndConfirm");
const confirmEndButton = $("confirmEndButton");
const endButtonHeader = $("endButtonHeader");

const moreActionsButton = $("moreActionsButton");
const moreActionsDialog = $("moreActionsDialog");
const moreReportButton = $("moreReportButton");
const moreBlockButton = $("moreBlockButton");
const closeMoreActions = $("closeMoreActions");

const messageActionDialog = $("messageActionDialog");
const sheetReplyButton = $("sheetReplyButton");
const closeMessageActions = $("closeMessageActions");

const blockConfirmDialog = $("blockConfirmDialog");
const blockConfirmTitle = $("blockConfirmTitle");
const cancelBlockConfirm = $("cancelBlockConfirm");
const confirmBlockButton = $("confirmBlockButton");

const reportDialog = $("reportDialog");
const reportForm = $("reportForm");
const reportReason = $("reportReason");
const reportDetails = $("reportDetails");
const closeReport = $("closeReport");
const cancelReport = $("cancelReport");

const voiceRecorder = $("voiceRecorder");
const recordingWaveform = $("recordingWaveform");
const voiceTimer = $("voiceTimer");
const cancelVoiceButton = $("cancelVoiceButton");
const sendVoiceButton = $("sendVoiceButton");
const voiceButtonDesktop = $("voiceButtonDesktop");
const voiceButtonMobile = $("voiceButtonMobile");

const replyPreview = $("replyPreview");
const replyPreviewSender = $("replyPreviewSender");
const replyPreviewText = $("replyPreviewText");
const cancelReplyButton = $("cancelReplyButton");

let currentPartner = null;
let endedPartner = null;
let endingLocally = false;
let clockTimer = null;
let conversationStartedAt = 0;
let typingTimer = null;
let replyingTo = null;
let selectedMessageForSheet = null;
let lastMessageDay = null;
let unreadInChat = 0;
let tabUnread = 0;
let originalTitle = document.title;
let originalFavicon = siteFavicon?.href || "/assets/favicon.svg";

let audioContext = null;
let mediaRecorder = null;
let voiceChunks = [];
let voiceStream = null;
let voiceStartedAt = 0;
let voiceTimerInterval = null;
let pendingVoiceBlob = null;
let recordingAnalyser = null;
let recordingAnimationFrame = null;
let recordingAudioContext = null;
const voiceObjectUrls = new Set();

function haptic(pattern = 12) {
if (navigator.vibrate) navigator.vibrate(pattern);
}

function showOnly(view) {
[reconnectView, findingView, connectedAnimationView, chatView].forEach((el) => el?.classList.add("hidden"));
view?.classList.remove("hidden");
}

function partnerLabel(gender) {
return gender === "female" ? "Female" : "Male";
}

function formatDuration(totalSeconds) {
const safe = Math.max(0, Math.floor(totalSeconds || 0));
const hours = String(Math.floor(safe / 3600)).padStart(2, "0");
const minutes = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
const seconds = String(safe % 60).padStart(2, "0");
return `${hours}:${minutes}:${seconds}`;
}

function formatVoiceTime(totalSeconds) {
const safe = Math.max(0, Math.floor(totalSeconds || 0));
return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function formatMessageTime(value) {
const date = new Date(value || Date.now());
return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dayKey(value) {
const date = new Date(value || Date.now());
return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(value) {
const date = new Date(value || Date.now());
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

if (dayKey(date) === dayKey(today)) return "Today";
if (dayKey(date) === dayKey(yesterday)) return "Yesterday";
return date.toLocaleDateString([], { month: "short", day: "numeric", year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
}

function insertDateSeparator(sentAt) {
const key = dayKey(sentAt);
if (key === lastMessageDay) return;
lastMessageDay = key;

const separator = document.createElement("div");
separator.className = "date-separator";
separator.innerHTML = `<span>${dayLabel(sentAt)}</span>`;
messages.appendChild(separator);
}

function isNearBottom() {
return messages.scrollHeight - messages.scrollTop - messages.clientHeight < 90;
}

function scrollToBottom(behavior = "smooth") {
messages.scrollTo({ top: messages.scrollHeight, behavior });
unreadInChat = 0;
newMessagesButton.classList.add("hidden");
}

function afterAppend({ incoming = false, force = false } = {}) {
hideEmptyState();

if (force || isNearBottom() || !incoming) {
requestAnimationFrame(() => scrollToBottom(incoming ? "smooth" : "auto"));
return;
}

unreadInChat += 1;
newMessagesCount.textContent = unreadInChat === 1 ? "1 new message" : `${unreadInChat} new messages`;
newMessagesButton.classList.remove("hidden");
}

function hideEmptyState() {
emptyConversationState?.classList.add("hidden");
}

function updateTabUnread(increment = false) {
if (increment && document.hidden) tabUnread += 1;

if (tabUnread > 0) {
document.title = `(${tabUnread}) AnonIsko`;
if (siteFavicon) {
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%237a0019"/><path d="M17 18h30v20H31l-10 8v-8h-4z" fill="%23fff7f3"/><circle cx="51" cy="12" r="9" fill="%23d92d4f"/></svg>`;
siteFavicon.href = `data:image/svg+xml,${svg}`;
}
} else {
document.title = originalTitle;
if (siteFavicon) siteFavicon.href = originalFavicon;
}
}

function startClock() {
stopClock();
conversationStartedAt = Date.now();

const update = () => {
const value = formatDuration((Date.now() - conversationStartedAt) / 1000);
conversationClock.textContent = value;
if (mobileConversationClock) mobileConversationClock.textContent = value;
};

update();
clockTimer = setInterval(update, 1000);
}

function stopClock() {
clearInterval(clockTimer);
clockTimer = null;
}

function getAudioContext() {
if (!audioContext) {
const Ctx = window.AudioContext || window.webkitAudioContext;
if (Ctx) audioContext = new Ctx();
}
return audioContext;
}

function tone(frequency, duration = .08, gainValue = .03, delay = 0) {
const ctx = getAudioContext();
if (!ctx) return;
const start = ctx.currentTime + delay;
const oscillator = ctx.createOscillator();
const gain = ctx.createGain();
oscillator.frequency.value = frequency;
gain.gain.setValueAtTime(.0001, start);
gain.gain.exponentialRampToValueAtTime(gainValue, start + .01);
gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
oscillator.connect(gain);
gain.connect(ctx.destination);
oscillator.start(start);
oscillator.stop(start + duration + .02);
}

function playSound(name) {
if (name === "send") tone(520, .06, .02);
if (name === "receive") { tone(660, .07, .025); tone(820, .07, .015, .055); }
if (name === "match") { tone(440, .08, .02); tone(660, .09, .02, .07); tone(880, .12, .018, .15); }
if (name === "end") { tone(520, .08, .02); tone(390, .11, .018, .08); }
}

function setReply(message) {
replyingTo = message;
replyPreviewSender.textContent = message.sender === "partner" ? (currentPartner?.nickname || "partner") : "your message";
replyPreviewText.textContent = message.text;
replyPreview.classList.remove("hidden");
messageInput.focus();
}

function clearReply() {
replyingTo = null;
replyPreview.classList.add("hidden");
replyPreviewText.textContent = "";
}

function createReplyQuote(reply) {
if (!reply) return null;
const quote = document.createElement("div");
quote.className = "message-reply-quote";
const label = document.createElement("span");
label.textContent = "reply";
const text = document.createElement("p");
text.textContent = reply.text;
quote.append(label, text);
return quote;
}

function createTimestamp(sentAt) {
const stamp = document.createElement("time");
stamp.className = "message-timestamp";
stamp.dateTime = new Date(sentAt || Date.now()).toISOString();
stamp.textContent = formatMessageTime(sentAt);
return stamp;
}

function openMessageActions(message) {
selectedMessageForSheet = message;
messageActionDialog.showModal();
}

function attachMessageInteractions(row, bubble, message) {
const replyButton = document.createElement("button");
replyButton.type = "button";
replyButton.className = "message-reply-button";
replyButton.textContent = "Reply";
replyButton.addEventListener("click", () => setReply(message));

let longPressTimer = null;
const beginPress = () => {
if (window.matchMedia("(max-width: 768px)").matches) {
longPressTimer = setTimeout(() => {
haptic(18);
openMessageActions(message);
}, 450);
}
};
const cancelPress = () => clearTimeout(longPressTimer);

bubble.addEventListener("touchstart", beginPress, { passive: true });
bubble.addEventListener("touchend", cancelPress);
bubble.addEventListener("touchmove", cancelPress);
bubble.addEventListener("contextmenu", (event) => {
if (!window.matchMedia("(max-width: 768px)").matches) return;
event.preventDefault();
openMessageActions(message);
});

row.appendChild(replyButton);
}

function addTextMessage(event, type, options = {}) {
insertDateSeparator(event.sentAt);

const row = document.createElement("div");
row.className = `message-row ${type} message-enter`;
row.dataset.messageId = event.id || event.clientId || "";

const bubble = document.createElement("div");
bubble.className = `message ${type}`;

const quote = createReplyQuote(event.reply);
if (quote) bubble.appendChild(quote);

const body = document.createElement("span");
body.className = "message-body";
body.textContent = event.text;
bubble.appendChild(body);

bubble.appendChild(createTimestamp(event.sentAt));

const messageForReply = {
id: event.id || event.clientId || "",
text: event.text,
sender: type === "theirs" ? "partner" : "you"
};

row.appendChild(bubble);
attachMessageInteractions(row, bubble, messageForReply);

if (type === "mine") {
const delivery = document.createElement("span");
delivery.className = "delivery-status";
delivery.textContent = options.status || "sent";
row.appendChild(delivery);
}

messages.appendChild(row);
afterAppend({ incoming: type === "theirs", force: options.force });
return row;
}

function addOptimisticMessage(text, reply, clientId) {
return addTextMessage({
clientId,
text,
reply,
sentAt: new Date().toISOString()
}, "mine", { status: "sending", force: true });
}

function updateOutgoingMessage(clientId, event) {
const row = messages.querySelector(`[data-message-id="${CSS.escape(clientId)}"]`);
if (!row) return addTextMessage(event, "mine", { status: "sent", force: true });

row.dataset.messageId = event.id;
const status = row.querySelector(".delivery-status");
if (status) status.textContent = "sent";
const stamp = row.querySelector(".message-timestamp");
if (stamp) {
stamp.dateTime = new Date(event.sentAt).toISOString();
stamp.textContent = formatMessageTime(event.sentAt);
}
}

function updateDeliveryStatus(id, statusText) {
const row = messages.querySelector(`[data-message-id="${CSS.escape(id)}"]`);
const status = row?.querySelector(".delivery-status");
if (status) status.textContent = statusText;
}

function addSystemMessage(text, sentAt = new Date().toISOString()) {
insertDateSeparator(sentAt);
const el = document.createElement("div");
el.className = "system-message message-enter";
el.textContent = text;
messages.appendChild(el);
afterAppend({ force: true });
}

function normalizeAudioBytes(audio) {
if (audio instanceof ArrayBuffer) return audio;
if (ArrayBuffer.isView(audio)) return audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength);
if (audio?.type === "Buffer" && Array.isArray(audio.data)) return new Uint8Array(audio.data).buffer;
return null;
}

function makeWaveform(count = 24) {
const waveform = document.createElement("div");
waveform.className = "voice-waveform";
for (let i = 0; i < count; i++) {
const bar = document.createElement("span");
bar.style.height = `${7 + ((i * 11) % 19)}px`;
waveform.appendChild(bar);
}
return waveform;
}

function addVoiceMessage(audioBytes, mimeType, duration, type, sentAt = new Date().toISOString()) {
const bytes = normalizeAudioBytes(audioBytes);
if (!bytes) {
addSystemMessage("This voice message could not be loaded.");
return;
}

insertDateSeparator(sentAt);
const blob = new Blob([bytes], { type: mimeType || "audio/webm" });
const objectUrl = URL.createObjectURL(blob);
voiceObjectUrls.add(objectUrl);

const row = document.createElement("div");
row.className = `voice-message-row ${type} message-enter`;

const wrapper = document.createElement("div");
wrapper.className = `voice-message ${type}`;

const play = document.createElement("button");
play.type = "button";
play.className = "voice-play-button";
play.setAttribute("aria-label", "Play voice message");
play.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7Z"/></svg>';

const waveform = makeWaveform();
const bars = [...waveform.children];

const progress = document.createElement("span");
progress.className = "voice-duration";
progress.textContent = `0:00 / ${formatVoiceTime(duration)}`;

const stamp = createTimestamp(sentAt);
const audio = document.createElement("audio");
audio.src = objectUrl;
audio.preload = "metadata";
audio.playsInline = true;

play.addEventListener("click", async (event) => {
event.preventDefault();
try {
if (audio.paused) {
await audio.play();
play.classList.add("playing");
} else {
audio.pause();
}
} catch {
addSystemMessage("This voice message could not be played on this browser.");
}
});

audio.addEventListener("timeupdate", () => {
const total = Number.isFinite(audio.duration) ? audio.duration : duration;
const ratio = total > 0 ? audio.currentTime / total : 0;
const activeBars = Math.round(ratio * bars.length);
bars.forEach((bar, index) => bar.classList.toggle("played", index < activeBars));
progress.textContent = `${formatVoiceTime(audio.currentTime)} / ${formatVoiceTime(total)}`;
});

audio.addEventListener("ended", () => play.classList.remove("playing"));
audio.addEventListener("pause", () => play.classList.remove("playing"));

wrapper.append(play, waveform, progress, stamp, audio);
row.appendChild(wrapper);
messages.appendChild(row);
afterAppend({ incoming: type === "theirs" });
}

function renderRecordingBars() {
recordingWaveform.replaceChildren();
for (let i = 0; i < 26; i++) {
const bar = document.createElement("i");
bar.style.height = "6px";
recordingWaveform.appendChild(bar);
}
}

function startRecordingVisualizer(stream) {
renderRecordingBars();
try {
const Ctx = window.AudioContext || window.webkitAudioContext;
recordingAudioContext = new Ctx();
const source = recordingAudioContext.createMediaStreamSource(stream);
recordingAnalyser = recordingAudioContext.createAnalyser();
recordingAnalyser.fftSize = 64;
source.connect(recordingAnalyser);
const data = new Uint8Array(recordingAnalyser.frequencyBinCount);
const bars = [...recordingWaveform.children];

const draw = () => {
recordingAnalyser.getByteFrequencyData(data);
bars.forEach((bar, index) => {
const value = data[index % data.length] || 0;
bar.style.height = `${6 + Math.round((value / 255) * 22)}px`;
});
recordingAnimationFrame = requestAnimationFrame(draw);
};
draw();
} catch {}
}

function stopRecordingVisualizer() {
cancelAnimationFrame(recordingAnimationFrame);
recordingAnimationFrame = null;
if (recordingAudioContext) recordingAudioContext.close().catch(() => {});
recordingAudioContext = null;
recordingAnalyser = null;
}

function getSupportedVoiceMimeType() {
const options = ["audio/mp4;codecs=mp4a.40.2","audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus"];
if (!window.MediaRecorder) return "";
return options.find((type) => {
try { return MediaRecorder.isTypeSupported(type); } catch { return false; }
}) || "";
}

async function requestMicrophoneStream() {
if (navigator.mediaDevices?.getUserMedia) {
return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
}
throw new Error("microphone-api-unavailable");
}

async function startVoiceRecording() {
if (!window.isSecureContext && !["localhost","127.0.0.1"].includes(location.hostname)) {
addSystemMessage("Voice messages need HTTPS on phones and other devices.");
return;
}
if (!window.MediaRecorder) {
addSystemMessage("Voice messages are not supported by this browser version.");
return;
}

try {
voiceStream = await requestMicrophoneStream();
voiceChunks = [];
pendingVoiceBlob = null;
const mimeType = getSupportedVoiceMimeType();

try {
mediaRecorder = mimeType ? new MediaRecorder(voiceStream, { mimeType, audioBitsPerSecond: 64000 }) : new MediaRecorder(voiceStream);
} catch {
mediaRecorder = new MediaRecorder(voiceStream);
}

mediaRecorder.addEventListener("dataavailable", (event) => {
if (event.data?.size) voiceChunks.push(event.data);
});

mediaRecorder.addEventListener("stop", () => {
const finalType = mediaRecorder?.mimeType || voiceChunks[0]?.type || mimeType || "audio/webm";
pendingVoiceBlob = new Blob(voiceChunks, { type: finalType });
});

mediaRecorder.start(250);
voiceStartedAt = Date.now();
voiceRecorder.classList.remove("hidden");
startRecordingVisualizer(voiceStream);
haptic(10);

voiceTimerInterval = setInterval(() => {
const seconds = Math.floor((Date.now() - voiceStartedAt) / 1000);
voiceTimer.textContent = formatVoiceTime(seconds);
if (seconds >= 90 && mediaRecorder?.state === "recording") mediaRecorder.stop();
}, 250);
} catch (error) {
if (error?.name === "NotAllowedError") addSystemMessage("Microphone permission is blocked in your browser settings.");
else addSystemMessage("Could not start the microphone.");
resetVoiceRecorder();
}
}

function resetVoiceRecorder() {
clearInterval(voiceTimerInterval);
voiceTimerInterval = null;
stopRecordingVisualizer();
pendingVoiceBlob = null;
voiceChunks = [];
if (voiceStream) voiceStream.getTracks().forEach((track) => track.stop());
voiceStream = null;
mediaRecorder = null;
voiceRecorder.classList.add("hidden");
voiceTimer.textContent = "0:00";
}

function stopVoiceRecordingForSend() {
return new Promise((resolve) => {
if (!mediaRecorder || mediaRecorder.state === "inactive") return resolve(pendingVoiceBlob);
mediaRecorder.addEventListener("stop", () => resolve(pendingVoiceBlob), { once: true });
mediaRecorder.stop();
});
}

function showConnected(partner, animate = true) {
endedPartner = null;
endedState.classList.add("hidden");
endedState.classList.remove("visible");
chatView.classList.remove("conversation-finished");
currentPartner = partner;
messageInput.disabled = false;
partnerNickname.textContent = partner.nickname;
partnerDetails.textContent = `${partnerLabel(partner.gender)} · ${partner.campus}`;

const context = [];
if (partner.vibe) context.push(partner.vibe);
if (partner.interests?.length) context.push(partner.interests.join(" · "));
partnerContext.textContent = context.join(" / ");

connectedAnimationTitle.textContent = `found ${partner.nickname}.`;

const enterChat = () => {
showOnly(chatView);
chatView.classList.add("conversation-enter");
setTimeout(() => chatView.classList.remove("conversation-enter"), 500);
startClock();
messageInput.focus();
addSystemMessage(`You are now connected with ${partner.nickname}.`);
haptic([18, 35, 18]);
};

if (animate) {
showOnly(connectedAnimationView);
playSound("match");
setTimeout(enterChat, 1050);
} else {
enterChat();
}
}

function showEndedState(partnerEnded = false) {
stopClock();
messageInput.disabled = true;
resetVoiceRecorder();
playSound("end");
chatView.classList.add("conversation-finished");
endedState.classList.remove("hidden");
endedStatusText.textContent = partnerEnded ? "The other person ended the chat." : "You ended the chat.";
endedHeading.textContent = partnerEnded ? "The other person ended the conversation." : "Your conversation has ended.";
setTimeout(() => endedState.classList.add("visible"), 30);
}

function updateCharacterCounter() {
const length = messageInput.value.length;
if (length >= 800) {
characterCounter.textContent = `${length} / 1000`;
characterCounter.classList.remove("hidden");
characterCounter.classList.toggle("near-limit", length >= 950);
} else {
characterCounter.classList.add("hidden");
}
}

function autoGrowComposer() {
messageInput.style.height = "auto";
messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
}

function updateNetworkState() {
offlineBanner.classList.toggle("hidden", navigator.onLine);
}

function openSafetyMenu() {
moreActionsDialog.showModal();
}

function requestIcebreaker() {
icebreakerButton.disabled = true;
socket.emit("request-icebreaker", (result) => {
setTimeout(() => { icebreakerButton.disabled = false; }, 500);
if (!result?.ok) addSystemMessage(result?.error || "Could not get an icebreaker.");
});
}

messageForm.addEventListener("submit", (event) => {
event.preventDefault();
const text = messageInput.value.trim();
if (!text || !currentPartner) return;

const clientId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const reply = replyingTo ? { ...replyingTo } : null;
addOptimisticMessage(text, reply, clientId);

messageInput.value = "";
autoGrowComposer();
updateCharacterCounter();
clearReply();
socket.emit("typing", { typing: false });

socket.emit("send-message", { text, reply, clientId }, (result) => {
if (!result?.ok) {
updateDeliveryStatus(clientId, "failed");
addSystemMessage(result?.error || "Message could not be sent.");
}
});
});

messageInput.addEventListener("input", () => {
autoGrowComposer();
updateCharacterCounter();
socket.emit("typing", { typing: true });
clearTimeout(typingTimer);
typingTimer = setTimeout(() => socket.emit("typing", { typing: false }), 900);
});

messageInput.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
clearReply();
if (mediaRecorder?.state === "recording") resetVoiceRecorder();
return;
}
if (event.key === "Enter" && !event.shiftKey) {
event.preventDefault();
messageForm.requestSubmit();
}
});

endButtonHeader.addEventListener("click", () => {
if (currentPartner) endConfirmDialog.showModal();
});
cancelEndConfirm.addEventListener("click", () => endConfirmDialog.close());
confirmEndButton.addEventListener("click", () => {
if (!currentPartner || confirmEndButton.disabled) return;
confirmEndButton.disabled = true;
endingLocally = true;
endConfirmDialog.close();

socket.emit("end-chat", (result) => {
confirmEndButton.disabled = false;
if (result?.ok === false) {
endingLocally = false;
addSystemMessage("Could not end the conversation. Please try again.");
}
});
});

moreActionsButton.addEventListener("click", openSafetyMenu);
closeMoreActions.addEventListener("click", () => moreActionsDialog.close());
moreReportButton.addEventListener("click", () => {
moreActionsDialog.close();
reportDialog.showModal();
});
moreBlockButton.addEventListener("click", () => {
moreActionsDialog.close();
const partner = currentPartner || endedPartner;
if (!partner) return;
blockConfirmTitle.textContent = `Block ${partner.nickname}?`;
blockConfirmDialog.showModal();
});

sheetReplyButton.addEventListener("click", () => {
if (selectedMessageForSheet) setReply(selectedMessageForSheet);
messageActionDialog.close();
});
closeMessageActions.addEventListener("click", () => messageActionDialog.close());

[voiceButtonDesktop, voiceButtonMobile].filter(Boolean).forEach((button) => {
button.addEventListener("click", () => {
if (mediaRecorder?.state !== "recording") startVoiceRecording();
});
});

cancelVoiceButton.addEventListener("click", () => {
if (mediaRecorder?.state === "recording") mediaRecorder.stop();
resetVoiceRecorder();
haptic(8);
});

sendVoiceButton.addEventListener("click", async () => {
const duration = Math.max(1, Math.round((Date.now() - voiceStartedAt) / 1000));
const blob = await stopVoiceRecordingForSend();

if (!blob?.size) {
resetVoiceRecorder();
return;
}

try {
const audio = await blob.arrayBuffer();
socket.emit("send-voice", {
audio,
mimeType: blob.type || "audio/webm",
duration
}, (result) => {
if (!result?.ok) addSystemMessage(result?.error || "Voice message could not be sent.");
});
haptic(10);
} finally {
resetVoiceRecorder();
}
});

closeReport.addEventListener("click", () => reportDialog.close());
cancelReport.addEventListener("click", () => reportDialog.close());
reportForm.addEventListener("submit", (event) => {
event.preventDefault();
socket.emit("report", {
reason: reportReason.value,
details: reportDetails.value.trim()
}, (result) => {
reportDialog.close();
addSystemMessage(result?.ok ? "Report submitted." : (result?.error || "Report could not be submitted."));
});
});

cancelBlockConfirm.addEventListener("click", () => blockConfirmDialog.close());
confirmBlockButton.addEventListener("click", () => {
const partner = currentPartner || endedPartner;
if (!partner) return;
blockConfirmDialog.close();
socket.emit("block", (result) => {
if (!result?.ok) addSystemMessage(result?.error || "Could not block this user.");
});
});

endedReportLink.addEventListener("click", () => reportDialog.showModal());
endedBlockLink.addEventListener("click", () => {
const partner = currentPartner || endedPartner;
if (!partner) return;
blockConfirmTitle.textContent = `Block ${partner.nickname}?`;
blockConfirmDialog.showModal();
});

nextConversationButton.addEventListener("click", () => {
sessionStorage.removeItem("anonisko-pending-match");
endedPartner = null;
window.location.href = "/finding";
});

cancelReplyButton.addEventListener("click", clearReply);
icebreakerButton.addEventListener("click", requestIcebreaker);
emptyIcebreakerButton.addEventListener("click", requestIcebreaker);
newMessagesButton.addEventListener("click", () => scrollToBottom());

messages.addEventListener("scroll", () => {
if (isNearBottom()) {
unreadInChat = 0;
newMessagesButton.classList.add("hidden");
}
});

window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);
updateNetworkState();

document.addEventListener("visibilitychange", () => {
if (!document.hidden) {
tabUnread = 0;
updateTabUnread();
}
});

document.addEventListener("pointerdown", () => {
const ctx = getAudioContext();
if (ctx?.state === "suspended") ctx.resume();
}, { once: true });

socket.on("resume-match", ({ partner }) => {
if (!currentPartner) showConnected(partner, false);
});

socket.on("matched", ({ partner }) => showConnected(partner, true));

socket.on("message-sent", (event) => {
updateOutgoingMessage(event.clientId, event);
playSound("send");
});

socket.on("message-received", (event) => {
addTextMessage(event, "theirs");
socket.emit("ack-message", { id: event.id });
playSound("receive");
updateTabUnread(true);
});

socket.on("delivery-update", ({ id, status }) => {
updateDeliveryStatus(id, status || "delivered");
});

socket.on("voice-sent", ({ audio, mimeType, duration, sentAt }) => {
addVoiceMessage(audio, mimeType, duration, "mine", sentAt);
playSound("send");
});

socket.on("voice-received", ({ audio, mimeType, duration, sentAt }) => {
addVoiceMessage(audio, mimeType, duration, "theirs", sentAt);
playSound("receive");
updateTabUnread(true);
});

socket.on("partner-typing", ({ typing }) => {
typingStatus.innerHTML = typing
? '<span class="typing-name">partner is typing</span><span class="typing-dots"><i></i><i></i><i></i></span>'
: "";
});

socket.on("icebreaker", ({ prompt, sentAt }) => {
insertDateSeparator(sentAt);
const card = document.createElement("div");
card.className = "icebreaker-card message-enter";
card.innerHTML = `<span>icebreaker</span><p></p>`;
card.querySelector("p").textContent = prompt;
messages.appendChild(card);
afterAppend({ incoming: true });
updateTabUnread(true);
});

socket.on("chat-ended", ({ endedBySelf }) => {
endedPartner = currentPartner || endedPartner;
currentPartner = null;
endingLocally = false;
showEndedState(endedBySelf === false);
});

socket.on("stats", ({ online, waiting }) => {
onlineCount.textContent = `${online} online`;
waitingCount.textContent = `${waiting} waiting`;
});

socket.on("connect_error", (error) => {
console.warn("socket error:", error?.message || error);
});

window.addEventListener("beforeunload", () => {
voiceObjectUrls.forEach((url) => URL.revokeObjectURL(url));
voiceObjectUrls.clear();
});

setTimeout(() => {
if (!currentPartner && !socket.connected) window.location.replace("/home");
}, 7000);
})();