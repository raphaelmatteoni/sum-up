import React from 'react';

const Input = ({ placeholder, value, onChange, type = "text", className = "",...props }) => {
  return (
    <input
      className={`shadow appearance-none border border-gray-300 text-gray-600 placeholder-gray-400 rounded w-full py-2 px-3 bg-white focus:outline-none focus:ring-0 focus:border-blue-500 leading-6 transition-colors duration-200 ease-in-out ${className}`}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default Input;
