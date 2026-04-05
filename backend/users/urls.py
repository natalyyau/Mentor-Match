from django.urls import path
from . import views

urlpatterns = [
    # ─── Auth ─────────────────────────────
    path("register/", views.register),
    path("login/", views.login),

    # ─── Opportunities ────────────────────
    path("opportunities/", views.opportunities_list),
    path("opportunities/create/", views.opportunities_create_or_update),
    path("opportunities/<int:id>/", views.opportunities_detail),
    path("opportunities/delete/", views.opportunities_delete),

    # ─── Applications ─────────────────────
    path("apply/", views.apply_to_opportunity),
    path("check-applied/", views.check_applied),
    path("my-applications/", views.my_applications),
    path("faculty-applications/", views.faculty_applications),
    path("faculty-applications/status/", views.update_application_status),
    path("my-postings/", views.my_postings),

    # ─── Assessments ──────────────────────
    path("assessment/create/", views.create_assessment, name="create_assessment"),
    path("assessment/submit/", views.submit_assessment, name="submit_assessment"),
    path("assessment/attempt/", views.get_attempt, name="get_attempt"),

    # 🎓 STUDENT VIEW (NO answers)
    path("assessment/<int:posting_id>/", views.get_assessment, name="get_assessment"),

    # 👩‍🏫 FACULTY VIEW (WITH answers)
    path("assessment/<int:posting_id>/faculty/", views.get_assessment_faculty, name="get_assessment_faculty"),
]