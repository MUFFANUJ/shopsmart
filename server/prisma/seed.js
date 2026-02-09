const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.product.deleteMany();

  const products = [
    {
      name: 'Premium Wireless Headphones',
      price: 129.99,
      category: 'Electronics',
      inStock: true,
      description: 'Immersive sound with active noise cancellation and 30-hour battery life.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    },
    {
      name: 'Organic Cotton T-Shirt',
      price: 24.99,
      category: 'Clothing',
      inStock: true,
      description: 'Soft, breathable organic cotton tee available in multiple colors.',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    },
    {
      name: 'Ceramic Coffee Mug',
      price: 14.50,
      category: 'Home',
      inStock: false,
      description: 'Handcrafted ceramic mug with a minimalist design. Holds 12oz.',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop',
    },
    {
      name: 'Gaming Mouse',
      price: 49.99,
      category: 'Electronics',
      inStock: true,
      description: 'Ergonomic gaming mouse with 16000 DPI sensor and RGB lighting.',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
    },
    {
      name: 'Leather Wallet',
      price: 39.99,
      category: 'Accessories',
      inStock: false,
      description: 'Genuine leather bifold wallet with RFID blocking technology.',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop',
    },
    {
      name: 'Running Shoes',
      price: 89.99,
      category: 'Clothing',
      inStock: true,
      description: 'Lightweight running shoes with responsive cushioning and breathable mesh.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    },
    {
      name: 'Smart Watch Pro',
      price: 199.99,
      category: 'Electronics',
      inStock: true,
      description: 'Advanced fitness tracking, heart rate monitor, and 5-day battery life.',
      image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=300&fit=crop',
    },
    {
      name: 'Bamboo Desk Organizer',
      price: 34.99,
      category: 'Home',
      inStock: true,
      description: 'Eco-friendly bamboo organizer with multiple compartments for a tidy workspace.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=300&fit=crop',
    },
    {
      name: 'Vintage Sunglasses',
      price: 59.99,
      category: 'Accessories',
      inStock: true,
      description: 'Retro-styled UV400 polarized sunglasses with durable acetate frames.',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
    },
    {
      name: 'Portable Bluetooth Speaker',
      price: 74.99,
      category: 'Electronics',
      inStock: true,
      description: 'Waterproof Bluetooth speaker with 360° sound and 12-hour playtime.',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
