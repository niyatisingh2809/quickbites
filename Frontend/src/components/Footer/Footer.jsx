import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
const Footer = () => {
  return (
    
    <div className='footer' id='footer'>  
        <div className="footer-content">  
            <div className="footer-content-left">  
                <div className='footer-brand-container'>
                    <span className='footer-brand-icon'>⚡🍔</span>
                    <span className='footer-brand-name'>Quick<span className='footer-brand-accent'>Bites</span></span>
                </div>
                <p>QuickBites is India's favourite online food delivery service, bringing piping hot meals, fresh gourmet treats, and delicious desserts straight to your doorstep in minutes. Fast, fresh, and reliable!</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="Facebook" />
                    <img src={assets.twitter_icon} alt="Twitter" />
                    <img src={assets.linkedin_icon} alt="LinkedIn" />
                </div> 
            </div>   
            <div className="footer-content-center">  
                <h2>COMPANY</h2>
                <ul>
                    <li><a href='/'>Home</a></li>
                    <li><a href='#explore-menu'>About Us</a></li>
                    <li><a href='#app-download'>Delivery Info</a></li>
                    <li>Privacy Policy</li>
                </ul>
            </div>  
            <div className="footer-content-right">  
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>📞 +91 98765 43210</li>
                    <li>📞 1800 202 3000 (Toll-Free)</li>
                    <li>✉️ support@quickbites.in</li>
                    <li>📍 New Delhi, India</li>
                </ul>
            </div>  
        </div>  
        <hr/>
        <p className="footer-copyright">Copyright 2026 © QuickBites.com — All Rights Reserved. Crafted with ❤️ for Food Lovers.</p>
    </div>  
   
  )
}

export default Footer