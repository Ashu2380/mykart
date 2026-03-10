import React, { useState, useEffect } from 'react'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/authContext'
import axios from 'axios'
import { toast } from 'react-toastify'

function Invoice({ orderId, onClose }) {
    const [invoiceData, setInvoiceData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { currency } = React.useContext(shopDataContext)
    const { serverUrl } = React.useContext(authDataContext)

    // Handle both old format (orderId as string) and new format (orderId as object)
    const orderIdStr = typeof orderId === 'object' ? orderId.orderId : orderId
    const itemId = typeof orderId === 'object' ? orderId.itemId : null

    useEffect(() => {
        fetchInvoice()
    }, [orderId])

    const fetchInvoice = async () => {
        try {
            setLoading(true)
            const requestData = { orderId: orderIdStr }
            if (itemId) {
                requestData.itemId = itemId
            }
            const result = await axios.post(serverUrl + '/api/order/invoice', 
                requestData,
                { withCredentials: true }
            )
            if (result.data) {
                setInvoiceData(result.data)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load invoice')
        } finally {
            setLoading(false)
        }
    }

    const downloadInvoice = () => {
        if (!invoiceData) return

        // Create a printable version
        const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - ${invoiceData.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company-name { font-size: 28px; font-weight: bold; color: #2563eb; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f3f4f6; }
        .totals { text-align: right; }
        .total-row { display: flex; justify-content: flex-end; gap: 50px; padding: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${invoiceData.company.name}</div>
        <p>${invoiceData.company.address}</p>
        <p>Phone: ${invoiceData.company.phone} | Email: ${invoiceData.company.email}</p>
    </div>
    
    <div class="invoice-info">
        <div>
            <strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}<br/>
            <strong>Invoice Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}<br/>
            <strong>Order ID:</strong> ${invoiceData.orderId}
        </div>
        <div>
            <strong>Billing To:</strong><br/>
            ${invoiceData.customer.name}<br/>
            ${invoiceData.customer.email}<br/>
            ${invoiceData.customer.phone}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Shipping Address</div>
        <p>${invoiceData.shippingAddress.street}, ${invoiceData.shippingAddress.city}, ${invoiceData.shippingAddress.state} - ${invoiceData.shippingAddress.pinCode}</p>
    </div>
    
    <div class="section">
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.size}</td>
                    <td>${item.quantity}</td>
                    <td>${currency} ${item.price}</td>
                    <td>${currency} ${item.total}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${currency} ${invoiceData.summary.subtotal}</span>
        </div>
        <div class="total-row">
            <span>Shipping:</span>
            <span>${invoiceData.summary.shipping === 0 ? 'Free' : currency + ' ' + invoiceData.summary.shipping}</span>
        </div>
        <div class="total-row grand-total">
            <span>Total:</span>
            <span>${currency} ${invoiceData.summary.total}</span>
        </div>
    </div>
    
    <div class="section" style="margin-top: 20px;">
        <p><strong>Payment Method:</strong> ${invoiceData.payment.method}</p>
        <p><strong>Payment Status:</strong> ${invoiceData.payment.status}</p>
        <p><strong>Order Status:</strong> ${invoiceData.orderStatus}</p>
    </div>
    
    <div class="footer">
        <p>Thank you for shopping with ${invoiceData.company.name}!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
</body>
</html>
        `

        // Open in new window and print
        const printWindow = window.open('', '_blank')
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-center mt-4">Loading Invoice...</p>
                </div>
            </div>
        )
    }

    if (!invoiceData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-red-500">Failed to load invoice</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b bg-blue-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-600">{invoiceData.company.name}</h2>
                            <p className="text-sm text-gray-600">{invoiceData.company.address}</p>
                            <p className="text-sm text-gray-600">Phone: {invoiceData.company.phone}</p>
                            <p className="text-sm text-gray-600">Email: {invoiceData.company.email}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>
                </div>

                {/* Invoice Info */}
                <div className="p-6 border-b">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Invoice Number</p>
                            <p className="font-semibold">{invoiceData.invoiceNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Invoice Date</p>
                            <p className="font-semibold">{new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-semibold">{invoiceData.orderId}</p>
                        </div>
                    </div>
                </div>

                {/* Customer & Shipping */}
                <div className="p-6 border-b grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Billing To</p>
                        <p className="font-semibold">{invoiceData.customer.name}</p>
                        <p className="text-sm">{invoiceData.customer.email}</p>
                        <p className="text-sm">{invoiceData.customer.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                        <p className="text-sm">{invoiceData.shippingAddress.street}</p>
                        <p className="text-sm">{invoiceData.shippingAddress.city}, {invoiceData.shippingAddress.state}</p>
                        <p className="text-sm">PIN: {invoiceData.shippingAddress.pinCode}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 text-sm text-gray-600">Item</th>
                                <th className="text-left py-2 text-sm text-gray-600">Size</th>
                                <th className="text-right py-2 text-sm text-gray-600">Qty</th>
                                <th className="text-right py-2 text-sm text-gray-600">Price</th>
                                <th className="text-right py-2 text-sm text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-3">{item.name}</td>
                                    <td className="py-3 text-sm text-gray-600">{item.size}</td>
                                    <td className="py-3 text-right">{item.quantity}</td>
                                    <td className="py-3 text-right">{currency} {item.price}</td>
                                    <td className="py-3 text-right">{currency} {item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-1">
                                <span className="text-gray-600">Subtotal</span>
                                <span>{currency} {invoiceData.summary.subtotal}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-600">Shipping</span>
                                <span>{invoiceData.summary.shipping === 0 ? 'Free' : currency + ' ' + invoiceData.summary.shipping}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t font-bold text-lg">
                                <span>Total</span>
                                <span className="text-blue-600">{currency} {invoiceData.summary.total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="p-6 border-t">
                    <div className="flex gap-8">
                        <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-semibold">{invoiceData.payment.method}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <p className={`font-semibold ${invoiceData.payment.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                {invoiceData.payment.status}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Order Status</p>
                            <p className="font-semibold">{invoiceData.orderStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t bg-gray-50 flex gap-4">
                    <button 
                        onClick={downloadInvoice}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Invoice
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 text-center text-xs text-gray-500 border-t">
                    <p>Thank you for shopping with {invoiceData.company.name}!</p>
                    <p>This is a computer-generated invoice and does not require a signature.</p>
                </div>
            </div>
        </div>
    )
}

export default Invoice
