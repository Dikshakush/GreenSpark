import React, { useState } from "react";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../DashBoard/DashBoard.css"; //  dashboard theme

const NewPostScreen = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCaption, setImageCaption] = useState(""); 
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageCaption("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption) return setError("Caption is required");

    const formData = new FormData();
    formData.append("caption", caption);
    if (image) {
      formData.append("image", image);
      if (imageCaption.trim()) {
        formData.append("imageCaption", imageCaption);
      }
    }

    try {
      await axios.post("/api/community", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      navigate("/community");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    }
  };

  return (
    <div className="dashboard-screen dark">
      {/* Header */}
      <div className="dashboard-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="dashboard-title"> Create a New Post! ✏️</h2>
          <p className="dashboard-sub">
            Share your thoughts or achievements with the community
          </p>
        </div>
        <Button
          variant="outline-light"
          className="glass-card"
          onClick={() => navigate("/dashboard")}
        >
          ⬅ Back to Dashboard
        </Button>
      </div>

      {/* Quick Navigation Buttons */}
      <div className="mb-4 text-center">
        <Button
          variant="success"
          className="me-3 glass-card"
          onClick={() => navigate("/learn")}
        >
          📚 Go to Learn Tab
        </Button>
        <Button
          variant="primary"
          className="me-3 glass-card"
          onClick={() => navigate("/ecojourney")}
        >
          🌱 Start Eco Journey
        </Button>
        <Button
          variant="info"
          className="glass-card"
          onClick={() => navigate("/community")}
        >
          🤝 + Community
        </Button>
      </div>

      {/* Form Card */}
      <Card className="glass-card p-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
        {error && (
          <Alert variant="danger" className="glass-card">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Post Caption */}
          <Form.Group controlId="caption" className="mb-3">
            <Form.Label style={{ fontWeight: "600" }}>Post Caption</Form.Label>
            <Form.Control
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="glass-card"
              style={{
                padding: "0.6rem",
                background: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "inherit",
              }}
            />
          </Form.Group>

          {/* Image Upload */}
          <Form.Group controlId="image" className="mb-3">
            <Form.Label style={{ fontWeight: "600" }}>Upload Image (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="glass-card"
              style={{
                padding: "0.45rem",
                background: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "inherit",
              }}
            />
          </Form.Group>

          {/* Image Preview + Delete + Caption */}
          {imagePreview && (
            <div className="mb-3 text-center">
              <Image
                src={imagePreview}
                alt="Preview"
                fluid
                rounded
                style={{
                  maxHeight: "300px",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              />
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={handleDeleteImage}
                  className="me-2"
                >
                  Delete Image
                </Button>
              </div>
              <Form.Group controlId="imageCaption" className="mt-3">
                <Form.Control
                  type="text"
                  placeholder="Add a caption for this image (optional, supports emojis)"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="glass-card"
                  style={{
                    padding: "0.6rem",
                    background: "rgba(255,255,255,0.25)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "inherit",
                  }}
                />
              </Form.Group>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #4facfe, #00f2fe)",
              border: "none",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "0.6rem 1.2rem",
              width: "100%",
            }}
          >
            Post
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default NewPostScreen;
