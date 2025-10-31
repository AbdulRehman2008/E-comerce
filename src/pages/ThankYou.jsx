import { Link, useLocation } from 'react-router-dom'

const ThankYou = () => {
  const location = useLocation()
  const summary = location.state?.summary
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-4">Thank you for your order!</h1>
        <p className="text-gray-600 mb-8">We’ve received your order{summary?.name ? `, ${summary.name}` : ''} and sent a confirmation email{summary?.email ? ` to ${summary.email}` : ''}.</p>
        {summary && (
          <div className="bg-white rounded-lg shadow p-6 text-left mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h2>
            <div className="flex justify-between text-gray-700 mb-1"><span>Items</span><span>{summary.itemsCount}</span></div>
            <div className="flex justify-between text-gray-900 font-semibold text-lg"><span>Total</span><span>${summary.total?.toFixed ? summary.total.toFixed(2) : Number(summary.total || 0).toFixed(2)}</span></div>
          </div>
        )}
        <Link to="/products" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800">Continue Shopping</Link>
      </div>
    </div>
  )
}

export default ThankYou


