import React, { useEffect, useState } from "react";
import { Button, Card, Form, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "../DashBoard/DashBoard.css"; // ✅ Apply dashboard theme

const CommunityScreen = () => {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get("https://greenspark-backend-yuw8.onrender.com/api/community", { withCredentials: true });
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts", err);
      }
    };
    fetchPosts();
  }, []);

  // Add comment
  const handleAddComment = async (postId) => {
    if (!commentText[postId]) return;
    try {
      const { data } = await axios.post(
        `https://greenspark-backend-yuw8.onrender.com/api/community/${postId}/comment`,
        { text: commentText[postId] },
        { withCredentials: true }
      );
      setPosts(posts.map((p) => (p._id === postId ? data : p)));
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  return (
    <div className="dashboard-screen dark">
      {/* Back Button */}
      <div className="mb-3">
        <Link to="/dashboard">
          <Button
            style={{
              background: "linear-gradient(135deg, #4facfe, #00f2fe)",
              border: "none",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "0.5rem 1rem",
            }}
          >
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="dashboard-header mb-4">
        <div>
          <h2 className="dashboard-title">🌱 Community</h2>
          <p className="dashboard-sub">Share, inspire, and connect with others</p>
        </div>
        <Link to="/new-post">
          <Button
            style={{
              background: "linear-gradient(135deg, #4facfe, #00f2fe)",
              border: "none",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "0.6rem 1.2rem",
            }}
          >
            + New Post
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="text-center mt-5">
          <Image
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No posts"
            style={{ maxWidth: "180px", opacity: 0.8 }}
            className="mb-3"
          />
          <h5 style={{ opacity: 0.85 }}>No posts yet</h5>
          <p style={{ opacity: 0.7 }}>Be the first to share something with the community!</p>
        </div>
      )}

      {/* Posts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {posts.map((post) => (
          <Card key={post._id} className="glass-card">
            {post.image && (
              <Card.Img
                variant="top"
                src={post.image}
                style={{
                  maxHeight: "250px",
                  objectFit: "cover",
                  borderRadius: "1rem 1rem 0 0",
                }}
              />
            )}
            <Card.Body>
              <Card.Title style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                {post.user}
              </Card.Title>
              <Card.Text style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                {post.caption}
              </Card.Text>

              {/* Comments */}
              <h6 className="mt-3" style={{ fontWeight: "600" }}>
                💬 Comments
              </h6>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "0.8rem",
                  borderRadius: "10px",
                  marginBottom: "0.8rem",
                  maxHeight: "100px",
                  overflowY: "auto",
                }}
              >
                {post.comments.length > 0 ? (
                  post.comments.map((c, idx) => (
                    <p
                      key={idx}
                      style={{
                        fontSize: "0.85rem",
                        marginBottom: "0.3rem",
                        color: "inherit",
                      }}
                    >
                      <strong>{c.user}:</strong> {c.text}
                    </p>
                  ))
                ) : (
                  <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                    No comments yet.
                  </p>
                )}
              </div>

              {/* Add Comment */}
              <Form
                className="d-flex mt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment(post._id);
                }}
              >
                <Form.Control
                  type="text"
                  placeholder="Write a comment..."
                  className="glass-card"
                  style={{
                    padding: "0.4rem 0.6rem",
                    background: "rgba(255,255,255,0.25)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "inherit",
                    fontSize: "0.85rem",
                  }}
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText({ ...commentText, [post._id]: e.target.value })
                  }
                />
                <Button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                    border: "none",
                    fontWeight: "600",
                    borderRadius: "8px",
                    marginLeft: "0.4rem",
                    fontSize: "0.85rem",
                    padding: "0.4rem 0.8rem",
                  }}
                >
                  Post
                </Button>
              </Form>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityScreen;
