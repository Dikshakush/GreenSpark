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
import { FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../LoginScreen.css'; // reuse styles

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your registered email');
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        '/api/users/send-otp',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(data.message || 'OTP sent to your email');

      // Redirect to OTP screen with email in query
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to send OTP. Try again.'
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
                <h2 className="text-center mb-4">Forgot Password</h2>

                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                {loading && <Alert variant="info">Sending OTP...</Alert>}

                <Form onSubmit={handleSendOTP}>
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Enter your email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 mt-2"
                  >
                    Send OTP
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

export default ForgotPasswordScreen;
