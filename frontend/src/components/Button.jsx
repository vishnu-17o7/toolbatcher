import React from 'react'

const Button = ({ text = 'Get Started', className = '' }) => {
  return (
    <button type='button' className={`focus-ring py-4 px-6 bg-blue-gradient font-poppins font-medium text-[18px] text-primary rounded-[10px] ${className}`}>
      {text}
    </button>
  )
}

export default Button
