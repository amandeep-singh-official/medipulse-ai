from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_missing_auth():
    """Missing auth should return 401."""
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hello"}]})
    assert response.status_code == 401

def test_chat_too_short():
    """Message too short should return 400."""
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value.user.id = "test-123"
    with patch("routers.reports.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "a"}]},
            headers={"Authorization": "Bearer valid_token"}
        )
        assert response.status_code == 400
        assert "too short" in response.json()["detail"]

def test_chat_too_long():
    """Last message over 1000 characters should return 400."""
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value.user.id = "test-123"
    with patch("routers.reports.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "a" * 1001}]},
            headers={"Authorization": "Bearer valid_token"}
        )
        assert response.status_code == 400
        assert "exceeds 1000 character limit" in response.json()["detail"]

@patch("routers.chat.get_latest_biomarkers")
@patch("routers.chat.stream_chat_response")
def test_chat_success(mock_stream, mock_get_biomarkers):
    """Valid request should stream properly."""
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value.user.id = "test-123"
    
    mock_get_biomarkers.return_value = [{"name": "Hemoglobin", "value": 15.0}]
    
    def fake_stream(*args, **kwargs):
        yield "Hello"
        yield " World"
        
    mock_stream.side_effect = fake_stream
    
    with patch("routers.reports.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "What is my hemoglobin?"}]},
            headers={"Authorization": "Bearer valid_token"}
        )
        assert response.status_code == 200
        assert response.text == "Hello World"
