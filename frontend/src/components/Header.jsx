import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/actions/userActions';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>GreenSpark 🌱</Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto nav-links">
              {location.pathname !== '/' && (
                <LinkContainer to="/">
                  <Nav.Link className={isActive('/') ? 'active-link' : ''}>Home</Nav.Link>
                </LinkContainer>
              )}

              <LinkContainer to="/about">
                <Nav.Link className={isActive('/about') ? 'active-link' : ''}>About</Nav.Link>
              </LinkContainer>

              {userInfo ? (
                <>
                  <LinkContainer to="/dashboard">
                    <Nav.Link className={isActive('/dashboard') ? 'active-link' : ''}>Dashboard</Nav.Link>
                  </LinkContainer>

                  <LinkContainer to="/profile">
                    <Nav.Link className={isActive('/profile') ? 'active-link' : ''}>Profile</Nav.Link>
                  </LinkContainer>

                  <Nav.Link onClick={logoutHandler}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link className={isActive('/login') ? 'active-link' : ''}>Login</Nav.Link>
                  </LinkContainer>

                  <LinkContainer to="/register">
                    <Nav.Link className={isActive('/register') ? 'active-link' : ''}>Register</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ✅ Inline CSS for animated underline */}
      <style>
        {`
          .nav-links .nav-link {
            position: relative;
            color: white;
            transition: color 0.3s ease;
          }

          .nav-links .nav-link::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 0;
            height: 2px;
            background-color: #00ff7f;
            transition: width 0.3s ease;
          }

          .nav-links .nav-link:hover::after {
            width: 100%;
          }

          .active-link {
            color: #00ff7f !important;
          }

          .active-link::after {
            width: 100%;
          }
        `}
      </style>
    </header>
  );
}

export default Header;
