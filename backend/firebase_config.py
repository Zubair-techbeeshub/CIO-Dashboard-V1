import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK using service account JSON file.
    This should be called once at application startup.
    """
    try:
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # Try to use service account JSON file first (more reliable)
            service_account_path = os.path.join(os.path.dirname(__file__), 'service-account.json')
            
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized successfully (using service-account.json)")
            else:
                # Try to find any firebase-adminsdk JSON file
                backend_dir = os.path.dirname(__file__)
                for filename in os.listdir(backend_dir):
                    if filename.endswith('.json') and 'firebase-adminsdk' in filename:
                        service_account_path = os.path.join(backend_dir, filename)
                        cred = credentials.Certificate(service_account_path)
                        firebase_admin.initialize_app(cred)
                        print(f"Firebase Admin SDK initialized successfully (using {filename})")
                        return
                
                # Fallback to environment variables
                project_id = os.getenv("FIREBASE_PROJECT_ID")
                client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
                private_key = os.getenv("FIREBASE_PRIVATE_KEY")

                if not all([project_id, client_email, private_key]):
                    raise ValueError(
                        "Missing Firebase Admin credentials. "
                        "Please either place a firebase-adminsdk JSON file in the backend directory "
                        "or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
                    )

                # Handle escaped newlines in private key
                private_key = private_key.replace("\\n", "\n")

                # Create credentials dictionary
                cred_dict = {
                    "type": "service_account",
                    "project_id": project_id,
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
                    "private_key": private_key,
                    "client_email": client_email,
                    "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/compute@developer.gserviceaccount.com"
                }

                # Initialize Firebase with credentials
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized successfully (using environment variables)")
        else:
            print("Firebase Admin SDK already initialized")
            
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        raise

# Get Firebase Auth instance
def get_firebase_auth():
    """
    Get Firebase Auth instance for token verification.
    """
    try:
        initialize_firebase()
        return auth
    except Exception as e:
        print(f"Error getting Firebase Auth instance: {e}")
        raise