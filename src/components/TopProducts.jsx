import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Filter for clothing items
        const clothingProducts = data.filter(item => 
          item.category.toLowerCase().includes('clothing') ||
          item.category.toLowerCase().includes('men') ||
          item.category.toLowerCase().includes('women') ||
          item.description.toLowerCase().includes('fashion') ||
          item.title.toLowerCase().includes('jacket') ||
          item.title.toLowerCase().includes('shirt') ||
          item.title.toLowerCase().includes('dress')
        );

        // Take only the first 4 clothing items
        const selectedProducts = clothingProducts.slice(0, 4).map(item => ({
          id: item.id,
          name: item.title,
          category: item.category,
          price: parseFloat(item.price).toFixed(2),
          image: item.image
        }));

        if (selectedProducts.length === 0) {
          throw new Error('No clothing products found');
        }

        setProducts(selectedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-900">Top Products</h2>
          <p className="text-gray-600 text-sm md:text-base font-light max-w-2xl mx-auto">
            Discover our curated selection of premium products.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={() => {
                setLoading(true);
                setError(null);
                window.location.reload();
              }} 
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                  <div 
                    key={product.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative h-64 overflow-hidden rounded-t-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 capitalize">
                        {product.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900">
                          ${product.price}
                        </p>
                        <button onClick={() => navigate('/products')} className="px-4 py-2 bg-gray-900 text-white text-sm rounded transform hover:bg-gray-800 hover:scale-105 hover:shadow-md transition-all duration-300 ease-in-out active:scale-95">
                          Quick Shop
                        </button>
                      </div>
                      <button onClick={() => navigate(`/product/${product.id}`)} className="mt-3 w-full border border-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-50 transition-colors duration-300">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* View All Button */}
        {!loading && !error && products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block border-2 border-gray-900 text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transform hover:scale-105 hover:shadow-md transition-all duration-300 ease-in-out active:scale-95"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopProducts;

