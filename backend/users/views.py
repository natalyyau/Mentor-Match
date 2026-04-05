from datetime import date, timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError
from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Applications,
    Department,
    Faculty,
    PostingSkills,
    ResearchPostings,
    Skills,
    StudentSkills,
    Students,
    Users,
    Assessments,
    AssessmentAttempts,
    Choices,
    Questions,
    StudentAnswers,
)


YEAR_TO_GRAD_OFFSET = {
    "freshman": 4,
    "sophomore": 3,
    "junior": 2,
    "senior": 1,
    "graduate": 2,
    "postgraduate": 3,
}


def _clean_text(value, default=""):
    return str(value or default).strip()


def _normalize_skill_list(skills):
    if isinstance(skills, str):
        skills = [part.strip() for part in skills.split(",")]
    return [str(skill).strip() for skill in (skills or []) if str(skill).strip()]


def _get_or_create_department(name: str, college_name: str = "General"):
    dept_name = _clean_text(name) or "General"
    department = Department.objects.filter(deptName__iexact=dept_name).first()
    if department:
        return department
    return Department.objects.create(deptName=dept_name, collegeName=_clean_text(college_name) or "General")


def _student_graduation_year(year_label: str):
    label = _clean_text(year_label).lower()
    offset = YEAR_TO_GRAD_OFFSET.get(label, 4)
    return date.today().year + offset


def _get_student_by_user_id(user_id: int):
    try:
        return Students.objects.get(userID_id=user_id)
    except Students.DoesNotExist:
        return None


def _get_faculty_by_user_id(user_id: int):
    try:
        return Faculty.objects.get(userID_id=user_id)
    except Faculty.DoesNotExist:
        return None


def _duration_days(duration: str) -> int:
    if not duration:
        return 56

    d = duration.strip().lower()
    if "12" in d:
        return 84
    if "semester" in d:
        return 120
    return 56


def _deadline_from_duration(duration: str) -> date:
    return date.today() + timedelta(days=_duration_days(duration))


def _student_skill_names(student: Students):
    return list(
        StudentSkills.objects.filter(studentID=student)
        .select_related("skillID")
        .values_list("skillID__skillName", flat=True)
    )


def _posting_skill_names(posting: ResearchPostings):
    return list(
        PostingSkills.objects.filter(postingID=posting)
        .select_related("skillID")
        .values_list("skillID__skillName", flat=True)
    )


def _calculate_relevance(student: Students, posting: ResearchPostings) -> int:
    score = 0

    student_skills = {skill.lower() for skill in _student_skill_names(student)}
    posting_skills = {skill.lower() for skill in _posting_skill_names(posting)}

    score += len(student_skills & posting_skills) * 10

    student_major = _clean_text(student.major).lower()
    dept_name = _clean_text(posting.deptID.deptName if posting.deptID_id else "").lower()
    title = _clean_text(posting.title).lower()
    description = _clean_text(posting.description).lower()
    prerequisites = _clean_text(posting.prerequisites).lower()
    haystack = " ".join([title, description, prerequisites, dept_name])

    if student_major and dept_name and student_major in dept_name:
        score += 20
    if student_major and student.deptID_id == posting.deptID_id:
        score += 25

    for token in [part.strip() for part in student_major.replace("/", " ").split() if part.strip()]:
        if len(token) >= 3 and token in haystack:
            score += 3

    if student.gpa is not None and posting.requiredGPA is not None and student.gpa >= posting.requiredGPA:
        score += 5

    return score


def _serialize_posting(posting: ResearchPostings, student: Students | None = None) -> dict:
    faculty_name = None
    if posting.facultyID_id is not None and posting.facultyID.userID_id is not None:
        faculty_name = posting.facultyID.userID.fullName

    department_name = posting.deptID.deptName if posting.deptID_id is not None else None
    skills = _posting_skill_names(posting)
    description = posting.description or ""
    relevance_score = _calculate_relevance(student, posting) if student else 0

    return {
        "id": posting.postingID,
        "title": posting.title,
        "description": description,
        "fullDescription": description,
        "desc": description,
        "faculty": faculty_name,
        "department": department_name,
        "skills": skills,
        "duration": posting.status,
        "status": posting.status,
        "deadline": posting.deadline.isoformat() if posting.deadline else None,
        "createdAt": posting.createdAt.isoformat() if posting.createdAt else None,
        "relevanceScore": relevance_score,
    }


