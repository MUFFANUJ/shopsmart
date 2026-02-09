export const formatPrice = (cents) => {
    if (typeof cents !== 'number' || isNaN(cents)) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
};

export const formatDate = (isoString) => {
    if (!isoString) return 'Unknown Date';
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const filterByCategory = (products, category) => {
    if (!Array.isArray(products)) return [];
    if (!category) return products;
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
};

export const getStockLabel = (inStock) => {
    return inStock ? 'In Stock' : 'Out of Stock';
};