import React, { useContext, useState } from 'react'
import Title from '../component/Title'
import CartTotal from '../component/CartTotal'
import razorpay from '../assets/Razorpay.jpg'
import qrImage from '../assets/qr.jpg'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/authContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'
import { FaQrcode } from 'react-icons/fa'

function PlaceOrder() {
    let [method,setMethod] = useState('cod')
    let navigate = useNavigate()
    const {cartItem , setCartItem , getCartAmount , delivery_fee , products } = useContext(shopDataContext)
    let {serverUrl} = useContext(authDataContext)
    let [loading ,setLoading] = useState(false)

    let [formData,setFormData] = useState({
        firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    pinCode:'',
    country:'',
    phone:''
    })

    // Split payment state
    let [splitPayment, setSplitPayment] = useState(false)
    let [splitData, setSplitData] = useState({
        payer1: { name: '', email: '', amount: 0 },
        payer2: { name: '', email: '', amount: 0 }
    })

    // Delivery slot state
    let [deliverySlot, setDeliverySlot] = useState({
        date: '',
        time: '',
        ecoMode: false
    })

    const onChangeHandler = (e)=>{
    const name = e.target.name;
    const value = e.target.value;
    setFormData(data => ({...data,[name]:value}))
    }

    const initPay = (order) =>{
        try {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Mykart - Order Payment',
                description: 'Order Payment',
                order_id: order.id,
                receipt: order.receipt,
                handler: async (response) => {
                    console.log('Payment successful:', response)
                    try {
                        const {data} = await axios.post(serverUrl + '/api/order/verifyrazorpay', response, {withCredentials: true})
                        if(data && data.message === 'Payment Successful'){
                            navigate("/order")
                            setCartItem({})
                            toast.success("Payment Successful!")
                        } else {
                            toast.error("Payment verification failed")
                        }
                    } catch (verifyError) {
                        console.error('Payment verification error:', verifyError)
                        toast.error("Payment verification failed")
                    }
                },
                modal: {
                    ondismiss: function() {
                        toast.info("Payment cancelled by user")
                    }
                },
                theme: {
                    color: "#3399cc"
                }
            }

            if (!window.Razorpay) {
                toast.error("Razorpay SDK not loaded. Please refresh the page.")
                return
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error) {
            console.error('Razorpay initialization error:', error)
            toast.error("Payment initialization failed. Please try again.")
        }
   }

    
     const onSubmitHandler = async (e) => {
        
    setLoading(true)
        e.preventDefault()
    try {
      let orderItems = []
      for(const items in cartItem){
        for(const item in cartItem[items]){
          if(cartItem[items][item] > 0){
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if(itemInfo){
               itemInfo.size = item
               itemInfo.quantity = cartItem[items][item]
               orderItems.push(itemInfo)
            }
          }
        }
      }
      let orderData = {
        address:formData,
        items:orderItems,
        amount:getCartAmount() + delivery_fee,
        splitPayment: splitPayment ? splitData : null,
        deliverySlot: deliverySlot.date && deliverySlot.time ? deliverySlot : null
      }
      switch(method){
         case 'cod':
         const result = await axios.post(serverUrl + "/api/order/placeorder" , orderData , {withCredentials:true})
         console.log(result.data)
         if(result.data){
             setCartItem({})
             toast.success("Order Placed Successfully")
             navigate("/order")
             setLoading(false)
         }else{
             console.log(result.data.message)
             toast.error("Order Placement Failed")
             setLoading(false)
         }
         break;

         case 'qr':
         // QR payment redirects to separate page, no need to process here
         break;

         case 'razorpay':
        try {
            const resultRazorpay = await axios.post(serverUrl + "/api/order/razorpay" , orderData , {withCredentials:true})
            if(resultRazorpay.data && resultRazorpay.data.id){
                initPay(resultRazorpay.data)
                toast.success("Order created, opening payment gateway...")
                setLoading(false)
            } else {
                toast.error("Failed to create payment order")
                setLoading(false)
            }
        } catch (razorpayError) {
            console.error('Razorpay order creation error:', razorpayError)
            toast.error("Payment gateway error. Please try Cash on Delivery instead.")
            setLoading(false)
        }

        break;




        default:
        break;

      }
    
      
    } catch (error) {
      console.log(error)
    
    }
     }
  return (
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] flex items-center justify-center flex-col md:flex-row gap-[50px] pt-32 md:pt-28 lg:pt-32 relative'>
        <div className='lg:w-[50%] w-[100%] h-[100%] flex items-center justify-center  lg:mt-[0px] mt-[90px] '>
            <form action="" onSubmit={onSubmitHandler} className='lg:w-[80%] w-[95%] lg:h-[80%] h-[100%]'>
        <div className='py-[10px]'>
        <Title text1={'DELIVERY'} text2={'INFORMATION'} className='text-[24px] md:text-[28px]'/>
        </div>
        <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>

         <input type="text" placeholder='First name' className='w-[48%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300'required  onChange={onChangeHandler} name='firstName' value={formData.firstName}/>

          <input type="text" placeholder='Last name' className='w-[48%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300' required onChange={onChangeHandler} name='lastName' value={formData.lastName} />
        </div>

        <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
          <input type="email" placeholder='Email address' className='w-[100%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300'required onChange={onChangeHandler} name='email' value={formData.email} />
         
        </div>
        <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
          <input type="text" placeholder='Street' className='w-[100%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300' required onChange={onChangeHandler} name='street' value={formData.street} />
         
        </div>
        <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
          <input type="text" placeholder='City' className='w-[48%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300' required onChange={onChangeHandler} name='city' value={formData.city} />
          <input type="text" placeholder='State' className='w-[48%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300' required onChange={onChangeHandler} name='state' value={formData.state} />
        </div>
        <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
          <input type="text" placeholder='Pincode' className='w-[48%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300' required onChange={onChangeHandler} name='pinCode' value={formData.pinCode} />
          <input type="text" placeholder='Country' className='w-[48%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300' required onChange={onChangeHandler} name='country' value={formData.country} />
        </div>
         <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
          <input type="text" placeholder='Phone' className='w-[100%] h-[50px] rounded-md bg-white/20 backdrop-blur-sm placeholder:text-white/70 text-white text-[18px] px-[20px] border border-white/30 focus:border-purple-400 focus:outline-none transition-all duration-300' required onChange={onChangeHandler} name='phone' value={formData.phone} />
         
        </div>
        <div className='flex justify-center mt-8'>
           <button type='submit' className='text-[18px] cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-[12px] px-[60px] rounded-2xl text-white flex items-center justify-center gap-[20px] border-2 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300' >{loading? <Loading/> : "PLACE ORDER"}</button>
          </div>


            </form>

       
        </div>
         <div className='lg:w-[50%] w-[100%] min-h-[100%] flex items-center justify-center gap-[30px]'>
           <div className='lg:w-[80%] w-[90%] lg:h-[80%] h-[100%]  flex items-center justify-center gap-[10px] flex-col'>
                <CartTotal/>

                {/* Delivery Slot Selection */}
                <div className='py-[10px]'>
       <Title text1={'DELIVERY'} text2={'SLOT'} className='text-[20px] md:text-[24px]'/>
       </div>
        <div className='w-[100%] bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label className='text-white text-sm block mb-1'>Preferred Date:</label>
                    <input
                        type="date"
                        value={deliverySlot.date}
                        onChange={(e) => setDeliverySlot(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className='w-full h-8 rounded px-2 text-black'
                    />
                </div>
                <div>
                    <label className='text-white text-sm block mb-1'>Preferred Time:</label>
                    <select
                        value={deliverySlot.time}
                        onChange={(e) => setDeliverySlot(prev => ({ ...prev, time: e.target.value }))}
                        className='w-full h-8 rounded px-2 text-black'
                    >
                        <option value="">Select Time Slot</option>
                        <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</option>
                        <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM</option>
                        <option value="6:00 PM - 9:00 PM">6:00 PM - 9:00 PM</option>
                    </select>
                </div>
            </div>
            <div className='mt-3'>
                <label className='flex items-center gap-2 text-white text-sm'>
                    <input
                        type="checkbox"
                        checked={deliverySlot.ecoMode}
                        onChange={(e) => setDeliverySlot(prev => ({ ...prev, ecoMode: e.target.checked }))}
                        className='w-4 h-4'
                    />
                    <span>🌱 Eco-Friendly Delivery (Less Packaging)</span>
                </label>
            </div>
            {deliverySlot.date && deliverySlot.time && (
                <div className='mt-3 p-2 bg-green-100 rounded text-green-800 text-sm'>
                    📅 Delivery scheduled for {deliverySlot.date} between {deliverySlot.time}
                    {deliverySlot.ecoMode && ' (Eco Mode)'}
                </div>
            )}
        </div>

                <div className='py-[10px]'>
       <Title text1={'PAYMENT'} text2={'METHOD'} className='text-[20px] md:text-[24px]'/>
       </div>
        <div className='w-[100%] h-[30vh] lg:h-[120px] flex flex-col items-center mt-[20px] lg:mt-[0px] gap-[15px]'>
            <div className='flex items-center justify-center gap-[30px] flex-wrap'>
                <button
                    onClick={()=>setMethod('razorpay')}
                    className={`w-[140px] h-[45px] rounded-sm transition-all duration-300 ${method === 'razorpay' ? 'border-[3px] border-blue-500 shadow-lg scale-105' : 'border-2 border-gray-300 hover:border-blue-400'}`}
                    title="Online Payment (Razorpay)"
                >
                    <img src={razorpay} className='w-[100%] h-[100%] object-fill rounded-sm' alt="Razorpay" />
                </button>
                <button
                    onClick={()=>{
                        setMethod('qr');
                        // Save form data for QR payment page
                        localStorage.setItem('orderFormData', JSON.stringify(formData));
                        navigate('/qr-payment');
                    }}
                    className={`w-[140px] h-[45px] bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-sm font-bold text-[14px] transition-all duration-300 flex items-center justify-center gap-2 ${method === 'qr' ? 'border-[3px] border-green-600 shadow-lg scale-105' : 'border-2 border-gray-300 hover:border-green-500'}`}
                    title="Pay using QR Code"
                >
                    <FaQrcode className="text-lg" />
                    QR PAYMENT
                </button>
                <button
                    onClick={()=>setMethod('cod')}
                    className={`w-[140px] h-[45px] bg-gradient-to-t from-[#95b3f8] to-[white] text-[13px] px-[15px] rounded-sm text-[#332f6f] font-bold transition-all duration-300 ${method === 'cod' ? 'border-[3px] border-blue-500 shadow-lg scale-105' : 'border-2 border-gray-300 hover:border-blue-400'}`}
                >
                    CASH ON DELIVERY
                </button>
            </div>

            {/* Split Payment Option */}
            {(method === 'razorpay' || method === 'qr') && (
                <div className='w-full mt-4'>
                    <div className='flex items-center justify-center gap-4 mb-3'>
                        <label className='text-white text-sm'>Split Payment:</label>
                        <input
                            type="checkbox"
                            checked={splitPayment}
                            onChange={(e) => setSplitPayment(e.target.checked)}
                            className='w-4 h-4'
                        />
                    </div>

                    {splitPayment && (
                        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                            <h4 className='text-white text-center mb-3 font-semibold'>Split Payment Details</h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-white text-sm block mb-1'>Payer 1 Name:</label>
                                    <input
                                        type="text"
                                        value={splitData.payer1.name}
                                        onChange={(e) => setSplitData(prev => ({
                                            ...prev,
                                            payer1: { ...prev.payer1, name: e.target.value }
                                        }))}
                                        className='w-full h-8 rounded px-2 text-black'
                                        placeholder="Enter name"
                                    />
                                    <label className='text-white text-sm block mb-1 mt-2'>Payer 1 Email:</label>
                                    <input
                                        type="email"
                                        value={splitData.payer1.email}
                                        onChange={(e) => setSplitData(prev => ({
                                            ...prev,
                                            payer1: { ...prev.payer1, email: e.target.value }
                                        }))}
                                        className='w-full h-8 rounded px-2 text-black'
                                        placeholder="Enter email"
                                    />
                                    <label className='text-white text-sm block mb-1 mt-2'>Amount (₹):</label>
                                    <input
                                        type="number"
                                        value={splitData.payer1.amount}
                                        onChange={(e) => setSplitData(prev => ({
                                            ...prev,
                                            payer1: { ...prev.payer1, amount: parseFloat(e.target.value) || 0 }
                                        }))}
                                        className='w-full h-8 rounded px-2 text-black'
                                        placeholder="Amount"
                                        max={getCartAmount() + delivery_fee}
                                    />
                                </div>
                                <div>
                                    <label className='text-white text-sm block mb-1'>Payer 2 Name:</label>
                                    <input
                                        type="text"
                                        value={splitData.payer2.name}
                                        onChange={(e) => setSplitData(prev => ({
                                            ...prev,
                                            payer2: { ...prev.payer2, name: e.target.value }
                                        }))}
                                        className='w-full h-8 rounded px-2 text-black'
                                        placeholder="Enter name"
                                    />
                                    <label className='text-white text-sm block mb-1 mt-2'>Payer 2 Email:</label>
                                    <input
                                        type="email"
                                        value={splitData.payer2.email}
                                        onChange={(e) => setSplitData(prev => ({
                                            ...prev,
                                            payer2: { ...prev.payer2, email: e.target.value }
                                        }))}
                                        className='w-full h-8 rounded px-2 text-black'
                                        placeholder="Enter email"
                                    />
                                    <label className='text-white text-sm block mb-1 mt-2'>Amount (₹):</label>
                                    <input
                                        type="number"
                                        value={splitData.payer2.amount}
                                        onChange={(e) => setSplitData(prev => ({
                                            ...prev,
                                            payer2: { ...prev.payer2, amount: parseFloat(e.target.value) || 0 }
                                        }))}
                                        className='w-full h-8 rounded px-2 text-black'
                                        placeholder="Amount"
                                        max={getCartAmount() + delivery_fee}
                                    />
                                </div>
                            </div>
                            <div className='text-center mt-3'>
                                <p className='text-white text-sm'>
                                    Total: ₹{getCartAmount() + delivery_fee} |
                                    Split: ₹{splitData.payer1.amount + splitData.payer2.amount}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
            </div>
        </div>
      
    </div>
  )
}

export default PlaceOrder
