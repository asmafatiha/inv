import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddClient.css';
import Modal from '../Modal/Modal'; // Import the modal component

const AddClient = () => {
  const initialClientState = {
    name: '',
    company_name: '',
    address: '',
    zip: '',
    city: '',
    cin_patent: '',
    payment_terms: 'cash',
  };

  const [client, setClient] = useState(initialClientState);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Vérifier la session pour obtenir les informations de l'utilisateur courant
    console.log('Checking session...');
    axios.get('http://localhost:5000/api/session', { withCredentials: true })
      .then(res => {
        console.log('Session active:', res.data);
        setCurrentUser(res.data);
      })
      .catch(err => {
        console.error('Session error:', err.response ? err.response.data : err.message);
        setError('You are not logged in');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient({
      ...client,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');  // Réinitialiser le message
    setError('');    // Réinitialiser l'erreur

    if (!currentUser) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
        const id = currentUser.user_id;
        console.log("id est: " + id);
      await axios.post('http://localhost:5000/api/addclient',
        { newClient: { ...client, created_by: id } },  // Assurez-vous que `user_id` est dans `currentUser`
        {
          withCredentials: true,  // Inclure les cookies pour la session
        }
      );
      setMessage('Client added successfully');
      setClient(initialClientState); // Réinitialiser les champs du formulaire
    } catch (err) {
      console.error('AddClient Error:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data : 'Error adding client');
    }
  };

  return (
    <div className="addclient-container">
      <form className="addclient-form" onSubmit={handleSubmit}>
        <h2>New Client</h2>
        <div className="client-identification">
        <label>
          Name
          <input
            className="client-input"
            type="text"
            name="name"
            value={client.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
        </label>
        <label>
          Company Name
          <input
            className="client-input"
            type="text"
            name="company_name"
            value={client.company_name}
            onChange={handleChange}
            placeholder="Company Name"
          />
        </label>
        <label>
          CIN/PATENT
          <input
            className="client-input"
            type="text"
            name="cin_patent"
            value={client.cin_patent}
            onChange={handleChange}
            placeholder="CIN/PATENT"
            required
          />
        </label>
        </div>
        <div className="client-address">
        <label>
          Address
          <input
            className="client-address-input"
            type="text"
            name="address"
            value={client.address}
            onChange={handleChange}
            placeholder="Address"
          />
        </label>
        </div>
        <div className="immatriculationAndPaymentTerm">
        
        
        </div>
        
        <div className="zipAndCity">
        <label>
          Zip
          <input
            className="client-input"
            type="text"
            name="zip"
            value={client.zip}
            onChange={handleChange}
            placeholder="Zip"
          />
        </label>
        <label>
          City
          <input
            className="client-input"
            type="text"
            name="city"
            value={client.city}
            onChange={handleChange}
            placeholder="City"
          />
        </label>
        <label>
          Payment Terms
          <select
            className="client-select"
            name="payment_terms"
            value={client.payment_terms}
            onChange={handleChange}
            required
          >
            <option value="cash">Cash</option>
            <option value="8 days">8 days</option>
            <option value="to the 1st">To the 1st</option>
            <option value="to the 1st plus one month">To the 1st plus one month</option>
          </select>
        </label>
        </div>
        <div className="client-submit">
        <button type="submit">Add Client</button>
        </div>
      </form>
      <Modal message={message || error} onClose={() => { setMessage(''); setError(''); }} />
    </div>
  );
};

export default AddClient;
