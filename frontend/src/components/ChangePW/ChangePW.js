import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal';
import './ChangePW.css';

const ChangePW = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setModalMessage('New passwords do not match');
      setShowModal(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/changepassword', {
        currentPassword,
        newPassword,
      }, { withCredentials: true });

      setModalMessage(response.data);
      setShowModal(true);
    } catch (error) {
      setModalMessage(error.response.data || 'An error occurred');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="change-password-form">
      <form className="changepw-form" onSubmit={handleChangePassword}>
      <h2>Change Password</h2>
        <div>
          <label>Current Password:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm New Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
      {showModal && <Modal message={modalMessage} onClose={handleCloseModal} />}
    </div>
  );
};

export default ChangePW;
