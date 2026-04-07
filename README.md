## Mentor-Match — Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+


### 1) Backend (Django) — start with SQLite
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py runserver
```
- Server: `http://127.0.0.1:8000`
- Default local DB is SQLite. To use Postgres later, set env vars and `DB_ENGINE=postgres` before running.


### 2) Frontend (Vite/React)
```bash
cd ../
npm install
npm run dev
```
- App: `http://localhost:5173`


### 3) Use the app
- Register a faculty account to create projects.
- Register a student account to browse and apply.


### 4) Test the new application flow (email + statement + min assessment score)

#### Faculty
1. Log in.
2. Create Project:
   - Add title, description, required skills.
   - (Optional) Check “Require students to complete a quiz”.
   - If checked, set “Minimum passing score (%)” and add at least one MCQ with a correct answer.
3. Go to Applications to review submissions (you’ll see student email and a “Statement” column).

#### Student
1. Log in.
2. Open a project.
3. In the Apply section, enter Email and Statement of interest (both required) and submit.


### Optional: seed via API (quick demo)
Run these in a separate terminal while the backend is running.

```bash
# Create faculty
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada@u.edu","password":"pass","role":"faculty","department":"CS","position":"Professor"}'

# Create student
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alan","lastName":"Turing","email":"alan@u.edu","password":"pass","role":"student","major":"CS","department":"CS","year":"junior","gpa":3.8,"skills":["Python","Machine Learning"]}'

# Create posting with minAssessmentScore=70 (userID is the faculty's from register response)
curl -X POST http://127.0.0.1:8000/api/opportunities/create/ \
  -H "Content-Type: application/json" \
  -d '{"userID":3,"title":"ML RA","description":"Work on models","skills":["Python","Machine Learning"],"minAssessmentScore":70}'

# Create a simple assessment for postingID=2
curl -X POST http://127.0.0.1:8000/api/assessment/create/ \
  -H "Content-Type: application/json" \
  -d '{"userID":3,"postingID":2,"title":"Qualification Quiz","questions":[{"questionText":"What is 2+2?","questionType":"mcq","points":1,"choices":[{"choiceText":"3","isCorrect":false},{"choiceText":"4","isCorrect":true},{"choiceText":"5","isCorrect":false}]}]}'

# Apply as the student (userID from the student register response)
curl -X POST http://127.0.0.1:8000/api/apply/ \
  -H "Content-Type: application/json" \
  -d '{"userID":4,"projectId":2,"email":"alan@u.edu","statementOfInterest":"I love ML and have prior experience."}'
```


### Notes
- The assessment submission computes pass/fail vs the project’s minimum score and shows it in the faculty Applications list.
- You can use the Applications page to update application statuses.

