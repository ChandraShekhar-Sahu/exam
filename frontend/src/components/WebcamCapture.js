import React from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ setCapturedImage }) => {
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log("THis is the captured image",JSON.stringify(imageSrc));
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        console.error('Failed to capture image');
      }
    }
  }, [webcamRef, setCapturedImage]);

  return (
    <div className="webcam-container">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="webcam"
      />
      <button 
        onClick={capture} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Capture Photo
      </button>
    </div>
  );
};

export default WebcamCapture;
