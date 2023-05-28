const settingsBtns = document.querySelectorAll(".article-top__right");

settingsBtns.forEach((settingsBtn) => {
  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const modalBtns = settingsBtn.parentElement.querySelector(
      ".article-settings__btns"
    );

    const allModalBtns = document.querySelectorAll(".article-settings__btns");
    allModalBtns.forEach((btns) => {
      if (btns !== modalBtns) {
        btns.classList.add("hidden");
      }
    });

    modalBtns.classList.toggle("hidden");
  });

  const links = settingsBtn.parentElement.querySelectorAll(
    ".article-settings__btns a"
  );
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
});

const blogDescriptions = document.querySelectorAll(".article-text");
const maxLength = 150;
blogDescriptions.forEach((description) => {
  const text = description.textContent.trim();
  if (text.length > maxLength) {
    description.textContent = text.slice(0, maxLength) + "...";
  }
});
