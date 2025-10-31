import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Shop Categories': [
      { name: 'Men\'s Fashion', path: '/mens' },
      { name: 'Women\'s Fashion', path: '/womens' },
      { name: 'Kids Collection', path: '/kids' },
      { name: 'New Arrivals', path: '/new-arrivals' },
      { name: 'Sale', path: '/sale' }
    ],
    'Customer Service': [
      { name: 'Contact Us', path: '/contact' },
      { name: 'Shipping Policy', path: '/shipping' },
      { name: 'Returns & Exchanges', path: '/returns' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'Size Guide', path: '/size-guide' }
    ],
    'About Us': [
      { name: 'Our Story', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Blog', path: '/blog' }
    ],
    'Connect With Us': [
      { name: 'Facebook', path: 'https://facebook.com' },
      { name: 'Instagram', path: 'https://instagram.com' },
      { name: 'Twitter', path: 'https://twitter.com' },
      { name: 'Pinterest', path: 'https://pinterest.com' },
      { name: 'YouTube', path: 'https://youtube.com' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-light mb-4">Subscribe to our Newsletter</h3>
            <p className="mb-6 text-gray-400">Stay updated with our latest trends and get exclusive offers!</p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full sm:w-96 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-gray-500 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-lg font-medium text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center gap-6">
            <img src="/payment/visa.svg" alt="Visa" className="h-8" />
            <img src="/payment/mastercard.svg" alt="Mastercard" className="h-8" />
            <img src="/payment/amex.svg" alt="American Express" className="h-8" />
            <img src="/payment/paypal.svg" alt="PayPal" className="h-8" />
            <img src="/payment/apple-pay.svg" alt="Apple Pay" className="h-8" />
            <img src="/payment/google-pay.svg" alt="Google Pay" className="h-8" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Your E-commerce. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;