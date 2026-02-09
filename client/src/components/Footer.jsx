import React from 'react';

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__content">
        <div>
          <div className="footer__brand">ShopSmart</div>
          <p className="footer__brand-text">
            Your one-stop destination for premium products at unbeatable prices.
          </p>
        </div>

        <div>
          <h4 className="footer__heading">Shop</h4>
          <div className="footer__links">
            <span className="footer__link">Electronics</span>
            <span className="footer__link">Clothing</span>
            <span className="footer__link">Accessories</span>
            <span className="footer__link">Home</span>
          </div>
        </div>

        <div>
          <h4 className="footer__heading">Company</h4>
          <div className="footer__links">
            <span className="footer__link">About Us</span>
            <span className="footer__link">Careers</span>
            <span className="footer__link">Blog</span>
            <span className="footer__link">Contact</span>
          </div>
        </div>

        <div>
          <h4 className="footer__heading">Support</h4>
          <div className="footer__links">
            <span className="footer__link">Help Center</span>
            <span className="footer__link">Shipping</span>
            <span className="footer__link">Returns</span>
            <span className="footer__link">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        © 2026 ShopSmart. Crafted with 💜 • All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
