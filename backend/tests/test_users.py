from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_delete_account_missing_auth_header():
    """Request without Authorization header should return 401."""
    response = client.post("/api/users/delete-account")
    assert response.status_code == 401
    assert "Missing or invalid authorization header" in response.json()["detail"]


def test_delete_account_invalid_auth_format():
    """Request with improper authorization format should return 401."""
    response = client.post(
        "/api/users/delete-account",
        headers={"Authorization": "Basic somecreds"}
    )
    assert response.status_code == 401
    assert "Missing or invalid authorization header" in response.json()["detail"]


def test_delete_account_invalid_token():
    """Request with invalid or expired token should return 401."""
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.side_effect = Exception("Token expired")

    with patch("routers.users.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/users/delete-account",
            headers={"Authorization": "Bearer invalid_token_123"}
        )
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]


def test_delete_account_successful():
    """Valid authenticated request should successfully invoke admin delete_user and return 200."""
    user_id = "test-user-uuid-12345"
    mock_user_obj = MagicMock()
    mock_user_obj.user.id = user_id

    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value = mock_user_obj
    mock_supabase.auth.admin.delete_user.return_value = None

    with patch("routers.users.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/users/delete-account",
            headers={"Authorization": "Bearer valid_jwt_token"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "deleted"
        assert "purged successfully" in data["message"]
        mock_supabase.auth.admin.delete_user.assert_called_once_with(user_id)


def test_delete_account_admin_api_failure():
    """If Supabase admin deletion fails, an internal server error (500) should be raised."""
    user_id = "test-user-uuid-12345"
    mock_user_obj = MagicMock()
    mock_user_obj.user.id = user_id

    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value = mock_user_obj
    mock_supabase.auth.admin.delete_user.side_effect = Exception("Supabase admin network error")

    with patch("routers.users.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/users/delete-account",
            headers={"Authorization": "Bearer valid_jwt_token"}
        )
        assert response.status_code == 500
        assert "Failed to delete account" in response.json()["detail"]
