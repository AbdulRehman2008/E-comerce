import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'

const Cart = () => {
  const { items, subtotal, removeFromCart, setQuantity, clearCart } = useCart()
  const navigate = useNavigate()
  const hasItems = items.length > 0
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-6">Shopping Cart</h1>

        {!hasItems && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">Your cart is empty</p>
          </div>
        )}

        {hasItems && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-contain" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-700 font-medium mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                      className="w-16 border rounded-md px-2 py-1"
                    />
                    <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-sm text-gray-600 hover:underline">Clear cart</button>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 mb-4">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-900 font-semibold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <button onClick={() => navigate('/checkout')} className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800">Checkout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart;