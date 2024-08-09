import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home.js';
import Login from './components/Login/Login.js';
import Dashboard from './components/Dashboard/Dashboard.js';
import AddUser from './components/AddUser/AddUser.js';
import AddClient from './components/AddClient/AddClient.js'; 
import AddItem from './components/AddItem/AddItem.js'; 
import AddInvoice from './components/AddInvoice/AddInvoice.js'; 
import ChangePW from './components/ChangePW/ChangePW.js';
import ChangeItemPrices from './components/ChangeItemPrices/ChangeItemPrices.js';

function App() {
    return (
        <Router basename="/test">
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/adduser" element={<AddUser />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/addclient" element={<AddClient />} />
                    <Route path="/additem" element={<AddItem />} />
                    <Route path="/addinvoice" element={<AddInvoice />} />
                    <Route path="/changepw" element={<ChangePW />} />
                    <Route path="/changeitemprices" element={<ChangeItemPrices />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
