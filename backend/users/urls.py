from django.urls import path
from .views import (
    apply_to_opportunity,
    check_applied,
    faculty_applications,
    login,
    my_applications,
    my_postings,
    opportunities_create_or_update,
    opportunities_delete,
    opportunities_detail,
    opportunities_list,
    register,
    update_application_status,
)

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("opportunities/", opportunities_list),
    path("opportunities/create/", opportunities_create_or_update),
    path("opportunities/<int:id>/", opportunities_detail),
    path("opportunities/delete/", opportunities_delete),
    path("apply/", apply_to_opportunity),
    path("check-applied/", check_applied),
    path("my-applications/", my_applications),
    path("faculty-applications/", faculty_applications),
    path("faculty-applications/status/", update_application_status),
    path("my-postings/", my_postings),
]
