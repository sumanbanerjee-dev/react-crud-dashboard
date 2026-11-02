
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://jsonplaceholder.typicode.com/posts";

function Dashboard() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("loggedInUser") || "User";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modal, setModal] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // GET ALL POSTS
  useEffect(() => {
    getPosts();
  }, []);

  async function getPosts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Unable to fetch posts");
      }

      const data = await response.json();
      setPosts(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // OPEN ADD MODAL
  function openAddModal() {
    setTitle("");
    setBody("");
    setSelectedPost(null);
    setModal("add");
  }

  // OPEN EDIT MODAL
  function openEditModal(post) {
    setSelectedPost(post);
    setTitle(post.title);
    setBody(post.body);
    setModal("edit");
  }

  // ADD POST
  async function handleAdd(e) {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newPost = {
        title: title.trim(),
        body: body.trim(),
        userId: 1,
      };

      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error("Unable to add post");
      }

      const data = await response.json();

      const createdPost = {
        ...data,
        id: Date.now(),
        apiId: data.id,
        localOnly: true,
      };

      setPosts((prev) => [createdPost, ...prev]);

      setModal("");
      setMessage("Post added successfully!");

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // VIEW POST
  async function handleView(post) {
    setModal("view");
    setSelectedPost(null);
    setLoading(true);

    try {
      if (post.localOnly) {
        setSelectedPost(post);
        return;
      }

      const response = await fetch(`${API}/${post.id}`);

      if (!response.ok) {
        throw new Error("Unable to load post details");
      }

      const data = await response.json();
      setSelectedPost(data);

    } catch (err) {
      setError(err.message);
      setModal("");
    } finally {
      setLoading(false);
    }
  }

  // UPDATE POST
  async function handleUpdate(e) {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updateData = {
        title: title.trim(),
        body: body.trim(),
        userId: selectedPost.userId,
      };

      const updateId = selectedPost.apiId || selectedPost.id;

      const response = await fetch(`${API}/${updateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Unable to update post");
      }

      const data = await response.json();

      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPost.id
            ? { ...post, ...data, id: post.id, localOnly: post.localOnly }
            : post
        )
      );

      setModal("");
      setSelectedPost(null);
      setMessage("Post updated successfully!");

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // OPEN DELETE MODAL
  function openDeleteModal(post) {
    setSelectedPost(post);
    setModal("delete");
  }

  // DELETE POST
  async function handleDelete() {
    try {
      setDeleting(true);
      setError("");

      const deleteId = selectedPost.apiId || selectedPost.id;

      const response = await fetch(`${API}/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete post");
      }

      setPosts((prev) =>
        prev.filter((post) => post.id !== selectedPost.id)
      );

      setModal("");
      setSelectedPost(null);
      setMessage("Post deleted successfully!");

    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  // CLOSE MODAL
  function closeModal() {
    if (saving || deleting) return;

    setModal("");
    setSelectedPost(null);
    setError("");
  }

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInUser");

    navigate("/login", { replace: true });
  }

  // SEARCH
  const filteredPosts = posts.filter((post) => {
    const value = search.toLowerCase();

    return (
      String(post.id).includes(value) ||
      post.title.toLowerCase().includes(value) ||
      post.body.toLowerCase().includes(value)
    );
  });

  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <nav className="navbar">
        <div>
          <h2>Post Manager</h2>
          <p>React CRUD Dashboard</p>
        </div>

        <div className="nav-right">
          <span>Welcome, {userName}</span>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="container">

        <div className="page-header">
          <div>
            <h1>Posts Management</h1>
            <p>Manage all your posts from one place.</p>
          </div>

          <button className="add-btn" onClick={openAddModal}>
            + Add New Post
          </button>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="success-message">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {error && !modal && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* SEARCH */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by ID, title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="table-card">

          <div className="table-header">
            <h3>All Posts</h3>
            <span>{filteredPosts.length} Posts</span>
          </div>

          {loading && modal !== "view" ? (
            <p className="loading">Loading posts...</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Content</th>
                    <th>User ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.id}</td>

                        <td className="title-cell">
                          {post.title}
                        </td>

                        <td className="body-cell">
                          {post.body}
                        </td>

                        <td>{post.userId}</td>

                        <td>
                          <div className="actions">

                            <button
                              className="view-btn"
                              onClick={() => handleView(post)}
                            >
                              View
                            </button>

                            <button
                              className="edit-btn"
                              onClick={() => openEditModal(post)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() => openDeleteModal(post)}
                            >
                              Delete
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty">
                        No posts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* VIEW MODAL */}
      {modal === "view" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>View Post Details</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {loading ? (
              <p className="loading">Loading details...</p>
            ) : selectedPost ? (
              <div className="details">

                <div>
                  <label>Post ID</label>
                  <p>{selectedPost.id}</p>
                </div>

                <div>
                  <label>User ID</label>
                  <p>{selectedPost.userId}</p>
                </div>

                <div>
                  <label>Title</label>
                  <p>{selectedPost.title}</p>
                </div>

                <div>
                  <label>Content</label>
                  <p>{selectedPost.body}</p>
                </div>

                <button className="cancel-btn" onClick={closeModal}>
                  Close
                </button>

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {modal === "add" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2>Add New Post</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Post Title</label>
                <input
                  type="text"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Post Content</label>
                <textarea
                  rows="5"
                  placeholder="Enter post content"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? "Adding..." : "Add Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {modal === "edit" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2>Edit Post</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Post Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Post Content</label>
                <textarea
                  rows="5"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === "delete" && selectedPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-icon">!</div>

            <h2>Delete Post?</h2>

            <p>Are you sure you want to delete this post?</p>

            <p className="delete-title">{selectedPost.title}</p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