@api_view(["POST"])
def register(request):
    data = request.data or {}

    first_name = _clean_text(data.get("firstName"))
    last_name = _clean_text(data.get("lastName"))
    email = _clean_text(data.get("email")).lower()
    password = data.get("password")
    role = _clean_text(data.get("role")).lower()

    if not first_name or not last_name or not email or not password or role not in {"student", "faculty"}:
        return Response({"error": "Missing or invalid required fields"}, status=400)

    if Users.objects.filter(email__iexact=email).exists():
        return Response({"error": "A user with this email already exists"}, status=400)

    try:
        user = Users.objects.create(
            fullName=f"{first_name} {last_name}",
            email=email,
            password=make_password(password),
            roleType=role,
        )

        if role == "student":
            major = _clean_text(data.get("major"))
            if not major:
                raise ValueError("Major is required for students")

            department = _get_or_create_department(data.get("department") or major)
            student = Students.objects.create(
                userID=user,
                major=major,
                graduationYear=_student_graduation_year(data.get("year")),
                gpa=data.get("gpa") or None,
                deptID=department,
            )

            for skill_name in _normalize_skill_list(data.get("skills")):
                skill_obj, _ = Skills.objects.get_or_create(skillName=skill_name)
                StudentSkills.objects.get_or_create(studentID=student, skillID=skill_obj)

        else:
            department_name = _clean_text(data.get("department"))
            title = _clean_text(data.get("position") or data.get("title") or "Professor")
            if not department_name:
                raise ValueError("Department is required for faculty")

            department = _get_or_create_department(department_name)
            Faculty.objects.create(userID=user, deptID=department, title=title)

        return Response({"message": "User created successfully", "userID": user.userID})
    except (ValueError, IntegrityError) as exc:
        user = Users.objects.filter(email=email).first()
        if user and not _get_student_by_user_id(user.userID) and not _get_faculty_by_user_id(user.userID):
            user.delete()
        return Response({"error": str(exc)}, status=400)
    except Exception as exc:
        return Response({"error": str(exc)}, status=400)


@api_view(["POST"])
def login(request):
    data = request.data

    if not data.get("email") or not data.get("password"):
        return Response({"error": "Email and password are required"}, status=400)

    try:
        user = Users.objects.get(email=data["email"])
        if check_password(data["password"], user.password):
            return Response({
                "message": "Login successful",
                "role": user.roleType,
                "fullName": user.fullName,
                "userID": user.userID,
            })
        return Response({"error": "Invalid credentials"}, status=401)
    except Users.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=401)


@api_view(["GET"])
def opportunities_list(request):
    qs = ResearchPostings.objects.all().select_related("facultyID__userID", "deptID")

    search = request.query_params.get("search", "").strip()
    department = request.query_params.get("department", "").strip()
    skill = request.query_params.get("skill", "").strip()
    duration = request.query_params.get("duration", "").strip()
    user_id = request.query_params.get("userID")

    if search:
        qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(prerequisites__icontains=search))
    if department:
        qs = qs.filter(deptID__deptName__icontains=department)
    if duration:
        qs = qs.filter(status__icontains=duration)
    if skill:
        skill_ids = Skills.objects.filter(skillName__icontains=skill).values_list("skillID", flat=True)
        posting_ids = PostingSkills.objects.filter(skillID__in=skill_ids).values_list("postingID_id", flat=True)
        qs = qs.filter(postingID__in=posting_ids)

    student = _get_student_by_user_id(int(user_id)) if user_id and str(user_id).isdigit() else None
    postings = list(qs)
    if student:
        postings.sort(key=lambda posting: (-_calculate_relevance(student, posting), -(posting.postingID or 0)))
    else:
        postings.sort(key=lambda posting: posting.createdAt or date.min, reverse=True)

    return Response({"opportunities": [_serialize_posting(posting, student=student) for posting in postings]})


@api_view(["GET"])
def opportunities_detail(request, id: int):
    try:
        posting = ResearchPostings.objects.select_related("facultyID__userID", "deptID").get(postingID=id)
    except ResearchPostings.DoesNotExist:
        return Response({"error": "Opportunity not found"}, status=404)

    user_id = request.query_params.get("userID")
    student = _get_student_by_user_id(int(user_id)) if user_id and str(user_id).isdigit() else None
    return Response({"opportunity": _serialize_posting(posting, student=student)})


