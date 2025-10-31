import { useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'

const UserDashboard = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      try {
        const userSnap = await getDoc(doc(db, 'users', u.uid))
        setProfile(userSnap.exists() ? userSnap.data() : { email: u.email })
      } catch {}
      const q = query(collection(db, 'orders'), where('userId', '==', u.uid))
      const unsubOrders = onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        data.sort((a,b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
          const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
          return tb - ta
        })
        setOrders(data)
      }, (err) => {
        console.error('User orders load error', err)
      })
      return () => unsubOrders()
    })
    return () => unsub()
  }, [navigate])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="bg-white rounded-lg shadow p-6 flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile</h2>
            <p className="text-gray-700">{profile?.name || 'User'}</p>
            <p className="text-gray-500 text-sm">{profile?.email || auth.currentUser?.email}</p>
            <button onClick={handleLogout} className="mt-4 inline-flex bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Logout</button>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Links</h2>
            <div className="space-x-3">
              <Link to="/cart" className="inline-block px-3 py-2 border rounded hover:bg-gray-50">Cart</Link>
              <Link to="/products" className="inline-block px-3 py-2 border rounded hover:bg-gray-50">Shop</Link>
              <Link to="/orders" className="inline-block px-3 py-2 border rounded hover:bg-gray-50">Order History</Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-4">Recent Orders</h2>
          {orders.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">No orders yet.</div>
          )}
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm text-gray-600">Order #{order.id.slice(0,6)}</div>
                  <div className="text-sm text-gray-600">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ''}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">${(order.total || 0).toFixed ? order.total.toFixed(2) : Number(order.total || 0).toFixed(2)}</div>
                    <div className="mt-1 text-xs inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-700">{order.status || 'Pending'}</div>
                  </div>
                  <div className="text-sm text-gray-600">{Array.isArray(order.items) ? order.items.length : 0} items</div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(order.items || []).slice(0,4).map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={it.image} alt={it.title || it.name} className="w-10 h-10 object-contain" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 truncate">{it.title || it.name}</div>
                        <div className="text-xs text-gray-500">x{it.quantity} · ${(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
