(() => {
  const key = "anonisko-terms-agreed-v1";
  if (localStorage.getItem(key) !== "yes") {
    window.location.replace("/consent");
  }
})();