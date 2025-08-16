import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './BadgePopup.css'; // for animations

const ACTIONS = [
  { value: 'recycling', label: 'Recycling (10 pts)', requiresProof: true },
  { value: 'biking', label: 'Biked to work (15 pts)', requiresProof: true },
  { value: 'planting', label: 'Planted tree (20 pts)', requiresProof: true },
  { value: 'carpooling', label: 'Carpooling (10 pts)', requiresProof: false },
  { value: 'cleanup', label: 'Cleanup (25 pts)', requiresProof: true },
];

const LogEcoAction = () => {
  const navigate = useNavigate();
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // New states for badge pop-up
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (preview) URL.revokeObjectURL(preview);
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
    setError(''); //  Clear error when selecting file
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        setError('Unable to get location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const validate = () => {
    if (!actionType) return 'Please choose an action.';
    const action = ACTIONS.find(a => a.value === actionType);
    if (action?.requiresProof && !file) {
      return 'This action requires photo proof — please upload a photo.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const vErr = validate();
    if (vErr) return setError(vErr);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('actionType', actionType);
      formData.append('notes', notes);
      if (file) formData.append('proofImage', file); 
      if (lat) formData.append('lat', lat);
      if (lng) formData.append('lng', lng);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in before submitting an action.');
        navigate('/login');
        return;
      }

      const res = await axios.post('https://greenspark-backend-yuw8.onrender.com/api/actions', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      let successMsg = res.data.message || 'Eco action logged successfully!';
      if (res.data.pointsAwarded) {
        successMsg += ` 🎉 You earned ${res.data.pointsAwarded} points!`;
      }
      if (res.data.newBadges?.length) {
        successMsg += ` 🏅 New badge(s): ${res.data.newBadges.join(', ')}`;
        setNewBadges(res.data.newBadges);
        setShowBadgePopup(true);

        //  Wait 4s for popup, then navigate
        setTimeout(() => {
          setShowBadgePopup(false);
          navigate('/dashboard');
        }, 4000);
      } else {
        navigate('/dashboard');
      }
      setMessage(successMsg);

      setActionType('');
      setNotes('');
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setLat('');
      setLng('');

    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(err?.response?.data?.message || 'Failed to log action. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Body>
          <h5>Log Eco Action</h5>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Action</Form.Label>
              <Form.Select 
                value={actionType} 
                onChange={e => { setActionType(e.target.value); setError(''); }} // ✅ Clear error on change
              >
                <option value="">-- Select action --</option>
                {ACTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={notes}
                onChange={e => { setNotes(e.target.value); setError(''); }} // ✅ Clear error on typing
                placeholder="Add context e.g., location or details"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Proof photo (required for some actions)</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                capture="environment" // ✅ Mobile camera support
                onChange={pickFile} 
              />
            </Form.Group>

            {preview && (
              <div className="mb-2">
                <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 250 }} />
              </div>
            )}

            <Row className="mb-2">
              <Col>
                <Form.Control type="text" placeholder="Latitude (optional)" value={lat} readOnly />
              </Col>
              <Col>
                <Form.Control type="text" placeholder="Longitude (optional)" value={lng} readOnly />
              </Col>
            </Row>

            <div className="d-flex gap-2 mb-3">
              <Button variant="secondary" onClick={captureLocation} type="button">Capture Location</Button>
              <Button variant="outline-secondary" onClick={() => { setLat(''); setLng(''); }} type="button">Clear Location</Button>
            </div>

            <div>
              <Button 
                type="submit" 
                disabled={loading} 
                variant="success"
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Submit Action'} {/* ✅ Spinner */}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Badge Popup Modal */}
      <Modal
        show={showBadgePopup}
        centered
        contentClassName="badge-popup-content"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center">
          <div className="badge-popup-animation">
            🎖️ Badge Unlocked!
          </div>
          <ul>
            {newBadges.map((badge, idx) => (
              <li key={idx}><strong>{badge}</strong></li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default LogEcoAction;
