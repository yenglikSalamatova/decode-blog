const form = document.querySelector(".form-login");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    username: document.getElementById("username").value,
    re_password: document.getElementById("re_password").value,
  };
  axios({
    url: "/api/users/signup",
    method: "post",
    data: data,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      location.assign("/login");
    })
    .catch((error) => {
      console.error(error);
    });
});
