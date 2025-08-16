import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  InputGroup,
  Alert,
  Modal,
} from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPen } from 'react-icons/fa';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [confirmFinalLogout, setConfirmFinalLogout] = useState(false);

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!storedUserInfo) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${storedUserInfo.token}`,
          },
        });

        setUserInfo(data);
        setName(data.name);
        setEmail(data.email);
        setPassword('');
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || 'Failed to fetch profile'
        );
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setMessage('All fields are required.');
      return;
    }

    try {
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));

      const { data } = await axios.put(
        '/api/users/profile',
        { name, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedUserInfo.token}`,
          },
        }
      );

      setMessage('Profile updated successfully!');
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setEditMode(false);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to update profile'
      );
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setMessage('');
    setError('');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogoutConfirm = () => {
    setConfirmFinalLogout(true);
    setShowLogoutModal(false);
  };

  const handleFinalLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/login');
  };

  return (
    <div className="profile-screen">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5}>
            <Card className="profile-card shadow">
              <Card.Body>
                {userInfo ? (
                  <>
                    <p className="text-muted mb-2">
                      Logged in as: {userInfo?.email}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="profile-title">My Profile</h2>
                      {!editMode && (
                        <FaPen
                          className="edit-icon"
                          onClick={handleEdit}
                          title="Edit Profile"
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                    </div>

                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSave}>
                      <Form.Group controlId="name" className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaUser /></InputGroup.Text>
                          <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            readOnly={!editMode}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group controlId="email" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                          <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={!editMode}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group controlId="password" className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaLock /></InputGroup.Text>
                          <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={editMode ? 'Enter new password' : '********'}
                            readOnly={!editMode}
                            required
                          />
                        </InputGroup>
                      </Form.Group>

                      {editMode && (
                        <Button type="submit" className="profile-login-btn w-100">
                          Save Changes
                        </Button>
                      )}
                    </Form>

                    {!editMode && !confirmFinalLogout && (
                      <Button className="profile-login-btn mt-3 w-100" onClick={handleLogoutClick}>
                        Logout
                      </Button>
                    )}

                    {confirmFinalLogout && (
                      <Button variant="danger" className="mt-3 w-100" onClick={handleFinalLogout}>
                        Confirm Logout
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <h2 className="profile-title">You are not logged in</h2>
                    <Button
                      className="profile-login-btn mt-3"
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showLogoutModal}
        onHide={handleLogoutCancel}
        centered
        backdrop="static"
        className="blurred-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout? All your data will be erased.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLogoutCancel}>
            No
          </Button>
          <Button variant="danger" onClick={handleLogoutConfirm}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfileScreen;
