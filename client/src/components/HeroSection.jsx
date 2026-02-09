import React from 'react';

function HeroSection({ onShopNow }) {
  return (
    <section className="hero" id="hero">
      <div className="hero__tag">✨ NEW COLLECTION 2026</div>
      <h1 className="hero__title">
        Discover Premium<br />
        <span className="hero__title-gradient">Products You Love</span>
      </h1>
      <p className="hero__subtitle">
        Shop the latest trends with unbeatable prices. From tech to fashion,
        everything you need in one place.
      </p>
      <button className="hero__cta" onClick={onShopNow} id="shop-now-btn">
        Shop Now →
      </button>

      <div className="hero__stats">
        <div className="hero__stat">
          <div className="hero__stat-value">10K+</div>
          <div className="hero__stat-label">Products</div>
        </div>
        <div className="hero__stat">
          <div className="hero__stat-value">50K+</div>
          <div className="hero__stat-label">Happy Customers</div>
        </div>
        <div className="hero__stat">
          <div className="hero__stat-value">4.9★</div>
          <div className="hero__stat-label">Average Rating</div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
