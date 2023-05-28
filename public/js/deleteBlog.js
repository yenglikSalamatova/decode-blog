const deleteBtns = document.querySelectorAll(".article-delete");

deleteBtns.forEach((deleteBtn) => {
  deleteBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const confirmation = confirm("Вы уверены, что хотите удалить блог?");
    const blogId = e.target.getAttribute("data-blog-id");
    const currentUsername = e.target.getAttribute("data-username");
    if (confirmation) {
      try {
        const response = await axios.delete(`/api/blogs/${blogId}`, {});

        if (response.status === 204) {
          window.location.href = `/user/${currentUsername}`;
        } else {
          console.log("Blog delete failed:", response.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
});
