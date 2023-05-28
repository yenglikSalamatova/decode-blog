const form = document.querySelector(".form-new");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  try {
    const response = await axios.post("/api/blogs", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    if (response.status === 201) {
      window.location.href = "/";
    } else {
      console.log("Blog creation failed:", response.data);
    }
  } catch (error) {
    console.error(error);
  }
});
