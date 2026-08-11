from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_config import get_firebase_auth
import firebase_admin

# Initialize Firebase Auth
auth = get_firebase_auth()

# Security scheme for Bearer token
security = HTTPBearer()

async def get_current_firebase_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Firebase ID token and return the decoded user information.
    
    This dependency should be used to protect API endpoints.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        
    Returns:
        dict: Decoded Firebase user information
        
    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    try:
        token = credentials.credentials
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        
        # Return the decoded user information
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "firebase": decoded_token
        }
        
    except firebase_admin.auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_admin.auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_admin.auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Optional: Make authentication optional for testing
async def get_optional_firebase_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    """
    Optional Firebase authentication - returns None if no token provided.
    Useful for endpoints that work with or without authentication.
    """
    try:
        token = credentials.credentials
        if not token:
            return None
        
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "firebase": decoded_token
        }
    except Exception:
        return None