import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Card, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterScreen.css';

// Images
import ecoImage1 from '../assets/eco-1.jpg';
import ecoImage2 from '../assets/eco-2.jpg';
import ecoImage3 from '../assets/eco-3.jpg';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();
  const images = [ecoImage1, ecoImage2, ecoImage3];

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
      };

      const { data } = await axios.post(
        'https://greenspark-backend-yuw8.onrender.com/api/users/register',
        { name, email, password },
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(data));
      setSuccess('Registration successful!');
      setError('');
      navigate('/profile');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Registration failed'
      );
      setSuccess('');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="register-container">
      <div className="register-box">
        {/* Left - Image Carousel */}
        <div className="image-section">
          <div className="image-carousel">
            {images.map((img, index) => (
              <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
              />
            ))}
          </div>
        </div>

        {/* Right - Form */}
        <div className="form-section">
          <Card className="register-card">
            <Card.Body>
              <h2 className="text-center mb-4">Create an account</h2>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={submitHandler}>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="firstName" className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaUser /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="First name"
                          value={name.split(' ')[0]}
                          onChange={(e) =>
                            setName(e.target.value + ' ' + (name.split(' ')[1] || ''))
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="lastName" className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaUser /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Last name"
                          value={name.split(' ')[1] || ''}
                          onChange={(e) =>
                            setName((name.split(' ')[0] || '') + ' ' + e.target.value)
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

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

                <Form.Group controlId="confirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaLock /></InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100 mt-3 register-btn">
                  Create Account
                </Button>
              </Form>

              <div className="divider my-4">or sign up with</div>

              <div className="social-login-buttons">
                <Button variant="outline-primary" className="social-btn">
                  Google
                </Button>
                <Button variant="outline-dark" className="social-btn">
                  Apple
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="login-link">Log in</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;