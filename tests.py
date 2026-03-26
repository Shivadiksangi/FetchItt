import json

from django.test import TestCase

from .models import UserProfile


class AuthViewsTests(TestCase):
    def test_register_and_login_with_json_payloads(self):
        register_response = self.client.post(
            "/api/auth/register",
            data=json.dumps(
                {
                    "name": "Test User",
                    "email": "test@example.com",
                    "password": "secret123",
                    "role": "buyer",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(register_response.status_code, 201)
        self.assertEqual(register_response.json()["user"]["email"], "test@example.com")
        self.assertTrue(
            UserProfile.objects.filter(user__username="test@example.com", role="buyer").exists()
        )

        login_response = self.client.post(
            "/api/auth/login",
            data=json.dumps(
                {
                    "email": "test@example.com",
                    "password": "secret123",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()["message"], "Login successful")
