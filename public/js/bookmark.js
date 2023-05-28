const articleBookmarks = document.querySelectorAll(".article-bookmarks");

const saveBlog = async (blogId, userId) => {
  try {
    console.log(blogId, userId);
    const response = await axios.post(`/api/users/bookmark/${blogId}`, {
      userId
    });
  } catch (err) {
    console.error(err);
  }
};

const removeBookmark = async (blogId, userId) => {
  try {
    console.log(blogId, userId);
    const response = await axios.delete(`/api/users/bookmark/${blogId}`, {
      data: { userId }
    });
  } catch (err) {
    console.error(err);
  }
};

articleBookmarks.forEach((bookmark) => {
  bookmark.addEventListener("click", async (e) => {
    const blogId = bookmark.getAttribute("data-blog-id");
    const userId = bookmark.getAttribute("data-current-user");
    if (bookmark.classList.contains("bookmark-active")) {
      removeBookmark(blogId, userId);
      bookmark.classList.remove("bookmark-active");
      location.reload();
    } else {
      bookmark.classList.add("bookmark-active");
      // Добавить закладку
      saveBlog(blogId, userId);
    }
  });
});
