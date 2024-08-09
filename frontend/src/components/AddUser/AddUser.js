// src/AddUser.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddUser.css';
import Modal from '../Modal/Modal'; // Import the modal component

const AddUser = () => {
  const [user, setUser] = useState({
    login: '',
    first_name: '',
    last_name: '',
    cin: '',
    address: '',
    city: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    admin_rights: false,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log('Checking session...');
    axios.get('http://localhost:5000/api/session', { withCredentials: true })
      .then(res => {
        console.log('Session active:', res.data);
        setCurrentUser(res.data);
      })
      .catch(err => {
        console.error('Session error:', err.response ? err.response.data : err.message);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser({
      ...user,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');  // Reset the message
    setError('');    // Reset the error

    if (!currentUser || !currentUser.admin_rights) {
      setError('Admin rights required to add a user.');
      return;
    }

    console.log('Submitting form...');
    console.log('User data:', user);

    try {
      const res = await axios.post('http://localhost:5000/api/adduser', {
        newUser: user,
      }, {
        withCredentials: true,  // Include this option to send session cookies
      });

      // Display success message
      console.log('Server response:', res.data);  // Log the server response
      setMessage('User added successfully');
    } catch (err) {
      // Display error message
      console.error('Error:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data : 'An error occurred');
    }
  };

  return (
    <div className="adduser-container">
      <form className="adduser-form" onSubmit={handleSubmit}>
        <h2>New User</h2>
        <div className="user-identification">
          <label>
            First Name
            <input
              className="user-input"
              type="text"
              name="first_name"
              value={user.first_name}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
          </label>
          <label>
            Last Name
            <input
            className="user-input"
              type="text"
              name="last_name"
              value={user.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              required
            />
          </label>
          <label>
            CIN
            <input
              className="user-input"
              type="text"
              name="cin"
              value={user.cin}
              onChange={handleChange}
              placeholder="CIN"
              required
            />
          </label>
        </div>
        <div className="user-email">
          <label>
            Email
            <input
              className="user-input"
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </label>
        </div>
        <div className="user-address">
          <label>
            Address
            <input
              className="user-input"
              type="text"
              name="address"
              value={user.address}
              onChange={handleChange}
              placeholder="Address"
            />
          </label>
        </div>
        <div className="cityPhoneWahatsapp">
          <label>
            City
            <input
              className="user-input"
              type="text"
              name="city"
              value={user.city}
              onChange={handleChange}
              placeholder="City"
            />
          </label>
          
          <label>
            Phone
            <input
              className="user-input"
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              placeholder="Phone"
            />
          </label>
          <label>
            WhatsApp
            <input
              className="user-input"
              type="text"
              name="whatsapp"
              value={user.whatsapp}
              onChange={handleChange}
              placeholder="WhatsApp"
            />
          </label>
        </div>
        <div className="loginPassAdminRights">
          <label>
            Login
            <input
              className="user-input"
              type="text"
              name="login"
              value={user.login}
              onChange={handleChange}
              placeholder="Login"
              required
            />
          </label>
          <label>
            Password
            <input
              className="user-input"
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </label>
          <label className="checkbox-label">
          Admin Rights
            <input
              className="user-input"
              type="checkbox"
              name="admin_rights"
              checked={user.admin_rights}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="user-submit">
          <button type="submit">Add User</button>
        </div>
      </form>
      <Modal message={message || error} onClose={() => { setMessage(''); setError(''); }} />
    </div>
  );
};

export default AddUser;
