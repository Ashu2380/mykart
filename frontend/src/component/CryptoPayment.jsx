import React, { useState, useEffect } from 'react'
import { authDataContext } from '../context/authContext'
import { shopDataContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

// Helper function to convert ETH to wei
const ethToWei = (ethAmount) => {
    // Simple conversion without Web3 library
    return (parseFloat(ethAmount) * 1e18).toString(16)
}

// Ethereum (MetaMask) detection and connection
export const checkEthWallet = () => {
    return new Promise((resolve) => {
        if (typeof window.ethereum !== 'undefined') {
            resolve({
                hasWallet: true,
                walletName: 'MetaMask',
                isInstalled: true
            })
        } else {
            resolve({
                hasWallet: false,
                walletName: 'MetaMask',
                isInstalled: false
            })
        }
    })
}

// Connect to Ethereum wallet
export const connectEthWallet = async () => {
    try {
        if (!window.ethereum) {
            return { success: false, error: 'MetaMask not installed' }
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        })
        
        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        // Sepolia testnet chain ID
        const sepoliaChainId = '0xaa36a7'
        
        if (chainId !== sepoliaChainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: sepoliaChainId }]
                })
            } catch (switchError) {
                // Chain not added, try to add it
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: sepoliaChainId,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'Sepolia ETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/']
                        }]
                    })
                } catch (addError) {
                    console.log('Error adding network:', addError)
                }
            }
        }

        return {
            success: true,
            address: accounts[0],
            network: 'Sepolia'
        }
    } catch (error) {
        console.error('Error connecting wallet:', error)
        return { success: false, error: error.message }
    }
}

// Get ETH balance
export const getEthBalance = async (address) => {
    try {
        if (!window.ethereum) {
            return { success: false, error: 'MetaMask not installed' }
        }
        
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
        })
        
        // Convert from wei to ETH
        const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(6)
        
        return {
            success: true,
            balance: balanceInEth
        }
    } catch (error) {
        console.error('Error getting balance:', error)
        return { success: false, error: error.message }
    }
}

// Cardano wallet detection (Nami, Yoroi, Flint)
export const checkAdaWallet = () => {
    return new Promise((resolve) => {
        // Check for various Cardano wallets
        const wallets = {
            nami: window.cardano?.nami,
            yoroi: window.cardano?.yoroi,
            flint: window.cardano?.flint,
            gero: window.cardano?.gero,
            eternl: window.cardano?.eternl
        }

        const availableWallet = Object.entries(wallets).find(([_, wallet]) => wallet?.enable)

        if (availableWallet) {
            resolve({
                hasWallet: true,
                walletName: availableWallet[0].charAt(0).toUpperCase() + availableWallet[0].slice(1),
                walletApi: availableWallet[1],
                isInstalled: true
            })
        } else {
            resolve({
                hasWallet: false,
                walletName: 'Cardano Wallet',
                isInstalled: false
            })
        }
    })
}

// Connect to Cardano wallet
export const connectAdaWallet = async (walletApi) => {
    try {
        const api = await walletApi.enable()
        
        // Different wallets have different API structures
        let address
        
        // Try to get address based on wallet type
        if (api.getUsedAddresses) {
            // Nami, Yoroi, Flint style API
            const addresses = await api.getUsedAddresses()
            address = addresses[0]
        } else if (api.getAddress) {
            // Some wallets have getAddress
            address = await api.getAddress()
        } else if (api.cip30) {
            // CIP-30 standard
            const addresses = await api.getUsedAddresses()
            address = addresses[0]
        } else {
            // Fallback - try common methods
            try {
                const addresses = await api.getUsedAddresses()
                address = addresses[0]
            } catch {
                address = await api.getRewardAddresses()[0]
            }
        }
        
        return {
            success: true,
            address: address,
            network: 'Preprod',
            api: api // Store the API for later use
        }
    } catch (error) {
        console.error('Error connecting Cardano wallet:', error)
        return { success: false, error: error.message }
    }
}

// Get Cardano balance
export const getAdaBalance = async (walletApi, address) => {
    try {
        if (!walletApi) {
            return { success: false, error: 'Wallet API not available' }
        }
        
        // Get balance using CIP-30
        const balance = await walletApi.getBalance()
        
        // Parse Cardano amount (assuming ADA only)
        // Cardano uses lovelace where 1 ADA = 1,000,000 lovelace
        const totalLovelace = parseInt(balance, 16)
        const balanceInAda = (totalLovelace / 1e6).toFixed(6)
        
        return {
            success: true,
            balance: balanceInAda
        }
    } catch (error) {
        console.error('Error getting ADA balance:', error)
        return { success: false, error: error.message }
    }
}

