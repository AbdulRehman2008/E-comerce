import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    const load = async () => {
      setError('')
      setLoading(true)
      try {
        if (/^\d+$/.test(id)) {
          const res = await fetch(`https://fakestoreapi.com/products/${id}`)
          if (!res.ok) throw new Error('Failed to load product')
          const data = await res.json()
          setProduct({
            id: data.id,
            title: data.title,
            price: data.price,
            image: data.image,
            description: data.description,
            category: data.category,
          })
        } else {
          const snap = await getDoc(doc(db, 'products', id))
          if (!snap.exists()) throw new Error('Product not found')
          const d = snap.data()
          setProduct({
            id: id,
            title: d.name || d.title,
            price: d.price,
            image: d.image,
            description: d.description || '',
            category: d.category || '',
          })
        }
      } catch (e) {
        setError(e?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">Loading…</div>
  if (error) return <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
          <img src={product.image} alt={product.title} className="max-h-96 object-contain" />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-900">{product.title}</h1>
          <p className="mt-2 text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</p>
          {product.category && <p className="mt-1 text-sm text-gray-500 capitalize">{product.category}</p>}
          {product.description && <p className="mt-4 text-gray-700">{product.description}</p>}
          <button onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, image: product.image })} className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800">Add to Cart</button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
