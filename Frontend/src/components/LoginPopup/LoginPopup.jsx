import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const LoginPopup = ({ setShowLogin }) => {
  const { url, loginUser } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Sign-Up");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        loginUser(response.data.token, response.data.user);
        setShowLogin(false);
      } else {
        setErrorMsg(response.data.message || "Authentication failed");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Server connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className='login-popup-container'>
        <div className='login-popup-title'>
          <h2>{currState === "Sign-Up" ? "Create QuickBites Account" : "Welcome Back"}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt='Close' />
        </div>

        {errorMsg && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        <div className="login-popup-inputs">
          {currState === "Login" ? null : (
            <input 
              name='name' 
              onChange={onChangeHandler} 
              value={data.name} 
              type='text' 
              placeholder='Your Full Name' 
              required 
            />
          )}
          <input 
            name='email' 
            onChange={onChangeHandler} 
            value={data.email} 
            type='email' 
            placeholder='Your Email Address' 
            required 
          />
          <input 
            name='password' 
            onChange={onChangeHandler} 
            value={data.password} 
            type='password' 
            placeholder='Password (min 8 chars)' 
            required 
          />
        </div>

        <button type='submit' disabled={loading}>
          {loading ? "Processing..." : (currState === "Sign-Up" ? "Create Account" : "Login")}
        </button>

        <div className="login-popup-condition">
          <input type='checkbox' required defaultChecked />
          <p>Keep me logged in on this device & remember my delivery details.</p>
        </div>

        {currState === "Login" ? (
          <p>New to QuickBites? <span onClick={() => { setCurrState("Sign-Up"); setErrorMsg(""); }}>Create account</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => { setCurrState("Login"); setErrorMsg(""); }}>Login here</span></p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;