import React from 'react';

const Button = ({ className, onClick, children, ...props }) => {
  return (
    <button
      className={`mt-6 rounded-md bg-blue-500 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
