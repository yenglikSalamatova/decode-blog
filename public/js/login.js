/* eslint-disable */

const login = async (email, password) => {
  try {
    const res = await axios.post("/api/users/signin", { email, password });
    if (res.data.status === "success") {
      location.assign("/");
    }
  } catch (err) {
    window.location.assign("/login");
  }
};

document.querySelector(".form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
