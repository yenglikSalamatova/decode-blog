const form = document.querySelector(".form-new");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const blogId = formData.get("blogId");
  const currentUsername = formData.get("currentUser");

  try {
    const response = await axios.patch(`/api/blogs/${blogId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    if (response.status === 201) {
      window.location.href = `/user/${currentUsername}`;
    } else {
      console.log("Blog creation failed:", response.data);
    }
  } catch (error) {
    console.error(error);
  }
});
