import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();  // Utilisez useNavigate à la place de useHistory

  useEffect(() => {
    console.log('Checking session...');
    axios.get('http://localhost:5000/api/session', { withCredentials: true })
      .then((response) => {
        console.log('Session data:', response.data);
        setCurrentUser(response.data);
      })
      .catch((error) => {
        console.error('Session error:', error.response ? error.response.data : error.message);
        navigate('/login');  // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
      });
  }, [navigate]);

  const handleLogout = () => {
    axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
      .then(() => {
        navigate('/login');  // Rediriger vers la page de login après la déconnexion
      })
      .catch((error) => {
        console.error('Logout error:', error.response ? error.response.data : error.message);
      });
  };

  if (!currentUser) {
    return <div>Loading...</div>;  // Afficher un indicateur de chargement pendant la vérification de la session
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="main">
      <h3>Main Menu</h3>
      <div className="button-group">
        <Link to="/addinvoice">
          <button className="dashboard-button">Make an Invoice</button>
        </Link>
        <Link to="/addclient">
          <button className="dashboard-button">Add a New Client</button>
        </Link>
        <Link to="/additem">
          <button className="dashboard-button">Add a New Item</button>
        </Link>
        {currentUser.admin_rights && (
          <Link to="/adduser">
            <button className="dashboard-button">Add a New User</button>
          </Link>
        )}
        </div>
      </div>
      <div className="aditionnalOtions">
      <h3>Sub Menu</h3>
      <div className="button-group">
        <Link to="/changepw">
            <button className="dashboard-button" >Change your Password</button>
          </Link>
          <Link to="/changeitemprices">
            <button className="dashboard-button" >Change Item Prices </button>
          </Link>
          <button id="logOut" className="dashboard-button" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