@api_view(["POST"])
def opportunities_create_or_update(request):
    data = request.data or {}
    user_id = data.get("userID")
    title = _clean_text(data.get("title"))
    description = _clean_text(data.get("description"))
    skills = _normalize_skill_list(data.get("skills"))

    if not user_id:
        return Response({"error": "userID is required"}, status=400)
    if not title:
        return Response({"error": "title is required"}, status=400)
    if not description:
        return Response({"error": "description is required"}, status=400)
    if not skills:
        return Response({"error": "skills[] is required"}, status=400)

    faculty = _get_faculty_by_user_id(int(user_id))
    if not faculty:
        return Response({"error": "Faculty not found for this userID"}, status=400)

    duration = _clean_text(data.get("duration") or data.get("status") or "8 Week")
    deadline_str = data.get("deadline") if isinstance(data.get("deadline"), str) else ""
    deadline = parse_date(deadline_str) if deadline_str else None
    if not deadline:
        deadline = _deadline_from_duration(duration)

    posting_id = data.get("postingID") or data.get("id")
    if posting_id:
        try:
            posting = ResearchPostings.objects.get(postingID=int(posting_id), facultyID=faculty)
        except ResearchPostings.DoesNotExist:
            return Response({"error": "Opportunity not found"}, status=404)

        posting.title = title
        posting.description = description
        posting.prerequisites = _clean_text(data.get("prerequisites")) or None
        posting.requiredGPA = data.get("requiredGPA") or None
        posting.status = duration
        posting.deadline = deadline
        posting.deptID = faculty.deptID
        posting.save()
    else:
        posting = ResearchPostings.objects.create(
            facultyID=faculty,
            deptID=faculty.deptID,
            title=title,
            description=description,
            prerequisites=_clean_text(data.get("prerequisites")) or None,
            requiredGPA=data.get("requiredGPA") or None,
            status=duration,
            deadline=deadline,
        )

    PostingSkills.objects.filter(postingID=posting).delete()
    for skill_name in skills:
        skill_obj, _ = Skills.objects.get_or_create(skillName=skill_name)
        PostingSkills.objects.get_or_create(postingID=posting, skillID=skill_obj)

    return Response({"message": "Opportunity saved successfully", "opportunity": _serialize_posting(posting)}, status=200)


@api_view(["POST"])
def opportunities_delete(request):
    data = request.data or {}
    user_id = data.get("userID")
    posting_id = data.get("postingID") or data.get("id")

    if not user_id or not posting_id:
        return Response({"error": "userID and postingID are required"}, status=400)

    faculty = _get_faculty_by_user_id(int(user_id))
    if not faculty:
        return Response({"error": "Faculty not found for this userID"}, status=400)

    try:
        posting = ResearchPostings.objects.get(postingID=int(posting_id), facultyID=faculty)
    except ResearchPostings.DoesNotExist:
        return Response({"error": "Opportunity not found"}, status=404)

    posting.delete()
    return Response({"message": "Opportunity deleted successfully"})


@api_view(["POST"])
def apply_to_opportunity(request):
    data = request.data or {}
    user_id = data.get("userID")
    project_id = data.get("projectId")

    if not user_id or not project_id:
        return Response({"error": "userID and projectId are required"}, status=400)

    student = _get_student_by_user_id(int(user_id))
    if not student:
        return Response({"error": "Student not found for this userID"}, status=400)

    try:
        posting = ResearchPostings.objects.get(postingID=int(project_id))
    except ResearchPostings.DoesNotExist:
        return Response({"error": "Opportunity not found"}, status=404)

    if Applications.objects.filter(studentID=student, postingID=posting).exists():
        return Response({"error": "You are already applied to this opportunity"}, status=400)

    app = Applications.objects.create(
        studentID=student,
        postingID=posting,
        submissionDate=date.today(),
        status="New",
        prerequisitesVerified=False,
    )

    return Response({"message": "Application submitted successfully", "applicationID": app.applicationID}, status=201)


