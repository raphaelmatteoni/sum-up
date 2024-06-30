import React, { useContext } from 'react';
import CameraCapture from './CameraCapture';
import SendText from './SendText';
import { useNavigate } from 'react-router-dom';


function Home() {
  let navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/bill-details');
  };

  return (
    <div className="m-2 w-full">
      <div>
        <CameraCapture />
      </div>
      <span className="text-sm">ou</span>
      <div className="flex flex-col items-center w-full">
        <label htmlFor="send-text" className="text-base m-2">Colar texto abaixo:</label>
        <SendText onSubmit={handleNavigation} />
      </div>
    </div>
  );
}

export default Home;
