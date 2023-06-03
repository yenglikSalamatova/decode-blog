/* eslint-disable */

const login = async (email, password) => {
  try {
    const res = await axios.post("/api/users/signin", { email, password });
    console.log(res);
    if (res.status === 200) {
      location.assign("/");
    }
  } catch (err) {
    console.error(err);
  }
};

document.querySelector(".form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
