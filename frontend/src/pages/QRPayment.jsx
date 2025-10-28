import React, { useContext, useState } from 'react'
import Title from '../component/Title'
import qrImage from '../assets/qr.jpg'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/authContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import Loading from '../component/Loading'

function QRPayment() {
    const { getCartAmount, delivery_fee, currency, cartItem, setCartItem, products } = useContext(shopDataContext)
    const { serverUrl } = useContext(authDataContext)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const totalAmount = getCartAmount() + delivery_fee

    // Generate UPI deep link with dynamic amount
    const upiLink = `upi://pay?pa=mykart@upi&pn=Mykart&am=${totalAmount}&cu=INR&tn=Order Payment`

    const handlePaymentComplete = async () => {
        // Add confirmation dialog
        const confirmed = window.confirm(
            `⚠️ Payment Confirmation Required\n\n` +
            `Amount: ${currency} ${totalAmount}\n\n` +
            `Have you completed the QR payment of ${currency} ${totalAmount}?\n\n` +
            `⚠️ Warning: Clicking "OK" confirms you have made the payment. ` +
            `False confirmation may result in order cancellation.`
        );

        if (!confirmed) {
            toast.info("Payment not confirmed. Please complete the payment first.");
            return;
        }

        setLoading(true)
        try {
            // Get form data from localStorage
            const formData = JSON.parse(localStorage.getItem('orderFormData') || '{}')

            if (!formData.firstName) {
                toast.error("Please go back and fill delivery information first")
                navigate('/placeorder')
                return
            }

            // Create order items from cart with full product details
            const orderItems = []
            for (const itemId in cartItem) {
                for (const size in cartItem[itemId]) {
                    if (cartItem[itemId][size] > 0) {
                        const productInfo = products.find(product => product._id === itemId)
                        if (productInfo) {
                            const itemInfo = {
                                name: productInfo.name,
                                image1: productInfo.image1,
                                price: productInfo.price,
                                size: size,
                                quantity: cartItem[itemId][size]
                            }
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            const orderData = {
                address: formData,
                items: orderItems,
                amount: totalAmount
            }

            const result = await axios.post(serverUrl + "/api/order/placeorder", {
                ...orderData,
                paymentMethod: 'QR Payment',
                paymentStatus: 'completed' // Mark as completed since user confirmed
            }, { withCredentials: true })

            if (result.data) {
                setCartItem({})
                localStorage.removeItem('orderFormData')
                toast.success("Order Placed Successfully! Payment confirmed.")
                navigate("/order")
            } else {
                toast.error("Order Placement Failed")
            }
        } catch (error) {
            console.error('Order placement error:', error)
            toast.error("Order Placement Failed")
        } finally {
            setLoading(false)
        }
    }

    return (
    <div className='w-[100vw] min-h-[100vh] bg-slate-900 flex items-center justify-center p-4'>
            <div className='max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden'>
                {/* Header */}
                <div className='bg-green-600 text-white p-6 text-center'>
                    <h1 className='text-2xl font-bold mb-2'>QR Code Payment</h1>
                    <p className='text-green-100'>Scan the QR code to complete your payment</p>
                </div>

                {/* QR Code Section */}
                <div className='p-8 text-center'>
                    <div className='mb-6'>
                        <div className='w-64 h-64 mx-auto bg-white border-4 border-gray-200 rounded-xl overflow-hidden shadow-lg'>
                                <a
                                    href={upiLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className='block w-full h-full'
                                >
                                    <img
                                        src={qrImage}
                                        alt="Payment QR Code"
                                        className='w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity'
                                    />
                                </a>
                            </div>
                    </div>

                    {/* Payment Details */}
                    <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                        <div className='space-y-3'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600 font-medium'>UPI ID:</span>
                                <span className='text-gray-800 font-semibold'>mykart@upi</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600 font-medium'>Amount:</span>
                                <span className='text-green-600 font-bold text-lg'>{currency} {totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className='text-left mb-6'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-3'>How to Pay:</h3>
                        <ol className='text-sm text-gray-600 space-y-2'>
                            <li className='flex items-start gap-2'>
                                <span className='bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5'>1</span>
                                <span>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5'>2</span>
                                <span>Scan the QR code above</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5'>3</span>
                                <span>Verify the amount and UPI ID</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5'>4</span>
                                <span>Complete the payment</span>
                            </li>
                        </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-3'>
                            <a
                                href={upiLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-center transition-all duration-300 shadow-lg hover:shadow-xl'
                            >
                                Pay Now
                            </a>
                            <button
                                onClick={handlePaymentComplete}
                                disabled={loading}
                                className='bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                            >
                                {loading ? (
                                    <>
                                        <Loading />
                                        Processing...
                                    </>
                                ) : (
                                    "Done"
                                )}
                            </button>
                        </div>

                        <div className='space-y-2'>
                            <button
                                onClick={() => navigate('/placeorder')}
                                className='w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300'
                            >
                                Place Order (Skip Payment)
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className='w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors duration-300'
                            >
                                Back to Payment Options
                            </button>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className='text-xs text-gray-500 mt-4 space-y-1'>
                        <p>💡 <strong>Important:</strong> You will be asked to confirm payment before order placement.</p>
                        <p>📱 Exact amount to pay: <strong className='text-green-600'>{currency} {totalAmount}</strong></p>
                        <p>⚠️ Only confirm if you have completed the payment.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QRPayment