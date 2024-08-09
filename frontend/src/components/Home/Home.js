import React from 'react'; 
import { Link } from 'react-router-dom'; 
import './Home.css'; // Ensure the CSS file is imported correctly
 
const Home = () => { 
  return ( 
    <div className="Home"> 
      <h1>Welcome to Marokko Biz Invoice System</h1> 
      <p>Please log in to continue.</p> 
      <Link to="/Login"> 
        <button className="login-button">Login</button> 
      </Link> 
    </div> 
  ); 
}; 
 
export default Home; 
