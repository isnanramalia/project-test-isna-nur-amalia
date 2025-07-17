// global function
function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

// start app when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.ideasApp = new IdeasApp();
});
