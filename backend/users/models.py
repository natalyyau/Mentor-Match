from django.db import models


class Users(models.Model):
    userID = models.AutoField(primary_key=True)
    fullName = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    roleType = models.CharField(max_length=20)  # 'student' or 'faculty'

    class Meta:
        db_table = 'Users'


class Department(models.Model):
    deptID = models.AutoField(primary_key=True)
    deptName = models.CharField(max_length=255)
    collegeName = models.CharField(max_length=255)

    class Meta:
        db_table = 'Department'


class Students(models.Model):
    studentID = models.AutoField(primary_key=True)
    userID = models.OneToOneField(Users, on_delete=models.CASCADE, db_column='userID')
    major = models.CharField(max_length=255)
    graduationYear = models.IntegerField()
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    deptID = models.ForeignKey(Department, on_delete=models.RESTRICT, db_column='deptID')

    class Meta:
        db_table = 'Students'


class Faculty(models.Model):
    userID = models.OneToOneField(Users, on_delete=models.CASCADE, primary_key=True, db_column='userID')
    deptID = models.ForeignKey(Department, on_delete=models.RESTRICT, db_column='deptID')
    title = models.CharField(max_length=255)

    class Meta:
        db_table = 'Faculty'


class ResearchPostings(models.Model):
    postingID = models.AutoField(primary_key=True)
    facultyID = models.ForeignKey(Faculty, on_delete=models.CASCADE, db_column='facultyID')
    deptID = models.ForeignKey(Department, on_delete=models.RESTRICT, db_column='deptID')
    title = models.CharField(max_length=255)
    description = models.TextField()
    prerequisites = models.TextField(null=True, blank=True)
    requiredGPA = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    deadline = models.DateField()

    class Meta:
        db_table = 'ResearchPostings'


class Applications(models.Model):
    applicationID = models.AutoField(primary_key=True)
    studentID = models.ForeignKey(Students, on_delete=models.CASCADE, db_column='studentID')
    postingID = models.ForeignKey(ResearchPostings, on_delete=models.CASCADE, db_column='postingID')
    submissionDate = models.DateField()
    status = models.CharField(max_length=50)
    prerequisitesVerified = models.BooleanField(default=False)

    class Meta:
        db_table = 'Applications'


class Skills(models.Model):
    skillID = models.AutoField(primary_key=True)
    skillName = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'Skills'


class StudentSkills(models.Model):
    studentID = models.ForeignKey(Students, on_delete=models.CASCADE, db_column='studentID')
    skillID = models.ForeignKey(Skills, on_delete=models.CASCADE, db_column='skillID')
    proficiencyLevel = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'StudentSkills'
        unique_together = (('studentID', 'skillID'),)


class PostingSkills(models.Model):
    postingID = models.ForeignKey(ResearchPostings, on_delete=models.CASCADE, db_column='postingID')
    skillID = models.ForeignKey(Skills, on_delete=models.CASCADE, db_column='skillID')

    class Meta:
        db_table = 'PostingSkills'
        unique_together = (('postingID', 'skillID'),)


class Assessments(models.Model):
    assessmentID = models.AutoField(primary_key=True)
    postingID = models.ForeignKey(ResearchPostings, on_delete=models.CASCADE, db_column='postingID')
    title = models.CharField(max_length=255)

    class Meta:
        db_table = 'Assessments'


class Questions(models.Model):
    questionID = models.AutoField(primary_key=True)
    assessmentID = models.ForeignKey(Assessments, on_delete=models.CASCADE, db_column='assessmentID')
    questionText = models.TextField()
    questionType = models.CharField(max_length=50)
    correctAnswer = models.TextField(null=True, blank=True)
    points = models.IntegerField()

    class Meta:
        db_table = 'Questions'


class AssessmentAttempts(models.Model):
    attemptID = models.AutoField(primary_key=True)
    studentID = models.ForeignKey(Students, on_delete=models.CASCADE, db_column='studentID')
    assessmentID = models.ForeignKey(Assessments, on_delete=models.CASCADE, db_column='assessmentID')
    score = models.IntegerField()
    passed = models.BooleanField(null=True, blank=True)
    attemptDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'AssessmentAttempts'