@api_view(["GET"])
def check_applied(request):
    user_id = request.query_params.get("userID")
    project_id = request.query_params.get("projectId")

    if not user_id or not project_id:
        return Response({"error": "userID and projectId are required"}, status=400)

    student = _get_student_by_user_id(int(user_id))
    if not student:
        return Response({"applied": False})

    applied = Applications.objects.filter(studentID=student, postingID_id=int(project_id)).exists()
    return Response({"applied": applied})


@api_view(["GET"])
def my_applications(request):
    user_id = request.query_params.get("userID")
    if not user_id:
        return Response({"applications": []})

    student = _get_student_by_user_id(int(user_id))
    if not student:
        return Response({"applications": []})

    apps = Applications.objects.filter(studentID=student).select_related("postingID__facultyID__userID", "postingID__deptID").order_by("-submissionDate")

    enriched = []
    for app in apps:
        posting = app.postingID
        enriched.append({
            "applicationId": app.applicationID,
            "projectId": posting.postingID,
            "submittedAt": app.submissionDate.isoformat(),
            "status": app.status,
            "title": posting.title,
            "faculty": posting.facultyID.userID.fullName,
            "department": posting.deptID.deptName,
            "skills": _posting_skill_names(posting),
        })

    return Response({"applications": enriched})


@api_view(["GET"])
def my_postings(request):
    user_id = request.query_params.get("userID")
    if not user_id:
        return Response({"postings": []})

    faculty = _get_faculty_by_user_id(int(user_id))
    if not faculty:
        return Response({"postings": []})

    postings = ResearchPostings.objects.filter(facultyID=faculty).select_related("facultyID__userID", "deptID").order_by("-createdAt")
    return Response({"postings": [_serialize_posting(p) for p in postings]})


@api_view(["GET"])
def faculty_applications(request):
    user_id = request.query_params.get("userID")
    if not user_id:
        return Response({"applications": []})

    faculty = _get_faculty_by_user_id(int(user_id))
    if not faculty:
        return Response({"applications": []})

    project_id = request.query_params.get("projectId")
    postings_qs = ResearchPostings.objects.filter(facultyID=faculty)
    if project_id and str(project_id).isdigit():
        postings_qs = postings_qs.filter(postingID=int(project_id))

    apps = Applications.objects.filter(postingID__in=postings_qs).select_related("studentID__userID", "postingID__facultyID__userID", "postingID__deptID").order_by("-submissionDate")

    enriched = []
    for app in apps:
        student = app.studentID
        posting = app.postingID

        # ── Assessment score ──
        assessment_score = None
        try:
            assessment = Assessments.objects.get(postingID=posting)
            attempt = AssessmentAttempts.objects.filter(
                studentID=student, assessmentID=assessment
            ).first()
            if attempt:
                assessment_score = {
                    "score": float(attempt.score),
                    "passed": attempt.passed,
                }
        except Assessments.DoesNotExist:
            pass

        enriched.append({
            "id": app.applicationID,
            "applicationId": app.applicationID,
            "student": student.userID.fullName,
            "email": student.userID.email,
            "position": posting.title,
            "skills": _student_skill_names(student),
            "assessment": assessment_score,
            "gpa": float(student.gpa) if student.gpa is not None else None,
            "appliedDate": app.submissionDate.isoformat(),
            "status": app.status,
            "projectId": posting.postingID,
        })

    return Response({"applications": enriched})


@api_view(["POST"])
def update_application_status(request):
    data = request.data or {}
    user_id = data.get("userID")
    application_id = data.get("applicationId")
    status = _clean_text(data.get("status"))
    valid_statuses = {"New", "Under Review", "Shortlisted", "Accepted", "Rejected"}

    if not user_id or not application_id or status not in valid_statuses:
        return Response({"error": "userID, applicationId, and a valid status are required"}, status=400)

    faculty = _get_faculty_by_user_id(int(user_id))
    if not faculty:
        return Response({"error": "Faculty not found for this userID"}, status=400)

    try:
        application = Applications.objects.select_related("postingID").get(applicationID=int(application_id), postingID__facultyID=faculty)
    except Applications.DoesNotExist:
        return Response({"error": "Application not found"}, status=404)

    application.status = status
    application.save(update_fields=["status"])
    return Response({"message": "Application status updated successfully", "applicationId": application.applicationID, "status": application.status})

