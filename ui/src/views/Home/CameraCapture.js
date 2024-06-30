import React, { useRef, useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import Button from '../../components/Button/Button';

const CameraCapture = () => {
  const videoRef = useRef();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera", err);
    }
  };

  const handleTakePhoto = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error('O blob não foi gerado.');
      }

      const worker = await createWorker();

      try {
        const result = await worker.recognize(canvas, 'por');
        setRecognizedText(result.data.text);
        console.log(result.data.text);
      } catch (error) {
        console.error('Erro ao processar a imagem:', error);
      }
    }, 'image/png', 1);
  };

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    }
  }, [isCameraOn]);

  return (
    <div className="w-full flex flex-col items-center space-y-2">
      <Button
        className="bg-blue-500 text-white px-3 py-1 rounded-md text-base hover:bg-blue-700 w-full"
        onClick={() => setIsCameraOn(!isCameraOn)}
      >
        {isCameraOn ? 'Parar Câmera' : 'Iniciar Câmera'}
      </Button>
      {isCameraOn && (
        <>
          <video ref={videoRef} autoPlay onClick={handleTakePhoto} className="w-full h-auto mt-2"></video>
          <p className="mt-2 text-sm">{recognizedText}</p>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
