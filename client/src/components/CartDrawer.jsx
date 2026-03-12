import React from 'react';

const CATEGORY_EMOJIS = {
  Electronics: '🎧',
  Clothing: '👕',
  Home: '🏠',
  Accessories: '💍',
};

function CartDrawer({ cart, onClose, onUpdateQty, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">🛒 Your Cart ({cart.length})</h2>
          <button className="cart-drawer__close" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="cart-drawer__items">
          {cart.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">🛍️</div>
              <p>Your cart is empty</p>
              <p style={{ fontSize: '0.8rem', color: '#6b6b80', marginTop: '0.5rem' }}>
                Add products to get started!
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const hasImage = item.image && item.image.trim() !== '';
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item__icon">
                    {hasImage ? (
                      <img src={item.image} alt={item.name} className="cart-item__thumb" />
                    ) : (
                      CATEGORY_EMOJIS[item.category] || '📦'
                    )}
                  </div>
                  <div className="cart-item__details">
                    <div className="cart-item__name">{item.name}</div>
                    <div className="cart-item__price">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                  <div className="cart-item__controls">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() =>
                        item.qty <= 1 ? onRemove(item.id) : onUpdateQty(item.id, item.qty - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      {item.qty <= 1 ? '🗑' : '−'}
                    </button>
                    <span className="cart-item__qty">{item.qty}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span className="cart-drawer__total-label">Total</span>
              <span className="cart-drawer__total-value">${total.toFixed(2)}</span>
            </div>
            <button
              className="cart-drawer__checkout"
              id="checkout-btn"
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
