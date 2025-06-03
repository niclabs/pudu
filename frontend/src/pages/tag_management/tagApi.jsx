const reviewId = localStorage.getItem('review_id');

export const createTag = async (newTag) => {
  const response = await fetch(`http://127.0.0.1:8000/api/tags/?review_id=${reviewId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTag),
  });
  return response.json();
};

export const deleteTag = async (tagId) => {
  const response = await fetch(`http://127.0.0.1:8000/api/tags/${tagId}/?review_id=${reviewId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (response.status === 204) {
    return { success: true };
  }
  return response.json();
};

export const moveTag = async (dragMove) => {
  const response = await fetch(`http://127.0.0.1:8000/api/tags/?review_id=${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dragMove),
  });
  return response.json();
};

export const editTagName = async (tagId, newName) => {
  const response = await fetch(`http://127.0.0.1:8000/api/tags/${tagId}/?review_id=${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName }),
  });
  return response.json();
};

export const editTagDescription = async (tagId, newDescription) => {
  const response = await fetch(`http://127.0.0.1:8000/api/tags/${tagId}/?review_id=${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: newDescription }),
  });
  return response.json();
};
