// VerifyOTPScreen.jsx
import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
} from 'react-bootstrap';
import { FaKey } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../LoginScreen.css';

const VerifyOTPScreen = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email || !otp) {
      setError('Please enter both email and OTP');
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        '/api/users/verify-otp',
        { email, otp },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(data.message || 'OTP verified successfully');

      // Save token and navigate to set password
      localStorage.setItem('resetToken', data.token);
      localStorage.setItem('resetEmail', email);
      navigate('/reset-password');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to verify OTP. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5}>
            <Card className="login-card shadow">
              <Card.Body>
                <h2 className="text-center mb-4">Verify OTP</h2>

                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                {loading && <Alert variant="info">Verifying...</Alert>}

                <Form onSubmit={handleVerifyOTP}>
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Registered Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="otp" className="mb-3">
                    <Form.Label>OTP</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaKey />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button type="submit" variant="success" className="w-100 mt-2">
                    Verify OTP
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerifyOTPScreen;
