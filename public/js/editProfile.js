const form = document.querySelector(".form-new");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const res = await axios.patch("/api/users/updateMe", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  if (res.data.status === "success") {
    location.assign(`/user/${res.data.data.updatedUser.username}`);
  }
});
