import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChangeItemPrices.css'; // Import the CSS file
import Modal from '../Modal/Modal'; // Import the modal component

const ChangeItemPrices = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [previousCostPrice, setPreviousCostPrice] = useState('');
  const [previousSalesPrice, setPreviousSalesPrice] = useState('');
  const [currentCostPrice, setCurrentCostPrice] = useState('');
  const [currentSalesPrice, setCurrentSalesPrice] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const sessionRes = await axios.get('http://localhost:5000/api/session', { withCredentials: true });
        setCurrentUser(sessionRes.data);

        const itemsRes = await axios.get('http://localhost:5000/api/items', { withCredentials: true });
        setItems(itemsRes.data);
      } catch (err) {
        console.error('Error fetching initial data:', err.response ? err.response.data : err.message);
        setError('Error fetching initial data');
      }
    };

    fetchInitialData();
  }, []);

  const handleItemChange = (e) => {
    const itemId = e.target.value;
    const item = items.find(item => item.item_id === parseInt(itemId));
    if (item) {
      console.log('Selected item:', item);
      setSelectedItem(itemId);
      setPreviousCostPrice(item.item_cost_price);
      setPreviousSalesPrice(item.item_sales_price);
    } else {
      console.log('Item not found');
      setSelectedItem('');
      setPreviousCostPrice('');
      setPreviousSalesPrice('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentUser) {
      setError('You must be logged in to change item prices.');
      return;
    }

    const data = {
      item_id: selectedItem,
      previous_item_cost_price: previousCostPrice,
      current_item_cost_price: currentCostPrice,
      previous_item_sales_price: previousSalesPrice,
      current_item_sales_price: currentSalesPrice,
      modified_by: currentUser.user_id // Using the logged-in user's ID
    };

    try {
      await axios.post('http://localhost:5000/api/changeItemPrices', data, { withCredentials: true });
      setMessage('Prices updated successfully');
      // Reset the form
      setSelectedItem('');
      setPreviousCostPrice('');
      setPreviousSalesPrice('');
      setCurrentCostPrice('');
      setCurrentSalesPrice('');
    } catch (err) {
      console.error('There was an error updating the prices!', err.response ? err.response.data : err.message);
      setError('There was an error updating the prices');
    }
  };

  return (
    <div className="change-item-prices-form-container">
      
      <form className="changeItemPrice-form" onSubmit={handleSubmit}>
        <h2>Change Item Prices</h2>
        <div className="changeItemPriceform-group">
          <label htmlFor="item">Item</label>
          <select id="item" value={selectedItem} onChange={handleItemChange}>
            <option value="">Select an item</option>
            {items.map(item => (
              <option key={item.item_id} value={item.item_id}>
                {item.item_text}
              </option>
            ))}
          </select>
        </div>
        <div className="changeItemPriceform-group">
          <label htmlFor="previousCostPrice">Previous Cost Price</label>
          <input type="text" id="previousCostPrice" value={previousCostPrice} readOnly />
        </div>
        <div className="changeItemPriceform-group">
          <label htmlFor="currentCostPrice">New Cost Price</label>
          <input type="number" id="currentCostPrice" value={currentCostPrice} onChange={(e) => setCurrentCostPrice(e.target.value)} required />
        </div>
        <div className="changeItemPriceform-group">
          <label htmlFor="previousSalesPrice">Previous Sales Price</label>
          <input className="readOnly" type="text" id="previousSalesPrice" value={previousSalesPrice} readOnly />
        </div>
        <div className="changeItemPriceform-group">
          <label htmlFor="currentSalesPrice">New Sales Price</label>
          <input type="number" id="currentSalesPrice" value={currentSalesPrice} onChange={(e) => setCurrentSalesPrice(e.target.value)} required />
        </div>
        <div className="changeItemPricesSubmit">
        <button type="submit">Update Prices</button>
        </div>
      </form>
      <Modal message={message || error} onClose={() => { setMessage(''); setError(''); }} />
    </div>
  );
};

export default ChangeItemPrices;
