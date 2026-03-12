import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

function ProductList({ onAddToCart, onViewDetails }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const fetchProducts = (query = '', category = '') => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);

    const url = `${apiUrl}/api/products?${params.toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    fetch(`${apiUrl}/api/products/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (query) => {
    setActiveCategory('');
    fetchProducts(query);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    fetchProducts('', category);
  };

  return (
    <section className="products-section" id="products">
      <div className="products-section__header">
        <h2 className="products-section__title">
          Our <span className="products-section__title-accent">Products</span>
        </h2>
      </div>

      <div className="products-section__toolbar">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && (
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="loading-card" key={i}>
              <div className="loading-card__image" />
              <div className="loading-card__body">
                <div className="loading-card__line" />
                <div className="loading-card__line" />
                <div className="loading-card__line" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-message">⚠️ Error: {error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <h3 className="empty-state__title">No products found</h3>
          <p className="empty-state__text">Try a different search term or category.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductList;
