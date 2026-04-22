from django.shortcuts import render
from users.models import Users, Skills, ResearchPostings, Department
from django.db.models import Count, F

def dashboard_home(request):
    popular_skills = Skills.objects.annotate(
        num_users=Count("studentskills")
    ).order_by("-num_users")[:5]

    skills_data = list(
    popular_skills.values("skillName", "num_users")
)

    posts_by_department = ResearchPostings.objects.annotate(
        dept_name=F("deptID__deptName")
    ).values("dept_name").annotate(
        count=Count("postingID")
    )


    context = {
        "total_users": Users.objects.count(),
        "total_mentors": Users.objects.filter(roleType="faculty").count(),
        "total_mentees": Users.objects.filter(roleType="student").count(),
        "total_departments": Department.objects.count(),
        "total_skills" : Skills.objects.count(),
        "total_research_posts" : ResearchPostings.objects.count(),

        "popular_skills": skills_data,
        "posts_by_department": list(posts_by_department),
    }
    return render(request, "dashboard/dashboard.html", context)

