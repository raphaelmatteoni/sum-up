import React from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal flex items-center justify-center fixed z-40 inset-0 h-full p-10">
      <button type="button" className="modal-backdrop cursor-default w-full h-full fixed inset-0 bg-gray-700 bg-opacity-25" tabIndex="-1" onClick={onClose}></button>
      <div className="modal-window w-10/12 overflow-hidden relative bg-slate-200 shadow-lg rounded-xl border border-gray-400 p-10">
        <h3 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">{title}</h3>
        <button className="absolute top-0 right-0 mt-4 mr-4 text-gray-800 hover:text-gray-700 focus:outline-none hover:text-red-500" onClick={onClose}>X</button>
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
