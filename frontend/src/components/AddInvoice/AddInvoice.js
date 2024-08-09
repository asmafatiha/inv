import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddInvoice.css';
import Modal from '../Modal/Modal'; // Import the modal component

const AddInvoice = () => {
  const [invoice, setInvoice] = useState({
    client_id: '',
    invoice_date: '',
    lines: [{ item_id: '', quantity: '', price: '' }],
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const sessionRes = await axios.get('http://localhost:5000/api/session', { withCredentials: true });
        setCurrentUser(sessionRes.data);

        const clientsRes = await axios.get('http://localhost:5000/api/clients', { withCredentials: true });
        setClients(clientsRes.data);

        const itemsRes = await axios.get('http://localhost:5000/api/items', { withCredentials: true });
        setItems(itemsRes.data);

        const nextInvoiceRes = await axios.get('http://localhost:5000/api/nextinvoicenumber', { withCredentials: true });
        setInvoice(prevInvoice => ({ ...prevInvoice, invoice_number: nextInvoiceRes.data.nextInvoiceNumber }));
      } catch (err) {
        console.error('Error fetching initial data:', err.response ? err.response.data : err.message);
        setError('Error fetching initial data');
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name.startsWith('line')) {
      const [, index, field] = name.split('-');
      const lineIndex = parseInt(index);
      setInvoice(prevInvoice => {
        const updatedLines = prevInvoice.lines.map((line, i) =>
          i === lineIndex ? { ...line, [field]: value } : line
        );
        return { ...prevInvoice, lines: updatedLines };
      });

      if (field === 'item_id') {
        try {
          const res = await axios.get(`http://localhost:5000/api/itemprice/${value}`, { withCredentials: true });
          const price = res.data.price;
          setInvoice(prevInvoice => {
            const updatedLines = prevInvoice.lines.map((line, i) =>
              i === lineIndex ? { ...line, price } : line
            );
            return { ...prevInvoice, lines: updatedLines };
          });
        } catch (err) {
          console.error('Error fetching item price:', err.response ? err.response.data : err.message);
        }
      }
    } else {
      setInvoice(prevInvoice => ({ ...prevInvoice, [name]: value }));
    }
  };

  const addLine = () => {
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      lines: [...prevInvoice.lines, { item_id: '', quantity: '', price: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentUser) {
      setError('You must be logged in to add an invoice.');
      return;
    }

    try {
      // Add the invoice
      const response = await axios.post('http://localhost:5000/api/addinvoice', { newInvoice: { ...invoice, created_by: currentUser.user_id } }, { withCredentials: true });
      setMessage('Invoice added successfully');

      // Get the invoice ID from the response
      const invoiceId = response.data.invoiceId;

      // Fetch the PDF for the added invoice
      const pdfResponse = await axios.get(`http://localhost:5000/api/invoicepdf/${invoiceId}`, { responseType: 'blob', withCredentials: true });

      // Create a URL for the PDF blob
      const url = window.URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`); // Set the filename for the downloaded PDF
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Reset the form and fetch the new invoice number
      const nextInvoiceRes = await axios.get('http://localhost:5000/api/nextinvoicenumber', { withCredentials: true });
      setInvoice({
        invoice_number: nextInvoiceRes.data.nextInvoiceNumber,
        client_id: '',
        invoice_date: '',
        lines: [{ item_id: '', quantity: '', price: '' }]
      });

    } catch (err) {
      console.error('Error adding invoice:', err.response ? err.response.data : err.message);
      setError('Error adding invoice');
    }
  };

  return (
    <div className="addinvoice-container">
      <form className="addinvoice-form" onSubmit={handleSubmit}>
        <h2>New Invoice</h2>
        <div className="invoice-details">
        <label>
          Invoice Number
          <input
            className="invoice-input"
            id="readOnly-invoice-number"
            type="text"
            name="invoice_number"
            value={invoice.invoice_number}
            onChange={handleChange}
            placeholder="Invoice Number"
            required
            readOnly
          />
        </label>
        <label>
          Client
          <select
          className="invoice-select"
            name="client_id"
            value={invoice.client_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.client_id} value={client.client_id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Invoice Date
          <input
            className="invoice-date-input"
            type="date"
            name="invoice_date"
            value={invoice.invoice_date}
            onChange={handleChange}
            required
          />
        </label>
        </div>
        {invoice.lines.map((line, index) => (
          <div key={index} className="invoice-line">
            <div className='line'>
            <label>
              Item
              <select
                className="invoice-select"
                name={`line-${index}-item_id`}
                value={line.item_id}
                onChange={handleChange}
                required
              >
                <option value="">Select an item</option>
                {items.map(item => (
                  <option key={item.item_id} value={item.item_id}>
                    {item.item_text}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                className="invoice-input"
                type="number"
                name={`line-${index}-quantity`}
                value={line.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                required
              />
            </label>
            <label>
              Price
              <input
                className="invoice-input"
                id="readOnly-item-price"
                type="number"
                name={`line-${index}-price`}
                value={line.price}
                onChange={handleChange}
                placeholder="Price"
                required
                readOnly
              />
            </label>
            <label>
            Remove
            <button className="delete-line"
              type="button"
              onClick={() => {
                setInvoice(prevInvoice => ({
                  ...prevInvoice,
                  lines: prevInvoice.lines.filter((_, i) => i !== index)
                }));
              }}
            >
            X
            </button>
            </label>
            </div>

          </div>
        ))}
        <div className="invoice-buttons">
        <button type="button" onClick={addLine}>Add a New Line</button>
        <button type="submit">Store and Download Invoice</button>
        </div>
      </form>
      <Modal message={message || error} onClose={() => { setMessage(''); setError(''); }} />
    </div>
  );
};

export default AddInvoice;
