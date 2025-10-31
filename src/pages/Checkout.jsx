import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { auth, db } from '../firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

async function sendOrderEmail(order, orderId) {
  try {
    const serviceId = import.meta?.env?.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta?.env?.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta?.env?.VITE_EMAILJS_PUBLIC_KEY
    if (!serviceId || !templateId || !publicKey) return
    const mod = await import('@emailjs/browser')
    const emailjs = mod.default || mod
    emailjs.init(publicKey)
    const toEmail = order.customer.email || (auth.currentUser?.email || '')
    if (!toEmail) return
    const itemsText = (order.items || []).map(it => `${it.title || it.name} x${it.quantity} - $${(Number(it.price) * Number(it.quantity)).toFixed(2)}`).join('\n')
    const params = {
      to_email: toEmail,
      order_id: orderId || '',
      customer_name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      customer_email: toEmail,
      customer_phone: order.customer.phone || '',
      shipping_address: `${order.customer.address}, ${order.customer.city} ${order.customer.zip}, ${order.customer.country}`,
      order_total: (order.total || 0).toFixed(2),
      order_items: itemsText,
      order_status: order.status || 'Pending',
    }
    console.info('[EmailJS] sending order email', params)
    await emailjs.send(serviceId, templateId, params)
    console.info('[EmailJS] sent order email OK')
  } catch (e) {
    console.error('Email send failed:', e)
  }
}

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const hasItems = items.length > 0

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasItems) return
    setErrorMsg('')
    setSubmitting(true)
    try {
      const order = {
        userId: auth.currentUser ? auth.currentUser.uid : null,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          country: form.country,
          zip: form.zip,
        },
        items: items.map(i => ({ id: i.id, title: i.title || i.name, price: i.price, quantity: i.quantity, image: i.image })),
        total: subtotal,
        status: 'Pending',
        createdAt: serverTimestamp(),
      }

      // Try to save the order, but don't block UX if network is slow
      const savePromise = addDoc(collection(db, 'orders'), order)
      const raceResult = await Promise.race([
        savePromise.then(ref => ({ ok: true, ref })).catch(error => ({ ok: false, error })),
        new Promise(resolve => setTimeout(() => resolve({ timeout: true }), 2500))
      ])

      let orderId = undefined
      if (raceResult?.ok && raceResult.ref) {
        orderId = raceResult.ref.id
      } else if (raceResult?.timeout) {
        // Complete save in background
        savePromise.then(ref => console.info('Order saved (background):', ref.id))
                   .catch(err => console.error('Order save failed (background):', err))
      } else if (raceResult?.ok === false) {
        // Saving failed fast
        console.error('Order save failed:', raceResult.error)
      }

      const summary = {
        orderId,
        name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
        email: order.customer.email,
        total: order.total,
        itemsCount: order.items.reduce((n, it) => n + it.quantity, 0),
      }
      // fire-and-forget email
      sendOrderEmail(order, orderId)
      clearCart()
      setSubmitting(false)
      navigate('/thank-you', { state: { summary } })
    } catch (err) {
      console.error('Order creation failed', err)
      setErrorMsg(err?.message || 'Failed to place order. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-6">Checkout</h1>

        {!hasItems && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">Your cart is empty.</p>
          </div>
        )}

        {hasItems && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-2">{errorMsg}</div>
              )}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" className="border rounded-md px-3 py-2" required />
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" className="border rounded-md px-3 py-2" required />
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border rounded-md px-3 py-2 sm:col-span-2" required />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded-md px-3 py-2 sm:col-span-2" />
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border rounded-md px-3 py-2 sm:col-span-2" required />
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border rounded-md px-3 py-2" required />
                  <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="border rounded-md px-3 py-2" required />
                  <input name="zip" value={form.zip} onChange={handleChange} placeholder="ZIP / Postal code" className="border rounded-md px-3 py-2" required />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="cardName" value={form.cardName} onChange={handleChange} placeholder="Name on card" className="border rounded-md px-3 py-2 sm:col-span-2" required />
                  <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="Card number" className="border rounded-md px-3 py-2 sm:col-span-2" required />
                  <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" className="border rounded-md px-3 py-2" required />
                  <input name="cvc" value={form.cvc} onChange={handleChange} placeholder="CVC" className="border rounded-md px-3 py-2" required />
                </div>
              </div>

              <button type="submit" disabled={submitting} className={`w-full text-white py-3 rounded-lg font-medium ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}>{submitting ? 'Processing…' : 'Place Order'}</button>
            </form>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout