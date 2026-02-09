import React from 'react';

function CategoryFilter({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="category-filter" role="tablist" aria-label="Filter by category">
      <button
        className={`category-filter__pill ${activeCategory === '' ? 'category-filter__pill--active' : ''}`}
        onClick={() => onCategoryChange('')}
        role="tab"
        aria-selected={activeCategory === ''}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-filter__pill ${activeCategory === cat ? 'category-filter__pill--active' : ''}`}
          onClick={() => onCategoryChange(cat)}
          role="tab"
          aria-selected={activeCategory === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
