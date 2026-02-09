import React from 'react';

const CATEGORY_EMOJIS = {
  Electronics: '🎧',
  Clothing: '👕',
  Home: '🏠',
  Accessories: '💍',
};

function getEmoji(category) {
  return CATEGORY_EMOJIS[category] || '📦';
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = '★'.repeat(full);
  if (half) stars += '½';
  return stars;
}

function ProductCard({ product, onAddToCart, onViewDetails }) {
  const emoji = getEmoji(product.category);
  const rating = product._rating || 4.5;
  const isStocked = product.inStock;
  const hasImage = product.image && product.image.trim() !== '';

  return (
    <div
      className="product-card"
      data-testid={`product-card-${product.id}`}
      onClick={() => onViewDetails && onViewDetails(product)}
      role="article"
    >
      <div className="product-card__image">
        {hasImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card__img"
            loading="lazy"
          />
        ) : (
          <span role="img" aria-label={product.category}>{emoji}</span>
        )}
        <span className={`product-card__badge ${isStocked ? 'in-stock' : 'out-of-stock'}`}>
          {isStocked ? '✓ In Stock' : 'Sold Out'}
        </span>
      </div>

      <div className="product-card__body">
        <div className="product-card__category">{product.category}</div>
        <h3 className="product-card__name">{product.name}</h3>
        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}
        <div className="product-card__rating">
          {renderStars(rating)}
          <span className="product-card__rating-count">({rating})</span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-currency">$</span>
            {product.price.toFixed(2)}
          </div>
          <button
            className="product-card__add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!isStocked}
            aria-label={isStocked ? `Add ${product.name} to cart` : 'Out of stock'}
          >
            {isStocked ? '+ Add' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;