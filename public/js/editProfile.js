const form = document.querySelector(".form-new");

const imageInput = document.querySelector("#user-img");
const imagePreview = document.querySelector(".user-photo");

imageInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("upload", file);
  const res = await axios.post("/api/blogs/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  if (res.data.url) {
    imagePreview.src = res.data.url;
  } else {
    console.log("Ошибка при загрузке фотографии:", response.statusText);
  }
});
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