@api_view(["POST"])
def create_assessment(request):
    """
    Faculty creates an assessment for a posting.
    Called right after creating a posting.
 
    Body: {
        postingID, title,
        questions: [
            {
                questionText, questionType ("mcq"|"short"), points,
                correctAnswer,          # short answer only
                choices: [              # mcq only
                    { choiceText, isCorrect }
                ]
            }
        ]
    }
    """
    data = request.data or {}
    user_id = data.get("userID")
    posting_id = data.get("postingID")
    title = _clean_text(data.get("title") or "Assessment")
    questions_data = data.get("questions", [])
 
    if not user_id or not posting_id:
        return Response({"error": "userID and postingID are required"}, status=400)
    if not questions_data:
        return Response({"error": "At least one question is required"}, status=400)
 
    faculty = _get_faculty_by_user_id(int(user_id))
    if not faculty:
        return Response({"error": "Faculty not found"}, status=400)
 
    try:
        posting = ResearchPostings.objects.get(postingID=int(posting_id), facultyID=faculty)
    except ResearchPostings.DoesNotExist:
        return Response({"error": "Posting not found"}, status=404)
 
    # Delete existing assessment for this posting if re-creating
    Assessments.objects.filter(postingID=posting).delete()
 
    assessment = Assessments.objects.create(postingID=posting, title=title)
 
    for q_data in questions_data:
        q_text = _clean_text(q_data.get("questionText"))
        q_type = _clean_text(q_data.get("questionType"))
        points = int(q_data.get("points") or 1)
 
        if not q_text or q_type not in ("mcq", "short"):
            continue
 
        question = Questions.objects.create(
            assessmentID=assessment,
            questionText=q_text,
            questionType=q_type,
            correctAnswer=_clean_text(q_data.get("correctAnswer")) or None,
            points=points,
        )
 
        if q_type == "mcq":
            for choice_data in q_data.get("choices", []):
                choice_text = _clean_text(choice_data.get("choiceText"))
                if choice_text:
                    Choices.objects.create(
                        questionID=question,
                        choiceText=choice_text,
                        isCorrect=bool(choice_data.get("isCorrect", False)),
                    )
 
    return Response({"message": "Assessment created", "assessmentID": assessment.assessmentID}, status=201)
 
 
@api_view(["GET"])
def get_assessment(request, posting_id: int):
    """
    Returns the assessment (with questions + choices) for a posting.
    Used by students before taking it.
    Does NOT include correct answers.
    """
    try:
        assessment = Assessments.objects.get(postingID_id=posting_id)
    except Assessments.DoesNotExist:
        return Response({"assessment": None})
 
    questions = []
    for q in Questions.objects.filter(assessmentID=assessment).order_by("questionID"):
        q_data = {
            "questionID": q.questionID,
            "questionText": q.questionText,
            "questionType": q.questionType,
            "points": q.points,
            "choices": [],
        }
        if q.questionType == "mcq":
            for c in Choices.objects.filter(questionID=q):
                q_data["choices"].append({
                    "choiceID": c.choiceID,
                    "choiceText": c.choiceText,
                })
        questions.append(q_data)
 
    return Response({
        "assessment": {
            "assessmentID": assessment.assessmentID,
            "title": assessment.title,
            "questions": questions,
        }
    })

@api_view(["GET"])
def get_assessment_faculty(request, posting_id: int):
    """
    Returns full assessment including correct answers — for faculty editing only.
    """
    user_id = request.query_params.get("userID")
    if not user_id:
        return Response({"error": "userID required"}, status=400)

    faculty = _get_faculty_by_user_id(int(user_id))
    if not faculty:
        return Response({"error": "Faculty not found"}, status=403)

    try:
        assessment = Assessments.objects.get(postingID_id=posting_id)
    except Assessments.DoesNotExist:
        return Response({"assessment": None})

    # Verify this faculty owns the posting
    if assessment.postingID.facultyID != faculty:
        return Response({"error": "Unauthorized"}, status=403)

    questions = []
    for q in Questions.objects.filter(assessmentID=assessment).order_by("questionID"):
        q_data = {
            "questionID": q.questionID,
            "questionText": q.questionText,
            "questionType": q.questionType,
            "points": q.points,
            "correctAnswer": q.correctAnswer or "",
            "choices": [],
        }
        if q.questionType == "mcq":
            for c in Choices.objects.filter(questionID=q):
                q_data["choices"].append({
                    "choiceID": c.choiceID,
                    "choiceText": c.choiceText,
                    "isCorrect": c.isCorrect,  # ← included for faculty
                })
        questions.append(q_data)

    return Response({
        "assessment": {
            "assessmentID": assessment.assessmentID,
            "title": assessment.title,
            "questions": questions,
        }
    })
 
 
