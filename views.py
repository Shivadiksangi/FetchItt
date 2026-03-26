import json
from pathlib import Path

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import UserProfile


def home(request):
    assets_dir = Path(__file__).resolve().parent.parent / "static" / "assets"
    allowed_suffixes = {".jpg", ".jpeg", ".png", ".svg", ".webp"}
    asset_image_options = sorted(
        file.name
        for file in assets_dir.iterdir()
        if file.is_file() and file.suffix.lower() in allowed_suffixes
    ) if assets_dir.exists() else []

    return render(
        request,
        "index.html",
        {"asset_image_options_json": json.dumps(asset_image_options)},
    )


def _get_request_data(request):
    if request.content_type == "application/json":
        try:
            return json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return {}
    return request.POST


def _serialize_user(user):
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "email": user.email,
        "name": user.first_name or user.username,
        "role": profile.role if profile else "buyer",
    }


@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    data = _get_request_data(request)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return JsonResponse({"message": "Email and password are required."}, status=400)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({"message": "Invalid credentials"}, status=401)

    login(request, user)
    return JsonResponse(
        {
            "token": f"session-{user.id}",
            "message": "Login successful",
            "user": _serialize_user(user),
        }
    )


@csrf_exempt
def register_view(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not allowed"}, status=405)

    data = _get_request_data(request)
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "buyer").strip().lower()

    if not name or not email or not password:
        return JsonResponse({"message": "Name, email and password are required."}, status=400)
    if role not in {"buyer", "seller"}:
        return JsonResponse({"message": "Role must be buyer or seller."}, status=400)

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
        )
    except IntegrityError:
        return JsonResponse({"message": "An account with this email already exists."}, status=409)

    UserProfile.objects.create(user=user, role=role)
    login(request, user)
    return JsonResponse(
        {
            "token": f"session-{user.id}",
            "message": "Registration successful",
            "user": _serialize_user(user),
        },
        status=201,
    )


@csrf_exempt
def ai_suggest(request):
    import requests

    prompt = request.POST.get("prompt")

    if not prompt:
        return JsonResponse({"error": "No prompt provided"}, status=400)

    try:
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCpRqGflbnNSexTjXHW4-i3BzF0_izGn2c",
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=10,
        )
        data = response.json()

        if response.status_code != 200:
            error_msg = data.get("error", {}).get("message", "Unknown error")
            return JsonResponse({"error": error_msg}, status=response.status_code)

        return JsonResponse(data)
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": str(e)}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

