from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password
from ..models import Users
 
 
class LoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/login/"
        self.raw_password = "Secret@1"
        # Create a user directly so login tests are independent of register
        self.user = Users.objects.create(
            fullName="John Doe",
            email="jdoe@university.edu",
            password=make_password(self.raw_password),
            roleType="student"
        )
 
    # ── Happy paths ──────────────────────────────────────────────────────────
 
    def test_login_success_returns_200(self):
        """Correct credentials should return 200."""
        response = self.client.post(
            self.url,
            {"email": "jdoe@university.edu", "password": self.raw_password},
            format="json"
        )
        self.assertEqual(response.status_code, 200)
 
    def test_login_response_contains_expected_fields(self):
        """Response must include message, role, fullName, and userID."""
        response = self.client.post(
            self.url,
            {"email": "jdoe@university.edu", "password": self.raw_password},
            format="json"
        )
        self.assertEqual(response.data["message"], "Login successful")
        self.assertIn("role", response.data)
        self.assertIn("fullName", response.data)
        self.assertIn("userID", response.data)
 
    def test_login_returns_correct_role(self):
        """Returned role must match what was stored at registration."""
        response = self.client.post(
            self.url,
            {"email": "jdoe@university.edu", "password": self.raw_password},
            format="json"
        )
        self.assertEqual(response.data["role"], "student")
 
    def test_login_returns_correct_full_name(self):
        """Returned fullName must match the stored value."""
        response = self.client.post(
            self.url,
            {"email": "jdoe@university.edu", "password": self.raw_password},
            format="json"
        )
        self.assertEqual(response.data["fullName"], "John Doe")
 
    def test_login_faculty_role(self):
        """Faculty users should receive role='faculty' on login."""
        Users.objects.create(
            fullName="Jane Smith",
            email="jsmith@university.edu",
            password=make_password("Secret@1"),
            roleType="faculty"
        )
        response = self.client.post(
            self.url,
            {"email": "jsmith@university.edu", "password": "Secret@1"},
            format="json"
        )
        self.assertEqual(response.data["role"], "faculty")
 
    # ── Wrong credentials ────────────────────────────────────────────────────
 
    def test_login_wrong_password_returns_401(self):
        """Wrong password should return 401."""
        response = self.client.post(
            self.url,
            {"email": "jdoe@university.edu", "password": "WrongPass!"},
            format="json"
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.data)
 
    def test_login_nonexistent_email_returns_401(self):
        """Unknown email should return 401 (not 404, to avoid user enumeration)."""
        response = self.client.post(
            self.url,
            {"email": "nobody@university.edu", "password": "Secret@1"},
            format="json"
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "Invalid credentials")
 
    def test_login_wrong_password_error_message(self):
        """Error message should be generic to prevent user enumeration."""
        response = self.client.post(
            self.url,
            {"email": "jdoe@university.edu", "password": "WrongPass!"},
            format="json"
        )
        self.assertEqual(response.data["error"], "Invalid credentials")
 
    # ── Missing fields ───────────────────────────────────────────────────────
 
    def test_login_missing_email_returns_400_or_401(self):
        """Request without email should not succeed (400 or 401 both acceptable)."""
        response = self.client.post(
            self.url,
            {"password": self.raw_password},
            format="json"
        )
        self.assertIn(response.status_code, [400, 401])
 
    def test_login_missing_password_returns_400_or_401(self):
        """Request without password should not succeed (400 or 401 both acceptable)."""
        response = self.client.post(
            self.url,
            {"email": "jdoe@university.edu"},
            format="json"
        )
        self.assertIn(response.status_code, [400, 401])