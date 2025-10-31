import { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaFilter } from 'react-icons/fa';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    sort: 'default'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();
  const pathnameCategory = (() => {
    const p = location.pathname.toLowerCase();
    if (p.includes('/women')) return "women's clothing";
    if (p.includes('/men')) return "men's clothing";
    return null;
  })();
  const urlCategory = searchParams.get('category') || pathnameCategory || 'all';
  const { addToCart } = useCart();
  const [toast, setToast] = useState('');
  const [dbProducts, setDbProducts] = useState([]);

  // Fetch only clothing products from Fakestore API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        // Filter only men's and women's clothing
        const clothingProducts = data.filter(product => 
          product.category === "men's clothing" || 
          product.category === "women's clothing"
        );
        setProducts(clothingProducts);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load products from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setDbProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Sync filters with URL params
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: urlCategory }));
  }, [urlCategory]);

  const allProducts = [...dbProducts, ...products];
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const haystack = `${product.title || product.name} ${product.description}`.toLowerCase();
        if (!haystack.includes(searchQuery)) return false;
      }

      // Price range filter
      if (filters.priceRange !== 'all' && product.price) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (max) {
          if (product.price < min || product.price > max) return false;
        } else {
          if (product.price < min) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort products
      switch (filters.sort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-asc':
          return (a.title || a.name).localeCompare(b.title || b.name);
        case 'name-desc':
          return (b.title || b.name).localeCompare(a.title || a.name);
        default:
          return 0;
      }
    });
  }, [dbProducts, products, filters, searchQuery]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">Error: {error}</p>
    </div>
  );

  const onAddToCart = (product) => {
    addToCart({
      id: product.id,
      title: product.title || product.name,
      price: product.price,
      image: product.image,
    });
    setToast('Added to cart');
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(''), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-md shadow-md">
            {toast}
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light tracking-wide text-gray-900">Shop</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <FaFilter className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
            {/* Category Filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category</h3>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="all">All Clothing</option>
                <option value="men's clothing">Men's Clothing</option>
                <option value="women's clothing">Women's Clothing</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="all">All Prices</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="200">$200+</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sort By</h3>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative h-64 overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.title || product.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                      {product.title || product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 capitalize">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-lg font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                      <button onClick={() => onAddToCart(product)} className="px-4 py-2 bg-gray-900 text-white text-sm rounded transform hover:bg-gray-800 hover:scale-105 hover:shadow-md transition-all duration-300 ease-in-out active:scale-95">
                        Add to Cart
                      </button>
                    </div>
                    <button onClick={() => window.location.assign(`/product/${product.id}`)} className="mt-3 w-full border border-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-50 transition-colors duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;