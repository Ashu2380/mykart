import React, { useState } from 'react'
import { toast } from 'react-toastify';

function NewLetterBox() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                toast.success(data.message || 'Subscribed successfully!');
                setEmail('');
            } else {
                toast.error(data.message || 'Failed to subscribe');
            }
        } catch (error) {
            console.error('Newsletter error:', error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='w-[100%] h-[40vh] bg-blue-50 flex items-center justify-start gap-[10px] flex-col'>
            <p className='md:text-[30px] text-[20px] text-gray-800 font-semibold px-[20px]'>Subscribe now & get 15% off</p>
            <p className='md:text-[18px] text-[14px] text-center text-gray-700 font-semibold px-[20px]'>Subscribe now and enjoy exclusive savings, special deals, and early access to new collections.</p>
            <form onSubmit={handleSubmit} className='w-[100%] h-[30%] md:h-[50%] flex items-center justify-center mt-[20px] gap-[20px] px-[20px]'>
                <input 
                    type='email' 
                    placeholder='Enter Your Email' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className='placeholder:text-gray-500 bg-slate-300 w-[600px] max-w-[60%] h-[40px] px-[20px] rounded-lg shadow-sm shadow-black focus:outline-none focus:ring-2 focus:ring-blue-400'
                    required 
                />
                <button 
                    type='submit' 
                    disabled={isLoading}
                    className='text-[15px] md:text-[16px] px-[10px] md:px-[30px] py-[12px] md:py-[10px] hover:bg-slate-500 cursor-pointer bg-[#2e3030c9] text-white flex items-center justify-center gap-[20px] border-[1px] border-[#80808049] rounded-lg shadow-sm shadow-black disabled:opacity-50'
                >
                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
        </div>
    )
}

export default NewLetterBox
