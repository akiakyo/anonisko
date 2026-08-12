(() => {
  const storageKey = "anonisko-session";
  const profileKey = "anonisko-profile";

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
      const random = Math.random() * 16 | 0;
      const value = char === "x" ? random : (random & 0x3 | 0x8);
      return value.toString(16);
    });
  }

  const sessionUuid = localStorage.getItem(storageKey) || uuid();
  localStorage.setItem(storageKey, sessionUuid);

  const socket = io({ auth: { sessionUuid }, transports: ["websocket", "polling"] });
  const profileForm = document.getElementById("profileForm");
  const nicknameInput = document.getElementById("nickname");
  const campusSelect = document.getElementById("campus");
  const preferenceSelect = document.getElementById("preference");
  const vibeOptions = document.getElementById("vibeOptions");
  const interestOptions = document.getElementById("interestOptions");
  const formMessage = document.getElementById("formMessage");
  const onlineCount = document.getElementById("onlineCount");

  let config = null;
  let selectedVibe = "Chill";
  const selectedInterests = new Set();

  function renderVibes(vibes) {
    vibeOptions.replaceChildren();

    for (const vibe of vibes) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-chip vibe-chip";
      button.textContent = vibe;
      button.dataset.value = vibe;
      button.setAttribute("aria-pressed", String(vibe === selectedVibe));

      button.addEventListener("click", () => {
        selectedVibe = vibe;
        vibeOptions.querySelectorAll(".vibe-chip").forEach((item) => {
          item.setAttribute("aria-pressed", String(item.dataset.value === selectedVibe));
        });
      });

      vibeOptions.appendChild(button);
    }
  }

  function renderInterests(interests) {
    interestOptions.replaceChildren();

    for (const interest of interests) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-chip interest-chip";
      button.textContent = interest;
      button.dataset.value = interest;

      const sync = () => {
        button.setAttribute("aria-pressed", String(selectedInterests.has(interest)));
      };

      button.addEventListener("click", () => {
        if (selectedInterests.has(interest)) {
          selectedInterests.delete(interest);
        } else {
          if (selectedInterests.size >= (config?.maxInterests || 3)) {
            formMessage.textContent = `Choose up to ${config?.maxInterests || 3} interests.`;
            return;
          }
          selectedInterests.add(interest);
        }

        formMessage.textContent = "";
        sync();
      });

      sync();
      interestOptions.appendChild(button);
    }
  }

  async function loadConfig() {
    const response = await fetch("/api/config", { credentials: "same-origin" });
    config = await response.json();

    for (const campus of config.campuses) {
      const option = document.createElement("option");
      option.value = campus;
      option.textContent = campus;
      campusSelect.appendChild(option);
    }

    const saved = JSON.parse(localStorage.getItem(profileKey) || "null");

    if (saved) {
      nicknameInput.value = saved.nickname || "";
      campusSelect.value = saved.campus || "";
      preferenceSelect.value = saved.preference || "anyone";
      selectedVibe = config.vibes.includes(saved.vibe) ? saved.vibe : "Chill";

      for (const interest of saved.interests || []) {
        if (config.interests.includes(interest)) selectedInterests.add(interest);
      }

      const genderInput = document.querySelector(`input[name="gender"][value="${saved.gender}"]`);
      if (genderInput) genderInput.checked = true;
    }

    renderVibes(config.vibes);
    renderInterests(config.interests);
  }

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "";

    const gender = profileForm.querySelector('input[name="gender"]:checked')?.value;
    const profile = {
      nickname: nicknameInput.value.trim(),
      gender,
      campus: campusSelect.value,
      preference: preferenceSelect.value,
      vibe: selectedVibe,
      interests: [...selectedInterests]
    };

    if (profile.nickname.length < 3 || !profile.gender || !profile.campus) {
      formMessage.textContent = "Complete the required fields first.";
      return;
    }

    socket.emit("set-profile", profile, (result) => {
      if (!result?.ok) {
        formMessage.textContent = result?.error || "Could not save your anonymous profile.";
        return;
      }

      localStorage.setItem(profileKey, JSON.stringify(profile));
      window.location.href = "/finding";
    });
  });

  socket.on("stats", ({ online }) => {
    if (onlineCount) onlineCount.textContent = `${online} online`;
  });

  loadConfig().catch(() => {
    formMessage.textContent = "Could not load the matching options.";
  });
})();