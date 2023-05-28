const commentTextArea = document.querySelector("#comment-textarea");
const commentBtns = document.querySelector(".comment-btn-group");
const btnCancel = document.querySelector("#commentBtn_cancel");
const btnAccept = document.querySelector("#commentBtn_accept");
const settingsBtns = document.querySelectorAll(".settings-icon");
const settingsBoxes = document.querySelectorAll(".comment-settings");

settingsBtns.forEach((settingsBtn) => {
  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const modalBtns = settingsBtn.parentElement.querySelector(
      ".article-settings__btns"
    );

    modalBtns.classList.toggle("hidden");
  });

  const links = settingsBtn.parentElement.querySelectorAll(
    ".article-settings__btns a"
  );
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.stopPropagation();
      const modalBtns = settingsBtn.parentElement.querySelector(
        ".article-settings__btns"
      );
      modalBtns.classList.add("hidden");
    });
  });
});

commentTextArea.addEventListener("focus", () => {
  commentBtns.classList.remove("hidden");
});

commentTextArea.addEventListener("blur", () => {
  if (commentTextArea.value.trim() === "") {
    commentBtns.classList.add("hidden");
  }
});

commentTextArea.addEventListener("input", () => {
  commentTextArea.style.height = "auto";
  commentTextArea.style.height = `${commentTextArea.scrollHeight}px`;
});

btnCancel.addEventListener("click", (e) => {
  e.preventDefault();
  commentTextArea.value = "";
  commentBtns.classList.add("hidden");
  commentTextArea.style.height = "auto";
});

function createCommentMarkup(commentData) {
  const createdAt = new Date(commentData.createdAt);
  const html = `
  <div class="comment">
    <div class="comment-header">
      <div class="comment-author">
        <img src="/images/default_user_avatar.png" alt="" />
        <a href="/user/">${commentData.user.username}</a>
        <p class="datetime">${createdAt.toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short"
        })}</p>
      </div>
      <div class="comment-settings">
        <div class="settings-icon">
          <svg width="16" height="5" viewBox="0 0 16 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2.5H2.01375M7.5 2.5H7.51375M13 2.5H13.0138" stroke="#B7B8BF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>
    <div class="comment-text">
      <p>${commentData.content}</p>
    </div>
    <div class="comment-footer">
      <div class="comment-answer-button">
        <div class="icon-comment">
          <svg width="15" height="16" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 11V8.5C1 6.614 1 5.672 1.586 5.086C2.172 4.5 3.114 4.5 5 4.5H8.5" stroke="#B7B8BF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6 1L9 4C9.06567 4.06565 9.11777 4.1436 9.15331 4.22939C9.18886 4.31519 9.20715 4.40714 9.20715 4.5C9.20715 4.59286 9.18886 4.68481 9.15331 4.77061C9.11777 4.8564 9.06567 4.93435 9 5L6 8" stroke="#B7B8BF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p>Ответить</p>
      </div>
    </div>
  </div>
`;
  return html;
}

btnAccept.addEventListener("click", async (e) => {
  e.preventDefault();
  const newCommentText = commentTextArea.value;
  const blogId = commentTextArea.getAttribute("data-blog-id");
  const response = await axios.post("/api/comments/", {
    newCommentText,
    blogId
  });
  if (response.data.status === "success") {
    commentTextArea.value = "";
    const commentContainer = document.querySelector(".comments-container");
    const newComment = createCommentMarkup(response.data.newComment);
    commentContainer.insertAdjacentHTML("beforeend", newComment);
    location.reload();
  }
});

function handleEditComment(event) {
  event.preventDefault();
  const comment = event.target.closest(".comment");
  const commentText = comment.querySelector(".comment-content");
  const commentInput = document.createElement("div");
  const textarea = document.createElement("textarea");
  const commentId = comment.getAttribute("data-comment-id");
  commentInput.appendChild(textarea);
  textarea.setAttribute("id", "comment-textarea");
  commentInput.classList.add("comment-input");
  commentInput.style.marginTop = "10px";
  textarea.value = commentText.textContent;
  commentText.replaceWith(commentInput);
  comment.querySelector(".comment-answer-button").classList.add("hidden");
  const saveButton = document.createElement("button");
  saveButton.classList.add("btn", "btn-fill");
  saveButton.style.marginTop = "10px";
  saveButton.textContent = "Сохранить";
  comment.querySelector(".comment-footer").appendChild(saveButton);
  saveButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const res = await axios.patch("/api/comments/", {
      commentId,
      updated: textarea.value
    });
    if (res.data.status === "success") {
      location.reload();
    }
  });
}

async function handleDeleteComment(event) {
  event.preventDefault();
  const comment = event.target.closest(".comment");
  const commentId = comment.getAttribute("data-comment-id");
  const blogId = comment.getAttribute("data-blog-id");
  const confirmation = confirm("Вы точно хотите удалить комментарии?");
  if (confirmation) {
    const res = await axios.delete("/api/comments/", {
      params: { commentId, blogId }
    });
    if (res.data.status === "success") {
      location.reload();
    }
  }
}

settingsBoxes.forEach((settingBox) => {
  const editBtn = settingBox.querySelector(".article-edit");
  editBtn.addEventListener("click", handleEditComment);
  const deleteBtn = settingBox.querySelector(".article-delete");
  deleteBtn.addEventListener("click", handleDeleteComment);
});

document.addEventListener("DOMContentLoaded", function () {
  const commentId = window.location.hash.substring(1); // Получение значения data-comment-id из URL
  if (commentId) {
    const commentElement = document.querySelector(
      `[data-comment-id="${commentId}"]`
    );
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: "smooth" }); // Прокрутка к комментарию
    }
  }
});
