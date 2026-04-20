from django.urls import path
from . import views

urlpatterns = [
    path("summary/", views.summary),
    path("matches/", views.matches_over_time),
    path("dashboard/", views.dashboard),
]