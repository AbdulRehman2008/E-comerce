import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaShoppingCart, FaBox, FaChartLine, FaSignOutAlt, FaBars, FaTimes, FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaSave } from 'react-icons/fa';
import { collection, onSnapshot, addDoc, getDocs, updateDoc, doc, query, orderBy, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { adminAuth } from '../firebase';

const ADMIN_EMAILS = [
  // Add authorized admin emails here
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock: ''
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(adminAuth, async (user) => {
      if (!user) {
        navigate('/admin/login');
        return;
      }
      let allowed = ADMIN_EMAILS.includes(user.email || '');
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data().isAdmin === true) {
          allowed = true;
        }
      } catch {}
      if (!allowed) {
        navigate('/admin/login');
      }
    });
    return () => unsubAuth();
  }, [navigate]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      setOrdersError('');
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Orders subscription error:', err);
      setOrdersError(err?.message || 'Failed to load orders');
    });
    return () => {
      unsubOrders();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(adminAuth);
    } finally {
      navigate('/admin/login');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'products'), {
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock || '0'),
      createdAt: Date.now(),
      createdBy: (adminAuth.currentUser && adminAuth.currentUser.uid) || null,
      createdByEmail: (adminAuth.currentUser && adminAuth.currentUser.email) || null,
    });
    setNewProduct({ name: '', price: '', category: '', description: '', image: '', stock: '' });
    setShowAddProductModal(false);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    setShowOrderModal(false);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (e) {
      console.error('Failed to delete order', e);
    }
  };

  const handleDeleteProduct = async (productId, createdBy) => {
    try {
      if (createdBy && adminAuth.currentUser && createdBy !== adminAuth.currentUser.uid) {
        return;
      }
      await deleteDoc(doc(db, 'products', productId));
    } catch (e) {
      console.error('Failed to delete product', e);
    }
  };

  const handleExportOrders = () => {
    const rows = filteredOrders.map((order) => {
      const customerName = `${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`.trim() || '—';
      const email = order?.customer?.email || '—';
      const phone = order?.customer?.phone || '—';
      const address1 = order?.customer?.address || '—';
      const address2 = [order?.customer?.city, order?.customer?.zip, order?.customer?.country].filter(Boolean).join(', ');
      const itemsHtml = (order.items || []).map((it) => (
        `<tr>
          <td style="padding:6px 8px;border:1px solid #e5e7eb;">${(it.title || it.name || '').toString().replace(/</g,'&lt;')}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb; text-align:center;">${Number(it.quantity) || 0}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right;">$${Number(it.price).toFixed(2)}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right;">$${(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
        </tr>`
      )).join('');
      const total = (order.total || 0);
      return `
        <div style="margin-bottom:24px;">
          <h3 style="margin:0 0 8px;font-size:16px;">Order #${(order.id || '').slice(0,6)}</h3>
          <div style="font-size:12px;color:#374151; margin-bottom:8px;">
            <div><strong>Customer:</strong> ${customerName}</div>
            <div><strong>Email:</strong> ${email}</div>
            <div><strong>Phone:</strong> ${phone}</div>
            <div><strong>Address:</strong> ${address1}</div>
            <div>${address2}</div>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr>
                <th style="padding:6px 8px;border:1px solid #e5e7eb; text-align:left; background:#f9fafb;">Item</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb; text-align:center; background:#f9fafb;">Qty</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right; background:#f9fafb;">Price</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right; background:#f9fafb;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="3" style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right;"><strong>Total</strong></td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb; text-align:right;"><strong>$${Number(total).toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }).join('');

    const docHtml = `
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Orders Export</title>
        </head>
        <body style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial; padding:24px; color:#111827;">
          <h1 style="margin:0 0 12px; font-size:20px;">Orders Report</h1>
          <div style="font-size:12px; color:#6b7280; margin-bottom:16px;">Generated ${new Date().toLocaleString()}</div>
          ${rows || '<div>No orders to export.</div>'}
        </body>
      </html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(docHtml);
    w.document.close();
    w.focus();
    w.print();
  };

  const stats = [
    (() => {
      const totalOrders = orders.length;
      return { label: 'Total Orders', value: String(totalOrders), icon: FaShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50' };
    })(),
    (() => {
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      return { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: FaChartLine, color: 'text-green-600', bgColor: 'bg-green-50' };
    })(),
    (() => {
      const totalProducts = products.length;
      return { label: 'Total Products', value: String(totalProducts), icon: FaBox, color: 'text-purple-600', bgColor: 'bg-purple-50' };
    })(),
  ];

  const filteredOrders = orders.filter(order => {
    const customerName = `${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`.trim();
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (order.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (order.status || '').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5, totalSpent: '$450', joinDate: '2023-06-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 8, totalSpent: '$780', joinDate: '2023-05-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', orders: 3, totalSpent: '$200', joinDate: '2023-08-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', orders: 12, totalSpent: '$1200', joinDate: '2023-03-05' }
  ];

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between h-16 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl m-auto font-semibold text-gray-900">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
          <FaTimes />
        </button>
      </div>
      <div className="flex flex-col h-[calc(100%-64px)]">{/* 64px = header height */}
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        {[
          { id: 'overview', label: 'Overview', icon: FaChartLine },
          { id: 'orders', label: 'Orders', icon: FaShoppingCart },
          { id: 'products', label: 'Products', icon: FaBox }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 mb-1 ${
              activeTab === item.id 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className="mr-3 text-sm" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200"
        >
          <FaSignOutAlt className="mr-3 text-sm" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-8 mt-[40px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="mt-4 sm:mt-0" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`text-2xl ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">#{order.id.slice(0,6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`.trim() || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Array.isArray(order.items) ? order.items.length : 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${(order.total || 0).toFixed ? order.total.toFixed(2) : Number(order.total || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      (order.status || 'Pending') === 'Completed' ? 'bg-green-100 text-green-800' :
                      (order.status || 'Pending') === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      (order.status || 'Pending') === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Order"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="Edit Order"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Delete Order"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const OrdersTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={handleExportOrders} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Export
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Orders ({filteredOrders.length})</h3>
        </div>
        {ordersError && (
          <div className="px-6 py-3 text-sm text-red-700 bg-red-50 border-t border-red-200">{ordersError}</div>
        )}
        {!ordersError && filteredOrders.length === 0 && (
          <div className="px-6 py-6 text-sm text-gray-600">No orders found yet.</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">#{order.id.slice(0,6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`.trim() || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Array.isArray(order.items) ? order.items.length : 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${(order.total || 0).toFixed ? order.total.toFixed(2) : Number(order.total || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      (order.status || 'Pending') === 'Completed' ? 'bg-green-100 text-green-800' :
                      (order.status || 'Pending') === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      (order.status || 'Pending') === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Order"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="Edit Order"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Delete Order"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ProductsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button 
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaPlus className="inline mr-2" />
            Add Product
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {products.length === 0
          ? (
            <div className="text-center py-8 text-gray-400">No products yet.</div>
          )
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-gray-50 rounded-lg shadow border p-4 flex flex-col">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="object-contain h-40 w-full mb-2 rounded" />
                  )}
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                  <p className="text-lg font-bold mb-2 text-gray-900">${product.price}</p>
                  <div className="flex-1 text-gray-500 text-sm mb-2">{product.description}</div>
                  <div className="text-xs text-gray-400 mb-3">Stock: {product.stock}</div>
                  {(adminAuth.currentUser && (!product.createdBy || product.createdBy === adminAuth.currentUser.uid)) && (
                    <button onClick={() => handleDeleteProduct(product.id, product.createdBy)} className="self-end text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" title="Delete product">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );

  const CustomersTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600 mt-1">View and manage customer information</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Export
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Customers ({filteredCustomers.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.totalSpent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Customer"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="Edit Customer"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'orders': return <OrdersTab />;
      case 'products': return <ProductsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(prev => !prev)}
        className="lg:hidden fixed top-4 left-4 z-40 p-3 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <FaBars />
      </button>

      {/* Removed dark overlay on mobile to prevent background dimming */}

      <div className="flex">
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6 lg:p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddProductModal(false)}></div>
          <div className="relative z-50 w-full h-full flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
              <form onSubmit={handleAddProduct}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        <option value="men's clothing">Men's Clothing</option>
                        <option value="women's clothing">Women's Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="shoes">Shoes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter product description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <FaSave className="mr-2" />
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowOrderModal(false)}></div>
          <div className="relative z-50 w-full h-full flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Order Details - {selectedOrder.id}</h3>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer</label>
                      <p className="text-sm text-gray-900">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-sm text-gray-900">${(selectedOrder.total || 0).toFixed ? selectedOrder.total.toFixed(2) : Number(selectedOrder.total || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedOrder.customer?.email || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedOrder.customer?.phone || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customer?.address || '—'}</p>
                    <p className="text-sm text-gray-900">{[selectedOrder.customer?.city, selectedOrder.customer?.zip, selectedOrder.customer?.country].filter(Boolean).join(', ') || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                    <div className="space-y-2">
                      {(selectedOrder.items || []).map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex-1 pr-2 truncate">{it.title || it.name}</div>
                          <div className="text-gray-500">x{it.quantity}</div>
                          <div className="w-24 text-right font-medium">${(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex gap-2">
                      {['Pending', 'Processing', 'Shipped', 'Completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            selectedOrder.status === status
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
