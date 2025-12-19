import React from 'react';

function OtpModal({ isOpen, onClose, onSubmit }) {
  const [otp, setOtp] = React.useState('');

  const handleSubmit = () => {
    onSubmit(otp);
    setOtp(''); 
  };

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpModal;
