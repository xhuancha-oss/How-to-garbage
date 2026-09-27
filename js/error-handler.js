window.addEventListener("error", function (event) {
  const box = document.getElementById("error");
  if (box) {
    box.style.display = "block";
    box.textContent =
      "GAME ERROR: " + (event.message || "Unknown JavaScript error");
  }
});

window.addEventListener("unhandledrejection", function (event) {
  const box = document.getElementById("error");
  if (box) {
    box.style.display = "block";
    const reason =
      event.reason && event.reason.message
        ? event.reason.message
        : String(event.reason);
    box.textContent = "GAME ERROR: " + reason;
  }
});