// Main CryptoPayment component
function CryptoPayment({ orderData, onSuccess, onCancel }) {
    const [cryptoType, setCryptoType] = useState('eth') // 'eth' or 'ada'
    const [ethStatus, setEthStatus] = useState({ hasWallet: false, isInstalled: false, connected: false, address: null, balance: null })
    const [adaStatus, setAdaStatus] = useState({ hasWallet: false, isInstalled: false, connected: false, address: null, balance: null })
    const [paymentDetails, setPaymentDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [transactionHash, setTransactionHash] = useState('')
    
    const { serverUrl } = React.useContext(authDataContext)
    const { getCartAmount, delivery_fee } = React.useContext(shopDataContext)

    // Check wallet status on mount
    useEffect(() => {
        checkWalletStatus()
    }, [])

    const checkWalletStatus = async () => {
        // Check Ethereum
        const eth = await checkEthWallet()
        setEthStatus(prev => ({ ...prev, hasWallet: eth.hasWallet, isInstalled: eth.isInstalled }))

        // Check Cardano
        const ada = await checkAdaWallet()
        setAdaStatus(prev => ({ ...prev, hasWallet: ada.hasWallet, isInstalled: ada.isInstalled }))
    }

    const handleConnectEth = async () => {
        setLoading(true)
        const result = await connectEthWallet()
        
        if (result.success) {
            // Get balance after connecting
            const balanceResult = await getEthBalance(result.address)
            
            setEthStatus(prev => ({ 
                ...prev, 
                connected: true, 
                address: result.address,
                network: result.network,
                balance: balanceResult.success ? balanceResult.balance : '0'
            }))
            toast.success('Wallet connected!')
            await createEthOrder()
        } else {
            toast.error(result.error || 'Failed to connect wallet')
        }
        setLoading(false)
    }

    const handleConnectAda = async () => {
        setLoading(true)
        const ada = await checkAdaWallet()
        
        if (ada.hasWallet) {
            const result = await connectAdaWallet(ada.walletApi)
            
            if (result.success) {
                // Get balance after connecting
                const balanceResult = await getAdaBalance(result.api, result.address)
                
                setAdaStatus(prev => ({ 
                    ...prev, 
                    connected: true, 
                    address: result.address,
                    network: result.network,
                    walletApi: result.api, // Store the enabled API
                    balance: balanceResult.success ? balanceResult.balance : '0'
                }))
                toast.success('Wallet connected!')
                await createAdaOrder()
            } else {
                toast.error(result.error || 'Failed to connect wallet')
            }
        } else {
            toast.error('No Cardano wallet found. Please install Nami, Yoroi, or Flint wallet.')
        }
        setLoading(false)
    }

    const createEthOrder = async () => {
        setPaymentLoading(true)
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/order/crypto/eth/create`,
                orderData,
                { withCredentials: true }
            )
            
            if (data.orderId) {
                setPaymentDetails(data)
            }
        } catch (error) {
            console.error('Error creating ETH order:', error)
            toast.error('Failed to create payment order')
        }
        setPaymentLoading(false)
    }

    const createAdaOrder = async () => {
        setPaymentLoading(true)
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/order/crypto/ada/create`,
                orderData,
                { withCredentials: true }
            )
            
            if (data.orderId) {
                setPaymentDetails(data)
            }
        } catch (error) {
            console.error('Error creating ADA order:', error)
            toast.error('Failed to create payment order')
        }
        setPaymentLoading(false)
    }

    const handleSendEth = async () => {
        if (!window.ethereum) {
            toast.error('MetaMask not found')
            return
        }

        setPaymentLoading(true)
        
        try {
            console.log('Starting ETH transaction...')
            console.log('Amount:', paymentDetails.amount)
            console.log('To:', paymentDetails.walletAddress)
            
            const amountInWei = '0x' + ethToWei(paymentDetails.amount)
            
            const transactionParameters = {
                to: paymentDetails.walletAddress,
                from: ethStatus.address,
                value: amountInWei,
                chainId: '0xaa36a7' // Sepolia
            }

            console.log('Transaction params:', transactionParameters)

            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters]
            })

            console.log('Transaction hash received:', txHash)
            setTransactionHash(txHash)
            
            // Give user time to see the hash
            toast.info('Transaction submitted! Verifying...')
            
            // Verify payment
            await verifyEthPayment(txHash)
            
        } catch (error) {
            console.error('Transaction error:', error)
            console.error('Error code:', error.code)
            console.error('Error message:', error.message)
            toast.error(error.message || 'Transaction failed - ' + (error.code || 'unknown error'))
        }
        setPaymentLoading(false)
    }

    const handleSendAda = async () => {
        if (!adaStatus.walletApi) {
            toast.error('Cardano wallet not connected')
            return
        }

        setPaymentLoading(true)
        
        try {
            const api = adaStatus.walletApi
            
            // CIP-30 standard: get network ID first
            const networkId = await api.getNetworkId()
            console.log('Cardano Network ID:', networkId)
            
            // For testnet (Preprod = 0, Mainnet = 1)
            // We'll use a simpler approach - show payment details and let user copy
            // Then they'll enter the tx hash after making the transfer
            
            // For now, we'll use a demo approach
            // In production, use cardano-serialization-lib to build proper transactions
            
            // Show instructions to user
            toast.info('Please send ' + paymentDetails.amount + ' ADA to the address shown below')
            
            // For demo/testing, accept a manual tx hash input
            const txHash = prompt(
                'After sending ADA to: ' + paymentDetails.walletAddress.slice(0, 20) + '...\n' +
                'Please enter your transaction hash (tx):', 
                'demo_tx_' + Date.now()
            )
            
            if (!txHash) {
                toast.error('Transaction cancelled')
                setPaymentLoading(false)
                return
            }
            
            setTransactionHash(txHash)
            
            // Verify payment
            await verifyAdaPayment(txHash)
            
        } catch (error) {
            console.error('Transaction error:', error)
            toast.error(error.message || 'Transaction failed. Please try again.')
        }
        setPaymentLoading(false)
    }

    const verifyEthPayment = async (txHash) => {
        try {
            console.log('Verifying ETH payment:', { orderId: paymentDetails.orderId, txHash })
            
            const { data } = await axios.post(
                `${serverUrl}/api/order/crypto/eth/verify`,
                { 
                    orderId: paymentDetails.orderId, 
                    transactionHash: txHash 
                },
                { withCredentials: true }
            )
            
            console.log('Verification response:', data)
            
            if (data.message === 'Payment Successful') {
                toast.success('Payment confirmed!')
                // Auto redirect after 2 seconds
                setTimeout(() => {
                    onSuccess(data.orderId)
                }, 2000)
            } else {
                toast.error(data.message || 'Payment verification failed')
            }
        } catch (error) {
            console.error('Verification error:', error)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)
            console.error('Error message:', error.response?.data?.message)
            toast.error(error.response?.data?.message || 'Payment verification failed - please try again')
        }
    }

    const verifyAdaPayment = async (txHash) => {
        try {
            console.log('Verifying ADA payment:', { orderId: paymentDetails.orderId, txHash })
            
            const { data } = await axios.post(
                `${serverUrl}/api/order/crypto/ada/verify`,
                { 
                    orderId: paymentDetails.orderId, 
                    transactionHash: txHash 
                },
                { withCredentials: true }
            )
            
            console.log('Verification response:', data)
            
            if (data.message === 'Payment Successful') {
                toast.success('Payment confirmed!')
                // Auto redirect after 2 seconds
                setTimeout(() => {
                    onSuccess(data.orderId)
                }, 2000)
            } else {
                toast.error(data.message || 'Payment verification failed')
            }
        } catch (error) {
            console.error('Verification error:', error)
            console.error('Error response:', error.response?.data)
            toast.error(error.response?.data?.message || 'Payment verification failed')
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Address copied!')
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Crypto Payment</h2>
                <p className="text-gray-500 text-sm">Pay with Cryptocurrency (Testnet)</p>
            </div>

            {/* Crypto Selection */}
            {!paymentDetails && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-3">Select your preferred cryptocurrency:</p>
                    
                    {/* Ethereum Option */}
                    <div 
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${cryptoType === 'eth' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCryptoType('eth')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Ξ</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Ethereum</h3>
                                    <p className="text-xs text-gray-500">Sepolia Testnet</p>
                                </div>
                            </div>
                            {ethStatus.hasWallet && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {ethStatus.connected ? 'Connected' : 'Available'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Cardano Option */}
                    <div 
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${cryptoType === 'ada' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCryptoType('ada')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">₳</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Cardano</h3>
                                    <p className="text-xs text-gray-500">Preprod Testnet</p>
                                </div>
                            </div>
                            {adaStatus.hasWallet && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {adaStatus.connected ? 'Connected' : 'Available'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Connect Button */}
                    {cryptoType === 'eth' ? (
                        ethStatus.connected ? (
                            <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-green-700 font-semibold">✓ MetaMask Connected</span>
                                        <span className="text-sm text-green-600">Sepolia</span>
                                    </div>
                                    <div className="text-xs text-gray-600 mb-1">Address:</div>
                                    <p className="text-xs font-mono text-gray-800 bg-white p-2 rounded border break-all">{ethStatus.address}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Balance:</span>
                                        <span className="text-lg font-bold text-gray-800">{ethStatus.balance} ETH</span>
                                    </div>
                                </div>
                                <button 
                                    className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
                                    disabled
                                >
                                    ✓ Wallet Connected
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleConnectEth}
                                disabled={loading || paymentLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Connecting...' : ethStatus.isInstalled ? 'Connect MetaMask' : 'Install MetaMask'}
                            </button>
                        )
                    ) : (
                        adaStatus.connected ? (
                            <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-green-700 font-semibold">✓ Wallet Connected</span>
                                        <span className="text-sm text-green-600">Preprod</span>
                                    </div>
                                    <div className="text-xs text-gray-600 mb-1">Address:</div>
                                    <p className="text-xs font-mono text-gray-800 bg-white p-2 rounded border break-all">{adaStatus.address?.slice(0, 20)}...</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Balance:</span>
                                        <span className="text-lg font-bold text-gray-800">{adaStatus.balance} ADA</span>
                                    </div>
                                </div>
                                <button 
                                    className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
                                    disabled
                                >
                                    ✓ Wallet Connected
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleConnectAda}
                                disabled={loading || paymentLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Connecting...' : adaStatus.isInstalled ? 'Connect Wallet' : 'Install Wallet'}
                            </button>
                        )
                    )}
                </div>
            )}

            {/* Payment Details */}
            {paymentDetails && !transactionHash && (
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Amount to pay:</span>
                            <span className="text-2xl font-bold text-gray-800">
                                {paymentDetails.amount} {paymentDetails.currency}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Network:</span>
                            <span className="text-gray-700">{paymentDetails.network}</span>
                        </div>
                    </div>

                    {/* Wallet Address */}
                    <div>
                        <label className="text-sm text-gray-600 block mb-2">Send to this address:</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={paymentDetails.walletAddress}
                                readOnly
                                className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                            />
                            <button 
                                onClick={() => copyToClipboard(paymentDetails.walletAddress)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="flex justify-center">
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                            <div className="w-40 h-40 bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">QR Code</span>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">📋 Instructions</h4>
                        <ol className="text-sm text-blue-700 space-y-1">
                            <li>1. Copy the wallet address above</li>
                            <li>2. Open your wallet (MetaMask/Yoroi)</li>
                            <li>3. Send exactly {paymentDetails.amount} {paymentDetails.currency}</li>
                            <li>4. Wait for confirmation (1-2 minutes)</li>
                            <li>5. Click "I've Sent Payment" below</li>
                        </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button 
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                // For testnet demo, allow manual confirmation
                                // In production, this should verify on-chain
                                toast.info('Confirming payment...')
                                if (cryptoType === 'eth') {
                                    // Use a demo tx hash for testing
                                    const demoTxHash = '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
                                    setTransactionHash(demoTxHash)
                                    verifyEthPayment(demoTxHash)
                                } else {
                                    const demoTxHash = 'abc' + Math.random().toString(36).slice(2)
                                    setTransactionHash(demoTxHash)
                                    verifyAdaPayment(demoTxHash)
                                }
                            }}
                            disabled={paymentLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {paymentLoading ? 'Processing...' : `I've Sent ${paymentDetails.amount} ${paymentDetails.currency}`}
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction Submitted */}
            {transactionHash && (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">✓</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Payment Submitted!</h3>
                    <p className="text-gray-600">Your transaction is being confirmed on the blockchain.</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
                        <p className="text-xs font-mono text-gray-700 break-all">{transactionHash}</p>
                    </div>
                    
                    <p className="text-sm text-gray-500 animate-pulse">
                        Redirecting to orders page in 2 seconds...
                    </p>
                </div>
            )}
        </div>
    )
}

export default CryptoPayment
