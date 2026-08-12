(() => {
const key = "anonisko-theme";
const root = document.documentElement;
function preferredTheme() {
const saved = localStorage.getItem(key);
if (saved === "dark" || saved === "light") return saved;
return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function apply(theme) {
root.dataset.theme = theme;
localStorage.setItem(key, theme);
document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
button.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
});
}
apply(preferredTheme());
document.addEventListener("click", (event) => {
const button = event.target.closest("[data-theme-toggle]");
if (!button) return;
apply(root.dataset.theme === "dark" ? "light" : "dark");
});
})();