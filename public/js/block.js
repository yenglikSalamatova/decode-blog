const blockBtns = document.querySelectorAll(".admins-user__block");
const unblockBtns = document.querySelectorAll(".admins-user__unblock");

blockBtns.forEach((blockBtn) => {
  blockBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const userId = blockBtn.getAttribute("data-user-id");
    const conf = confirm(
      "Вы действительно хотите заблокировать этого пользователя?"
    );
    if (conf) {
      try {
        const res = await axios.patch("/api/users/blockUser", { userId });
        console.log(res);
        if (res.data.status === "success") {
          location.reload();
        }
      } catch (error) {
        console.error("Ошибка при блокировке пользователя:", error);
      }
    }
  });
});

unblockBtns.forEach((unblockBtn) => {
  unblockBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const userId = unblockBtn.getAttribute("data-user-id");
    console.log("ok");
    try {
      const res = await axios.patch("/api/users/unblockUser", { userId });
      console.log(res);
      if (res.data.status === "success") {
        location.reload();
      }
    } catch (error) {
      console.error("Ошибка при блокировке пользователя:", error);
    }
  });
});
