const form = document.querySelector(".form-new");
const btnDelete = document.querySelector(".btn-delete");

const imageInput = document.querySelector("#user-img");
const imagePreview = document.querySelector(".user-photo");

imageInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("upload", file);
  const res = await axios.post("/api/blogs/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
      "Content-Type": "multipart/form-data",
    },
  });
  if (res.data.status === "success") {
    location.assign(`/user/${res.data.data.updatedUser.username}`);
  }
});

btnDelete.addEventListener("click", async (e) => {
  e.preventDefault();
  const id = document.querySelector(".input-id").value;
  console.log(id);
  const conf = confirm("Вы действительно хотите удалить свой аккаунт?");
  if (conf) {
    const res = await axios.delete("/api/users/deleteMe/" + id);
    if (res.status == 204) {
      location.assign(`/`);
    }
  }
});
