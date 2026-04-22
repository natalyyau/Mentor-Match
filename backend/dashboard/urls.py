from django.urls import path
from .views import dashboard_stats_api

urlpatterns = [
    path("stats/", dashboard_stats_api, name="dashboard_stats_api"),
]