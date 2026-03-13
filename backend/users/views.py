from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Users
from django.contrib.auth.hashers import make_password, check_password

# -------------------------
# REGISTER USER
# -------------------------
@api_view(['POST'])
def register(request):
    data = request.data
    try:
        # Hash the password before saving
        hashed_password = make_password(data['password'])

        user = Users.objects.create(
            fullName=f"{data['firstName']} {data['lastName']}",
            email=data['email'],
            password=hashed_password,
            roleType=data['role']  # 'student' or 'faculty'
        )
        return Response({"message": "User created successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# -------------------------
# LOGIN USER
# -------------------------
@api_view(['POST'])
def login(request):
    data = request.data

    if not data.get('email') or not data.get('password'):
        return Response({"error": "Email and password are required"}, status=400)
    
    try:
        user = Users.objects.get(email=data['email'])
        if check_password(data['password'], user.password):
            return Response({
                "message": "Login successful",
                "role": user.roleType,
                "fullName": user.fullName,  
                "userID": user.userID       
            })
        else:
            return Response({"error": "Invalid credentials"}, status=401)
    except Users.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=401)