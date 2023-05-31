const form = document.querySelector(".form-login");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  try {
    const res = await axios.post("/api/users/signup", formData);
    if (res.status === 201) {
      location.href("/");
    }
  } catch (err) {
    console.error(err);
  }
});
