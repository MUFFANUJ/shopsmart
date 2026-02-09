import React from 'react';

function NavBar({ cartCount, onCartClick, onLogoClick }) {
  return (
    <nav className="navbar" id="navbar">
      <div
        className="navbar__logo"
        onClick={onLogoClick}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
      >
        Shop<span>Smart</span>
      </div>
      <div className="navbar__actions">
        <button
          className="navbar__cart-btn"
          onClick={onCartClick}
          aria-label="Open cart"
          id="cart-button"
        >
          🛒 Cart
          {cartCount > 0 && (
            <span className="navbar__cart-badge" data-testid="cart-badge">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
