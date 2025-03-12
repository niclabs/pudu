export const createTag = async (newTag) => {
    const response = await fetch("http://127.0.0.1:8000/api/tags/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTag),
    });
    return response.json();
  };

export const deleteTag = async (tagId) => {
  const response = await fetch(`http://127.0.0.1:8000/api/tags/${tagId}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
  });
  if (response.status === 204) {
      return { success: true };
  }
  return response.json();
};

export const moveTag = async (dragMove) => {
  const response = await fetch("http://127.0.0.1:8000/api/tags/", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body : JSON.stringify(dragMove),
  });
  return response.json();
} 

export const renameTag = async (tagId, newName) => {
  const response = fetch(`http://127.0.0.1:8000/api/tags/${tagId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body : JSON.stringify({name: newName}),
  });
  return response.json();
} 