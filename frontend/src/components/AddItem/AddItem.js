// src/AddItem.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddItem.css';
import Modal from '../Modal/Modal'; // Import the modal component

const AddItem = () => {
  const [item, setItem] = useState({
    item_number: '',
    item_text: '',
    item_cost_price: '',
    item_sales_price: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/session', { withCredentials: true })
      .then(res => {
        setCurrentUser(res.data);
      })
      .catch(err => {
        console.error('Session error:', err.response ? err.response.data : err.message);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentUser) {
      setError('You must be logged in to add an item.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/additem',
        { newItem: { ...item, created_by: currentUser.user_id } },
        {
          withCredentials: true,  // Inclure les cookies pour la session
        }
      );
      setMessage('Item added successfully');
      setItem({
        item_number: '',
        item_text: '',
        item_cost_price: '',
        item_sales_price: '',
      });  // Réinitialiser le formulaire
    } catch (err) {
      console.error(err);
      setError('Error adding item');
    }
  };

  return (
    <div className="additem-container">
      <form className="additem-form" onSubmit={handleSubmit}>
        <h2>New Item</h2>
        <div className="item-identification">
        <label>
          Item Number
          <input
            className="item-input"
            type="text"
            name="item_number"
            value={item.item_number}
            onChange={handleChange}
            placeholder="Item Number"
            required
          />
        </label>
        <label>
          Item Text
          <input
            className="item-input"
            type="text"
            name="item_text"
            value={item.item_text}
            onChange={handleChange}
            placeholder="Item Text"
            required
          />
        </label>
        </div>
        <div className="item-prices">
        <label>
          Cost Price
          <input
            className="item-input"
            type="number"
            step="0.01"
            name="item_cost_price"
            value={item.item_cost_price}
            onChange={handleChange}
            placeholder="Cost Price"
            required
          />
        </label>
        <label>
          Sales Price
          <input
            className="item-input"
            type="number"
            step="0.01"
            name="item_sales_price"
            value={item.item_sales_price}
            onChange={handleChange}
            placeholder="Sales Price"
            required
          />
        </label>
        </div>
        <div className="item-submit">
        <button type="submit">Add Item</button>
        </div>
      </form>
      <Modal message={message || error} onClose={() => { setMessage(''); setError(''); }} />
    </div>
  );
};

export default AddItem;
