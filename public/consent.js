(() => {
  const key = "anonisko-terms-agreed-v1";
  const checkbox = document.getElementById("agreeCheckbox");
  const button = document.getElementById("agreeButton");

  if (localStorage.getItem(key) === "yes") {
    window.location.replace("/home");
    return;
  }

  checkbox.addEventListener("change", () => {
    button.disabled = !checkbox.checked;
  });

  button.addEventListener("click", () => {
    if (!checkbox.checked || button.disabled) return;

    button.disabled = true;
    button.textContent = "Continuing...";

    localStorage.setItem(key, "yes");
    document.body.classList.add("consent-leaving");

    setTimeout(() => {
      window.location.replace("/home");
    }, 420);
  });
})();