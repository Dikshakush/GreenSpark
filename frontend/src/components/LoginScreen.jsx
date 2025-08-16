// LoginScreen.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginScreen.css';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (email === '' || password === '') {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await axios.post(
        'https://greenspark-backend-yuw8.onrender.com/api/users/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      localStorage.setItem('userInfo', JSON.stringify(data));

// ✅ Also store token separately for other components
if (data.token) {
  localStorage.setItem('token', data.token);
}

navigate('/dashBoard');

    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Body className="login-body">
          <h2 className="text-center">Welcome Back</h2>
          <p className="text-center text-muted mb-4">Continue your eco-journey</p>

          {error && <Alert variant="danger">{error}</Alert>}
          {loading && <Alert variant="info">Logging in...</Alert>}

          <Form onSubmit={submitHandler}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaLock /></InputGroup.Text>
                <Form.Control
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputGroup.Text
                  onClick={() => setShowPass(!showPass)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-100 login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
          </div>

          <div className="divider my-3">or continue with</div>

          <div className="social-login">
            <Button variant="outline-primary" className="w-100 mb-2">
              <i className="fab fa-google me-2"></i> Google
            </Button>
            <Button variant="outline-dark" className="w-100">
              <i className="fab fa-apple me-2"></i> Apple
            </Button>
          </div>

          <p className="text-center mt-3 mb-0">
            Don't have an account? <Link to="/register" className="register-link">Register here</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};
export default LoginScreen;