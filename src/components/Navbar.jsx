import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import React from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { cartCount } = useCart();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const profileRef = React.useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleResize = () => setIsMobile(!mediaQuery.matches);
    handleResize();
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setIsScrolled(currentScrollPos > 0);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if(firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUserName(snap.exists() ? snap.data().name : null);
      } else {
        setUserName(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // removed dropdown handling; profile links to /account

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search.trim()) params.search = search.trim();
    navigate({ pathname: '/products', search: `?${createSearchParams(params)}` });
    setIsMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isLight = isScrolled || isMenuOpen || isMobile;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 transform ${
        !isVisible ? '-translate-y-full' : 'translate-y-0'
      } ${isLight ? 'bg-white shadow-lg' : 'bg-gray-800'}`}
    >
      {!isScrolled && (
        <div className="bg-gray-900 text-white py-2 text-center text-sm">
          <p>Free Shipping on Orders Over $100 | Shop Now!</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span
                className={`text-2xl font-light tracking-wider transition-colors duration-300 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                ELEGANCE
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {['/', '/products', '/contact'].map((path) => (
              <Link key={path} to={path} className="relative px-3 py-2 group">
                <span
                  className={`text-sm tracking-wide font-medium transition-colors duration-200 ${
                    isLight
                      ? 'text-gray-900 group-hover:text-gray-700'
                      : 'text-white group-hover:text-gray-200'
                  }`}
                >
                  {path === '/'
                    ? 'Home'
                    : path === '/products'
                    ? 'Shop'
                    : 'Contact'}
                </span>
                <span
                  className={`absolute left-0 bottom-0 w-full h-0.5 transform origin-left transition-transform duration-250 ease-out ${
                    isLight ? 'bg-gray-900' : 'bg-white'
                  } ${
                    isActiveRoute(path)
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </Link>
            ))}
          </div>

          {/* Desktop Search + Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className={`pl-10 pr-3 py-2 rounded-md border focus:outline-none focus:ring-1 ${
                  isLight ? 'bg-white border-gray-300 focus:ring-gray-900' : 'bg-white/10 border-white/20 placeholder-white/70 focus:ring-white'
                } ${isLight ? 'text-gray-900' : 'text-white'}`}
              />
              <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2">
                <FaSearch className={`w-4 h-4 ${isLight ? 'text-gray-700' : 'text-white'}`} />
              </button>
            </form>
            {/* User Profile or Login/Signup Icon */}
            {user ? (
              <Link to="/account" className="p-2 px-3 rounded-full font-medium text-indigo-700 bg-indigo-100">
                {userName || user.email}
              </Link>
            ) : (
              <Link
                to="/signup"
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                }`}
              >
                <FaUser
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}
                />
              </Link>
            )}
            <Link
              to="/cart"
              className={`p-2 rounded-full transition-colors duration-300 ${
                isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <FaShoppingCart
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}
                />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <FaShoppingCart
                className={`w-5 h-5 transition-colors duration-300 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1">
                {cartCount}
              </span>
            </Link>
            <button
              onClick={toggleMenu}
              className={`relative w-8 h-8 focus:outline-none ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            >
              <span className="sr-only">Open main menu</span>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6">
                <span
                  className={`absolute w-full h-0.5 transform transition-all duration-300 ${
                    isLight ? 'bg-gray-900' : 'bg-white'
                  } ${isMenuOpen ? 'rotate-45' : '-translate-y-2'}`}
                ></span>
                <span
                  className={`absolute w-full h-0.5 transform transition-all duration-300 ${
                    isLight ? 'bg-gray-900' : 'bg-white'
                  } ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                ></span>
                <span
                  className={`absolute w-full h-0.5 transform transition-all duration-300 ${
                    isLight ? 'bg-gray-900' : 'bg-white'
                  } ${isMenuOpen ? '-rotate-45' : 'translate-y-2'}`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu - Full White Background */}
     {/* ✅ Mobile Menu - Full White Background with Close Button */}
  <div
  className={`fixed top-0 left-0 w-full h-screen bg-white transition-all duration-300 ease-in-out transform ${
    isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
  } md:hidden z-40`}
>
  {/* Close Button */}
  <button
    onClick={toggleMenu}
    className="absolute top-5 right-5 text-gray-800 text-3xl font-light focus:outline-none"
  >
    &times; {/* × symbol */}
  </button>

  <form onSubmit={handleSearchSubmit} className="px-6 pt-20 pb-4">
    <div className="relative">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
        <FaSearch className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  </form>

  <div className="flex flex-col items-center justify-start h-full space-y-6 text-gray-900">
    {['/', '/products', '/contact', '/account'].map((path, index) => (
      <Link
        key={path}
        to={path}
        className="group relative w-full text-center py-4"
        style={{
          transitionDelay: `${index * 50}ms`,
        }}
      >
        <span
          className={`text-xl font-light tracking-widest transition-all duration-300 ${
            isActiveRoute(path)
              ? 'text-gray-900'
              : 'text-gray-500 group-hover:text-gray-700'
          }`}
          onClick={() => setIsMenuOpen(false)} // ✅ Close menu when link clicked
        >
          {path === '/' ? 'HOME' : path.slice(1).toUpperCase()}
        </span>
        <span className="absolute bottom-2 left-1/2 w-8 h-0.5 bg-gray-900 transform -translate-x-1/2 scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
      </Link>
    ))}

    <div className="w-full px-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Collections</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "View All Women's Collection", to: '/collections/women' },
          { label: "View All Men's Collection", to: '/collections/men' },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setIsMenuOpen(false)}
            className="w-full border border-gray-300 rounded-lg py-3 text-sm text-gray-800 hover:bg-gray-50 text-center"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
    <div className="absolute bottom-8 w-full px-8">
      <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium transition-transform transform hover:scale-105 active:scale-95">
        Search Products
      </button>
    </div>
  </div>
</div>

    </nav>
  );
};

export default Navbar;
