from django.test import TestCase
from rest_framework.test import APIClient
from ..models import Users
 
 
class RegisterViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/register/"
        self.valid_student_payload = {
            "firstName": "John",
            "lastName": "Doe",
            "email": "jdoe@university.edu",
            "password": "Secret@1",
            "role": "student"
        }
 
    # ── Happy paths ──────────────────────────────────────────────────────────
 
    def test_register_student_success(self):
        """Valid student payload creates a user and returns 200."""
        response = self.client.post(self.url, self.valid_student_payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "User created successfully")
 
    def test_register_faculty_success(self):
        """Valid faculty payload creates a user and returns 200."""
        payload = {
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jsmith@university.edu",
            "password": "Secret@1",
            "role": "faculty"
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "User created successfully")
 
    def test_register_stores_full_name(self):
        """Full name is stored as 'firstName lastName'."""
        self.client.post(self.url, self.valid_student_payload, format="json")
        user = Users.objects.get(email="jdoe@university.edu")
        self.assertEqual(user.fullName, "John Doe")
 
    def test_register_password_is_hashed(self):
        """Raw password must NOT be stored in the database."""
        self.client.post(self.url, self.valid_student_payload, format="json")
        user = Users.objects.get(email="jdoe@university.edu")
        self.assertNotEqual(user.password, "Secret@1")
        self.assertTrue(user.password.startswith("pbkdf2_"))  # Django default hasher
 
    def test_register_role_saved_correctly(self):
        """roleType field matches the submitted role."""
        self.client.post(self.url, self.valid_student_payload, format="json")
        user = Users.objects.get(email="jdoe@university.edu")
        self.assertEqual(user.roleType, "student")
 
    # ── Duplicate / conflict ─────────────────────────────────────────────────
 
    def test_register_duplicate_email_returns_400(self):
        """Registering the same email twice must fail."""
        self.client.post(self.url, self.valid_student_payload, format="json")
        response = self.client.post(self.url, self.valid_student_payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
 
    # ── Missing required fields ──────────────────────────────────────────────
 
    def test_register_missing_email_returns_400(self):
        """Omitting email should cause a 400 error."""
        payload = {**self.valid_student_payload}
        del payload["email"]
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 400)
 
    def test_register_missing_password_returns_400(self):
        """Omitting password should cause a 400 error."""
        payload = {**self.valid_student_payload}
        del payload["password"]
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 400)
 
    def test_register_missing_role_returns_400(self):
        """Omitting role should cause a 400 error."""
        payload = {**self.valid_student_payload}
        del payload["role"]
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 400)