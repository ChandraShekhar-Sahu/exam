import axios from 'axios';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function base64ToBlob(base64, mimeType) {
  const byteString = atob(base64.split(',')[1]); // Decode base64
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([uint8Array], { type: mimeType });
}





// Function to send the captured image to the Django backend for face verification
export const checkFaceMatch = async (capturedImage) => {
  try {

    // Convert the base64 string to a Blob
    const blob = base64ToBlob(capturedImage, 'image/jpeg');

    // If needed, create a File object from the Blob for more specificity
    const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });

    // Convert the captured image to a FormData object
    const formData = new FormData();
    console.log("API: ",capturedImage);
    formData.append('image', file);  // Append image directly

    // Send the image to the Django backend (update URL to your Django API endpoint)
    const response = await axios.post('http://127.0.0.1:8000/api/verify_face/', formData, {
      headers: {
        'X-CSRFToken': csrftoken,  // Ensure CSRF token is included
        // 'Content-Type' is automatically set to 'multipart/form-data' by axios, so we don't need to manually set it
      },
    });

    // Return the response from the backend (whether face match is successful)
    if (response.data.match) {
      return { match: true };
    } else {
      return { match: false };
    }
  } catch (error) {
    console.error('Error verifying face:', error);
    throw new Error('Failed to verify face');
  }
};
