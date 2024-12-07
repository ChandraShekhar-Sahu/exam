import json
import logging
import base64
from io import BytesIO
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import credentials, storage
from PIL import Image
import face_recognition

# Firebase credentials
credentia = {
  "type": "service_account",
  "project_id": "collegemngmnt",
  "private_key_id": "99e0f6bdee6849eb01392a4a052c4a7f4457f308",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDAyMF+1+qbGN6p\naXqq0CluBDrE+hLocjHxwQWPmE0C1cZiduTZgFxRNQ6kREU3LYstkkatLKrElH7d\nIKmv/738vN3AhTNRa7lacYOuC1uf/9zfvzqKfDm6057FNexxmW8rNA92y85ruroW\nmw8hl99ETqstQF0NsWyjdshp5t8GOSx1RT6YM4c0n+FARhMRTcJ9uzFdpky1TyUy\nQ2rfgSXgqJ1XOJe5epqEfOexsI6RP9Lb9UeybmJuM6IjKhZG4Eil0/82syTyteBA\nRIC2+3sTmufUEXiDyE/SjtG0oQXaFlFFycEG9tCOGM63obf0qw18liCWDGUzQ0e5\nyVX+RJCTAgMBAAECggEAV01yps0Dvrnr958/QERlRp+et54h2ub/7CGDsawAUATc\nQrHh4AdrhxD2cPhDugGjcf84h2rfaIdwzhXhEkVH1cD30RvhCgG1HhqizbnyA8p8\nTU0NpzIreIol79wEF8uqls+MIzmXYJzecadFmmpq3sWbajIoEa/j6UC88IxvOiL3\n4pUkNNkmkqjZDCDlniAHWCgOheV8hIfT5AJzEO4OyoH95adbuOHHamVVanB1+x23\nuxu7zSNHzsPYkg3RQSINuWDMZXrPoc0UKESY3p0jw80i8esgbmxgN+LJkIX9FJp9\n3MuafC8TvbgDq2SAT99K9E3RS5xc4IqkJDOEmSnUfQKBgQDf3FK7QOBLhmY9GMBI\n7xB+RPSYzPIQXyZU3KOKnf/yxabuWoG4n5+oHjb+UkCeyxxSKEpdZIorFUyEhVDq\nfLZMJ4aZwS//OZAinTuD7s6KgxH9I8ph92CoYv3/XDcysi+ZNlNViZe5RQM1tUuy\n1Blpg1rp4qHbuy2rKXgq+dOm9wKBgQDcdkNKec23KP8YqJlinZuxblwjse9MDpAC\nSI20hRqSlWdi9DumKh1lst4oex02Oodhwz7/vYwNejW7frbtqtUhqZPgCZkHrKR+\nF5R9qX92qU8ULZaGLJU1uFC/9g67QMgbPcq5y9xzMMdvq8DbagDmy+0of8bPsTv8\nbpNzQJfwRQKBgAQlkqrBUuZTQQWUtcskEowkPtutwDYpbQ5ZX/YrYxheLO9xYcHH\nwy9cD+y6HVRTstyavnXobN7LcDVsOsl9MetLOCUU/QyfRlo9y2JwRAcw0l58ET2r\nVXEJFGdsj+Eyh8swxG5rNBJMgvi1uQdBAo9/zWlTt2fYmcn35K/3HMKVAoGAYyl2\nnvsmgqoYA9liFK9bpnVDUHLqdcVfFQfZZUcxapl1BVdhtR3gVywbLQ4jV47/8gNG\nRPXXFwDPRmR6l3BtqVSDRRRMFt2ap3Snv9YLlS4Webb/q55GBwG+oHlmquc6mrYy\nh1ug7tcT/bC9cHO/sBAtvjerDyRjHOoHvKFjNhkCgYBqW0a7ODjEpYKWqx2KfudA\nzQzUq4qtGJlFCuWKZJD2tkfqdLSsIDxUBHvrXTxgKMYqOwDI1vk77CWpOwrnhper\nbUxTO6vRMvwK47MC8O0yPsqV5WFYR+bACrQ0M0J+FxFFDH/bgUnonziJB4BYOagE\nsIJ/Haj2Mal57b1W9DsfBQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-i46ib@collegemngmnt.iam.gserviceaccount.com",
  "client_id": "111131020229539873570",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-i46ib%40collegemngmnt.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

# Initialize Firebase admin SDK if not already initialized
cred = credentials.Certificate(credentia)
firebase_admin.initialize_app(cred, {
    'storageBucket': 'collegemngmnt.appspot.com'
})

# Configure logging for better debugging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

def fix_base64_padding(base64_string):
    """Fix Base64 padding if it's incorrect."""
    missing_padding = len(base64_string) % 4
    if missing_padding:
        base64_string += '=' * (4 - missing_padding)
    return base64_string


@csrf_exempt
def verify_face(request):
    if request.method == 'POST':
        try:
            logger.info("Request method: %s", request.method)
            logger.info("Request headers: %s", request.headers)

            # Check if image is in request
            if 'image' not in request.FILES:
                logger.error("No image provided")
                return JsonResponse({'error': 'No image provided'}, status=400)

            image_file = request.FILES['image']
            logger.debug(f"Uploaded image name: {image_file.name}")
            
            # Convert the uploaded image to a PIL image
            image = Image.open(image_file)
            image = image.convert('RGB')  # Ensure image is in RGB format if not
            
            # Resize image to avoid memory issues (max size of 800x800)
            image.thumbnail((800, 800))

            # Fetch stored image from Firebase Storage
            bucket = storage.bucket()
            blob = bucket.blob('profileImages/b2OcTcWAkubNYoyEBr2ZHuiOxCc2')  # Replace with dynamic path as needed

            # Download image as bytes
            stored_image_bytes = blob.download_as_bytes()
            logger.info("Stored image downloaded successfully from Firebase.")
            logger.debug(f"Stored image bytes length: {len(stored_image_bytes)}")

            # Check if the downloaded data is non-empty
            if not stored_image_bytes:
                logger.error("Downloaded image is empty.")
                return JsonResponse({'error': 'Failed to download image from Firebase'}, status=500)

            # Attempt to open and verify the stored image
            try:
                stored_image = Image.open(BytesIO(stored_image_bytes))
                stored_image.verify()  # Verify if it is a valid image
                logger.debug("Stored image verified successfully.")
                # stored_image = stored_image.convert('RGB')  # Convert to RGB for face recognition compatibility
                # stored_image.thumbnail((800, 800))  # Resize the stored image
                logger.debug("block 1")
            except (IOError, SyntaxError) as e:
                logger.error(f"Invalid image file: {str(e)}")
                return JsonResponse({'error': 'Invalid image file'}, status=400)

            # Load both images for face recognition
            try:
                stored_image_data = face_recognition.load_image_file(BytesIO(stored_image_bytes))
                captured_face_encoding = face_recognition.face_encodings(face_recognition.load_image_file(image))[0]
                stored_face_encoding = face_recognition.face_encodings(stored_image_data)[0]
                logger.debug("Captured face encoding: %s", captured_face_encoding)
                logger.debug("Stored face encoding: %s", stored_face_encoding)
            except IndexError as e:
                logger.error(f"Face encoding failed: {str(e)}")
                return JsonResponse({'error': 'No face detected in the image'}, status=400)

            match = face_recognition.compare_faces([stored_face_encoding], captured_face_encoding)
            logger.info("Face comparison processed.")

            if match[0]:
                return JsonResponse({'match': True})
            else:
                return JsonResponse({'match': False})

        except Exception as e:
            logger.error(f"Error in face verification process: {str(e)}")
            return JsonResponse({'error': 'Internal server error'}, status=500)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)