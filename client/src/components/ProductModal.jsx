import React from 'react';

function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const CATEGORY_EMOJIS = {
    Electronics: '🎧',
    Clothing: '👕',
    Home: '🏠',
    Accessories: '💍',
  };
  const emoji = CATEGORY_EMOJIS[product.category] || '📦';
  const isStocked = product.inStock;
  const rating = product._rating || 4.5;
  const hasImage = product.image && product.image.trim() !== '';

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal">
        <button className="modal__close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal__image">
          {hasImage ? (
            <img src={product.image} alt={product.name} className="modal__img" />
          ) : (
            <span role="img" aria-label={product.category}>
              {emoji}
            </span>
          )}
        </div>

        <div className="modal__body">
          <div className="modal__category">{product.category}</div>
          <h2 className="modal__title">{product.name}</h2>

          <div className="modal__rating">
            {'★'.repeat(Math.floor(rating))}
            {rating % 1 >= 0.5 ? '½' : ''}
            <span className="product-card__rating-count">({rating})</span>
          </div>

          <span
            className={`modal__stock-badge ${isStocked ? 'in-stock' : 'out-of-stock'}`}
            style={{
              background: isStocked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: isStocked ? '#10b981' : '#ef4444',
              border: isStocked
                ? '1px solid rgba(16, 185, 129, 0.2)'
                : '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {isStocked ? '✓ In Stock' : '✕ Sold Out'}
          </span>

          <p className="modal__description">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="modal__price-row">
            <div className="modal__price">${product.price.toFixed(2)}</div>
            <button
              className="modal__add-btn"
              onClick={() => onAddToCart(product)}
              disabled={!isStocked}
            >
              {isStocked ? '🛒 Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
