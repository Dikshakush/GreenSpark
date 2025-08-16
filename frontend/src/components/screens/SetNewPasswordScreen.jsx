import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Alert } from 'react-bootstrap';

const SetNewPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    try {
      const { data } = await axios.post('https://greenspark-backend-yuw8.onrender.com/api/users/reset-password', {
        email,
        newPassword,
      });

      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Set New Password</h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="newPassword" className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" block="true">
          Reset Password
        </Button>
      </Form>
    </Container>
  );
};

export default SetNewPasswordScreen;