@api_view(["POST"])
def submit_assessment(request):
    """
    Student submits answers.
 
    Body: {
        userID, assessmentID,
        answers: [
            { questionID, selectedChoiceID }   # mcq
            { questionID, textAnswer }          # short
        ]
    }
    """
    data = request.data or {}
    user_id = data.get("userID")
    assessment_id = data.get("assessmentID")
    answers = data.get("answers", [])
 
    if not user_id or not assessment_id:
        return Response({"error": "userID and assessmentID are required"}, status=400)
 
    student = _get_student_by_user_id(int(user_id))
    if not student:
        return Response({"error": "Student not found"}, status=400)
 
    try:
        assessment = Assessments.objects.get(assessmentID=int(assessment_id))
    except Assessments.DoesNotExist:
        return Response({"error": "Assessment not found"}, status=404)
 
    # Prevent re-taking
    if AssessmentAttempts.objects.filter(studentID=student, assessmentID=assessment).exists():
        return Response({"error": "You have already completed this assessment"}, status=400)
 
    # Grade
    total_points = 0
    earned_points = 0
 
    attempt = AssessmentAttempts.objects.create(
        studentID=student,
        assessmentID=assessment,
        score=0,
        passed=None,
    )
 
    for ans in answers:
        question_id = ans.get("questionID")
        try:
            question = Questions.objects.get(questionID=int(question_id), assessmentID=assessment)
        except Questions.DoesNotExist:
            continue
 
        total_points += question.points
        selected_choice = None
        is_correct = False
 
        if question.questionType == "mcq":
            choice_id = ans.get("selectedChoiceID")
            if choice_id:
                try:
                    selected_choice = Choices.objects.get(choiceID=int(choice_id), questionID=question)
                    is_correct = selected_choice.isCorrect
                except Choices.DoesNotExist:
                    pass
            StudentAnswers.objects.create(
                attemptID=attempt,
                questionID=question,
                selectedChoice=selected_choice,
            )
        else:
            # Short answer: store text, no auto-grade
            text = _clean_text(ans.get("textAnswer"))
            StudentAnswers.objects.create(
                attemptID=attempt,
                questionID=question,
                textAnswer=text,
            )
            # Partial credit: simple case-insensitive match if correctAnswer set
            if question.correctAnswer and text.lower() == question.correctAnswer.strip().lower():
                is_correct = True
 
        if is_correct:
            earned_points += question.points
 
    score = round((earned_points / total_points) * 100, 2) if total_points > 0 else 0
 
    # Check against posting's minAssessmentScore
    posting = assessment.postingID
    passed = None
    if posting.minAssessmentScore is not None:
        passed = score >= posting.minAssessmentScore
 
    attempt.score = score
    attempt.passed = passed
    attempt.save()
 
    return Response({
        "message": "Assessment submitted",
        "score": score,
        "passed": passed,
        "earnedPoints": earned_points,
        "totalPoints": total_points,
    }, status=201)
 
 
@api_view(["GET"])
def get_attempt(request):
    """
    Check if a student already attempted an assessment for a posting.
    GET /api/assessment/attempt/?userID=X&postingID=Y
    """
    user_id = request.query_params.get("userID")
    posting_id = request.query_params.get("postingID")
 
    if not user_id or not posting_id:
        return Response({"attempt": None})
 
    student = _get_student_by_user_id(int(user_id))
    if not student:
        return Response({"attempt": None})
 
    try:
        assessment = Assessments.objects.get(postingID_id=int(posting_id))
    except Assessments.DoesNotExist:
        return Response({"attempt": None, "hasAssessment": False})
 
    attempt = AssessmentAttempts.objects.filter(studentID=student, assessmentID=assessment).first()
    if not attempt:
        return Response({"attempt": None, "hasAssessment": True, "assessmentID": assessment.assessmentID})
 
    return Response({
        "hasAssessment": True,
        "attempt": {
            "score": float(attempt.score),
            "passed": attempt.passed,
            "attemptDate": attempt.attemptDate.isoformat(),
        }
    })