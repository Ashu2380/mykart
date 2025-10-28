import React, { useState, useEffect } from 'react';
import { FaCalculator, FaRupeeSign, FaCalendarAlt, FaPercentage, FaArrowDown, FaClock } from 'react-icons/fa';
import { MdAccountBalance, MdTrendingUp } from 'react-icons/md';
import Title from '../component/Title';

function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(5);
  const [tenureType, setTenureType] = useState('years'); // years or months
  const [emiResult, setEmiResult] = useState(null);

  // Calculate EMI
  const calculateEMI = () => {
    const principal = loanAmount - downPayment;
    if (principal <= 0) {
      setEmiResult({
        emi: 0,
        totalAmount: 0,
        totalInterest: 0,
        error: "Principal amount must be greater than 0"
      });
      return;
    }

    const monthlyRate = interestRate / (12 * 100);
    const tenureInMonths = tenureType === 'years' ? loanTenure * 12 : loanTenure;

    if (monthlyRate === 0) {
      const emi = principal / tenureInMonths;
      setEmiResult({
        emi: emi,
        totalAmount: principal,
        totalInterest: 0,
        principal: principal,
        tenureInMonths: tenureInMonths,
        error: null
      });
      return;
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths)) / 
                (Math.pow(1 + monthlyRate, tenureInMonths) - 1);
    
    const totalAmount = emi * tenureInMonths;
    const totalInterest = totalAmount - principal;

    setEmiResult({
      emi: emi,
      totalAmount: totalAmount,
      totalInterest: totalInterest,
      principal: principal,
      tenureInMonths: tenureInMonths,
      error: null
    });
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateEMI();
  }, [loanAmount, downPayment, interestRate, loanTenure, tenureType]);

  // Generate amortization schedule (first 12 months)
  const generateAmortizationSchedule = () => {
    if (!emiResult || emiResult.error || emiResult.emi === 0) return [];
    
    const schedule = [];
    let remainingPrincipal = emiResult.principal;
    const monthlyRate = interestRate / (12 * 100);
    
    for (let month = 1; month <= Math.min(12, emiResult.tenureInMonths); month++) {
      const interestAmount = remainingPrincipal * monthlyRate;
      const principalAmount = emiResult.emi - interestAmount;
      remainingPrincipal -= principalAmount;
      
      schedule.push({
        month,
        emi: emiResult.emi,
        principal: principalAmount,
        interest: interestAmount,
        balance: remainingPrincipal
      });
    }
    
    return schedule;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const amortizationSchedule = generateAmortizationSchedule();

  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] pt-24 md:pt-20 lg:pt-24 px-4 md:px-6 lg:px-8 pb-20'>
      <div className='max-w-7xl mx-auto'>
        <Title text1={'EMI'} text2={'CALCULATOR'} />
        
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Input Section */}
          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
            <h2 className='text-2xl font-semibold text-white mb-6 flex items-center gap-2'>
              <FaCalculator className='text-blue-400' />
              Loan Details
            </h2>
            
            <div className='space-y-6'>
              {/* Loan Amount */}
              <div>
                <label className='flex items-center gap-2 text-white mb-2 font-medium'>
                  <FaRupeeSign className='text-green-400' />
                  Total Loan Amount
                </label>
                <input
                  type='number'
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter loan amount'
                  min='0'
                />
                <input
                  type='range'
                  min='100000'
                  max='10000000'
                  step='50000'
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className='w-full mt-2 accent-blue-500'
                />
                <div className='flex justify-between text-xs text-gray-400 mt-1'>
                  <span>₹1L</span>
                  <span>{formatCurrency(loanAmount)}</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <label className='flex items-center gap-2 text-white mb-2 font-medium'>
                  <FaArrowDown className='text-orange-400' />
                  Down Payment
                </label>
                <input
                  type='number'
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter down payment'
                  min='0'
                  max={loanAmount}
                />
                <input
                  type='range'
                  min='0'
                  max={loanAmount}
                  step='10000'
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className='w-full mt-2 accent-orange-500'
                />
                <div className='flex justify-between text-xs text-gray-400 mt-1'>
                  <span>₹0</span>
                  <span>{formatCurrency(downPayment)}</span>
                  <span>{formatCurrency(loanAmount)}</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className='flex items-center gap-2 text-white mb-2 font-medium'>
                  <FaPercentage className='text-purple-400' />
                  Rate of Interest (% per annum)
                </label>
                <input
                  type='number'
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                  placeholder='Enter interest rate'
                  min='0'
                  step='0.1'
                />
                <input
                  type='range'
                  min='5'
                  max='20'
                  step='0.1'
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className='w-full mt-2 accent-purple-500'
                />
                <div className='flex justify-between text-xs text-gray-400 mt-1'>
                  <span>5%</span>
                  <span>{interestRate}%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div>
                <label className='flex items-center gap-2 text-white mb-2 font-medium'>
                  <FaClock className='text-yellow-400' />
                  Loan Tenure
                </label>
                <div className='flex gap-2'>
                  <input
                    type='number'
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className='flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    placeholder='Enter tenure'
                    min='1'
                  />
                  <select
                    value={tenureType}
                    onChange={(e) => setTenureType(e.target.value)}
                    className='p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                  >
                    <option value='years' className='text-black'>Years</option>
                    <option value='months' className='text-black'>Months</option>
                  </select>
                </div>
                <input
                  type='range'
                  min='1'
                  max={tenureType === 'years' ? '30' : '360'}
                  step='1'
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  className='w-full mt-2 accent-yellow-500'
                />
                <div className='flex justify-between text-xs text-gray-400 mt-1'>
                  <span>1 {tenureType === 'years' ? 'Year' : 'Month'}</span>
                  <span>{loanTenure} {tenureType === 'years' ? 'Years' : 'Months'}</span>
                  <span>{tenureType === 'years' ? '30 Years' : '360 Months'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className='space-y-6'>
            {/* EMI Result */}
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <h2 className='text-2xl font-semibold text-white mb-6 flex items-center gap-2'>
                <MdAccountBalance className='text-green-400' />
                EMI Breakdown
              </h2>
              
              {emiResult && !emiResult.error ? (
                <div className='space-y-4'>
                  <div className='bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/30'>
                    <div className='text-center'>
                      <p className='text-gray-300 text-sm mb-1'>Monthly EMI</p>
                      <p className='text-3xl font-bold text-green-400'>{formatCurrency(emiResult.emi)}</p>
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-white/5 rounded-lg p-4 text-center'>
                      <p className='text-gray-300 text-sm mb-1'>Principal Amount</p>
                      <p className='text-lg font-semibold text-blue-400'>{formatCurrency(emiResult.principal)}</p>
                    </div>
                    <div className='bg-white/5 rounded-lg p-4 text-center'>
                      <p className='text-gray-300 text-sm mb-1'>Total Interest</p>
                      <p className='text-lg font-semibold text-orange-400'>{formatCurrency(emiResult.totalInterest)}</p>
                    </div>
                  </div>
                  
                  <div className='bg-white/5 rounded-lg p-4 text-center'>
                    <p className='text-gray-300 text-sm mb-1'>Total Amount Payable</p>
                    <p className='text-xl font-semibold text-white'>{formatCurrency(emiResult.totalAmount)}</p>
                  </div>
                  
                  <div className='bg-white/5 rounded-lg p-4'>
                    <p className='text-gray-300 text-sm mb-2'>Loan Breakdown</p>
                    <div className='flex rounded-full overflow-hidden h-3 bg-gray-700'>
                      <div 
                        className='bg-blue-500' 
                        style={{ width: `${(emiResult.principal / emiResult.totalAmount) * 100}%` }}
                      ></div>
                      <div 
                        className='bg-orange-500' 
                        style={{ width: `${(emiResult.totalInterest / emiResult.totalAmount) * 100}%` }}
                      ></div>
                    </div>
                    <div className='flex justify-between text-xs text-gray-400 mt-2'>
                      <span>Principal: {((emiResult.principal / emiResult.totalAmount) * 100).toFixed(1)}%</span>
                      <span>Interest: {((emiResult.totalInterest / emiResult.totalAmount) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-red-400'>{emiResult?.error || 'Please enter valid loan details'}</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <MdTrendingUp className='text-yellow-400' />
                EMI Tips
              </h3>
              <div className='space-y-3 text-sm text-gray-300'>
                <div className='flex items-start gap-2'>
                  <span className='text-green-400 mt-1'>•</span>
                  <span>Higher down payment reduces your EMI and total interest paid</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-blue-400 mt-1'>•</span>
                  <span>Longer tenure means lower EMI but higher total interest</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-purple-400 mt-1'>•</span>
                  <span>Compare rates from different banks before finalizing</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-orange-400 mt-1'>•</span>
                  <span>EMI should not exceed 40% of your monthly income</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Schedule */}
        {amortizationSchedule.length > 0 && (
          <div className='mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-600'>
            <h3 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
              <FaCalendarAlt className='text-blue-400' />
              Payment Schedule (First 12 Months)
            </h3>
            
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-600'>
                    <th className='text-left py-2 px-3 text-gray-300'>Month</th>
                    <th className='text-right py-2 px-3 text-gray-300'>EMI</th>
                    <th className='text-right py-2 px-3 text-gray-300'>Principal</th>
                    <th className='text-right py-2 px-3 text-gray-300'>Interest</th>
                    <th className='text-right py-2 px-3 text-gray-300'>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((row) => (
                    <tr key={row.month} className='border-b border-gray-700 hover:bg-white/5'>
                      <td className='py-2 px-3 text-white'>{row.month}</td>
                      <td className='py-2 px-3 text-right text-green-400'>{formatCurrency(row.emi)}</td>
                      <td className='py-2 px-3 text-right text-blue-400'>{formatCurrency(row.principal)}</td>
                      <td className='py-2 px-3 text-right text-orange-400'>{formatCurrency(row.interest)}</td>
                      <td className='py-2 px-3 text-right text-gray-300'>{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {emiResult.tenureInMonths > 12 && (
              <p className='text-xs text-gray-400 mt-3 text-center'>
                Showing first 12 months of {emiResult.tenureInMonths} months tenure
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmiCalculator;

