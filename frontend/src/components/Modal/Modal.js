// src/Modal.js
import React from 'react';
import './Modal.css';

const Modal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
