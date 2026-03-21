drop extension if exists "pg_net";

create sequence "public"."applications_applicationid_seq";

create sequence "public"."assessmentattempts_attemptid_seq";

create sequence "public"."assessments_assessmentid_seq";

create sequence "public"."department_deptid_seq";

create sequence "public"."questions_questionid_seq";

create sequence "public"."researchpostings_postingid_seq";

create sequence "public"."skills_skillid_seq";

create sequence "public"."students_studentid_seq";

create sequence "public"."users_userid_seq";


  create table "public"."applications" (
    "applicationid" integer not null default nextval('public.applications_applicationid_seq'::regclass),
    "studentid" integer not null,
    "postingid" integer not null,
    "submissiondate" date not null,
    "status" character varying(50) not null,
    "prerequisitesverified" boolean default false
      );



  create table "public"."assessmentattempts" (
    "attemptid" integer not null default nextval('public.assessmentattempts_attemptid_seq'::regclass),
    "studentid" integer not null,
    "assessmentid" integer not null,
    "score" integer not null,
    "passed" boolean,
    "attemptdate" timestamp without time zone default CURRENT_TIMESTAMP
      );



  create table "public"."assessments" (
    "assessmentid" integer not null default nextval('public.assessments_assessmentid_seq'::regclass),
    "postingid" integer not null,
    "title" character varying(255) not null
      );



  create table "public"."department" (
    "deptid" integer not null default nextval('public.department_deptid_seq'::regclass),
    "deptname" character varying(255) not null,
    "collegename" character varying(255) not null
      );



  create table "public"."faculty" (
    "userid" integer not null,
    "deptid" integer not null,
    "title" character varying(255) not null
      );



  create table "public"."postingskills" (
    "postingid" integer not null,
    "skillid" integer not null
      );



  create table "public"."questions" (
    "questionid" integer not null default nextval('public.questions_questionid_seq'::regclass),
    "assessmentid" integer not null,
    "questiontext" text not null,
    "questiontype" character varying(50) not null,
    "correctanswer" text,
    "points" integer not null
      );



  create table "public"."researchpostings" (
    "postingid" integer not null default nextval('public.researchpostings_postingid_seq'::regclass),
    "facultyid" integer not null,
    "deptid" integer not null,
    "title" character varying(255) not null,
    "description" text not null,
    "prerequisites" text,
    "requiredgpa" numeric(3,2),
    "createdat" timestamp without time zone default CURRENT_TIMESTAMP,
    "status" character varying(50) not null,
    "deadline" date not null
      );



  create table "public"."skills" (
    "skillid" integer not null default nextval('public.skills_skillid_seq'::regclass),
    "skillname" character varying(255) not null
      );



  create table "public"."students" (
    "studentid" integer not null default nextval('public.students_studentid_seq'::regclass),
    "userid" integer not null,
    "major" character varying(255) not null,
    "graduationyear" integer not null,
    "gpa" numeric(3,2),
    "deptid" integer not null
      );



  create table "public"."studentskills" (
    "studentid" integer not null,
    "skillid" integer not null,
    "proficiencylevel" character varying(50)
      );



  create table "public"."users" (
    "userid" integer not null default nextval('public.users_userid_seq'::regclass),
    "fullname" character varying(255) not null,
    "email" character varying(255) not null,
    "password" character varying(255) not null,
    "roletype" character varying(20) not null
      );


alter sequence "public"."applications_applicationid_seq" owned by "public"."applications"."applicationid";

alter sequence "public"."assessmentattempts_attemptid_seq" owned by "public"."assessmentattempts"."attemptid";

alter sequence "public"."assessments_assessmentid_seq" owned by "public"."assessments"."assessmentid";

alter sequence "public"."department_deptid_seq" owned by "public"."department"."deptid";

alter sequence "public"."questions_questionid_seq" owned by "public"."questions"."questionid";

alter sequence "public"."researchpostings_postingid_seq" owned by "public"."researchpostings"."postingid";

alter sequence "public"."skills_skillid_seq" owned by "public"."skills"."skillid";

alter sequence "public"."students_studentid_seq" owned by "public"."students"."studentid";

alter sequence "public"."users_userid_seq" owned by "public"."users"."userid";

CREATE UNIQUE INDEX applications_pkey ON public.applications USING btree (applicationid);

CREATE UNIQUE INDEX assessmentattempts_pkey ON public.assessmentattempts USING btree (attemptid);

CREATE UNIQUE INDEX assessments_pkey ON public.assessments USING btree (assessmentid);

CREATE UNIQUE INDEX department_pkey ON public.department USING btree (deptid);

CREATE UNIQUE INDEX faculty_pkey ON public.faculty USING btree (userid);

CREATE UNIQUE INDEX postingskills_pkey ON public.postingskills USING btree (postingid, skillid);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (questionid);

CREATE UNIQUE INDEX researchpostings_pkey ON public.researchpostings USING btree (postingid);

CREATE UNIQUE INDEX skills_pkey ON public.skills USING btree (skillid);

CREATE UNIQUE INDEX skills_skillname_key ON public.skills USING btree (skillname);

CREATE UNIQUE INDEX students_pkey ON public.students USING btree (studentid);

CREATE UNIQUE INDEX students_userid_key ON public.students USING btree (userid);

CREATE UNIQUE INDEX studentskills_pkey ON public.studentskills USING btree (studentid, skillid);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (userid);

alter table "public"."applications" add constraint "applications_pkey" PRIMARY KEY using index "applications_pkey";

alter table "public"."assessmentattempts" add constraint "assessmentattempts_pkey" PRIMARY KEY using index "assessmentattempts_pkey";

alter table "public"."assessments" add constraint "assessments_pkey" PRIMARY KEY using index "assessments_pkey";

alter table "public"."department" add constraint "department_pkey" PRIMARY KEY using index "department_pkey";

alter table "public"."faculty" add constraint "faculty_pkey" PRIMARY KEY using index "faculty_pkey";

alter table "public"."postingskills" add constraint "postingskills_pkey" PRIMARY KEY using index "postingskills_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."researchpostings" add constraint "researchpostings_pkey" PRIMARY KEY using index "researchpostings_pkey";

alter table "public"."skills" add constraint "skills_pkey" PRIMARY KEY using index "skills_pkey";

alter table "public"."students" add constraint "students_pkey" PRIMARY KEY using index "students_pkey";

alter table "public"."studentskills" add constraint "studentskills_pkey" PRIMARY KEY using index "studentskills_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."applications" add constraint "applications_postingid_fkey" FOREIGN KEY (postingid) REFERENCES public.researchpostings(postingid) ON DELETE CASCADE not valid;

alter table "public"."applications" validate constraint "applications_postingid_fkey";

alter table "public"."applications" add constraint "applications_studentid_fkey" FOREIGN KEY (studentid) REFERENCES public.students(studentid) ON DELETE CASCADE not valid;

alter table "public"."applications" validate constraint "applications_studentid_fkey";

alter table "public"."assessmentattempts" add constraint "assessmentattempts_assessmentid_fkey" FOREIGN KEY (assessmentid) REFERENCES public.assessments(assessmentid) ON DELETE CASCADE not valid;

alter table "public"."assessmentattempts" validate constraint "assessmentattempts_assessmentid_fkey";

alter table "public"."assessmentattempts" add constraint "assessmentattempts_studentid_fkey" FOREIGN KEY (studentid) REFERENCES public.students(studentid) ON DELETE CASCADE not valid;

alter table "public"."assessmentattempts" validate constraint "assessmentattempts_studentid_fkey";

alter table "public"."assessments" add constraint "assessments_postingid_fkey" FOREIGN KEY (postingid) REFERENCES public.researchpostings(postingid) ON DELETE CASCADE not valid;

alter table "public"."assessments" validate constraint "assessments_postingid_fkey";

alter table "public"."faculty" add constraint "faculty_deptid_fkey" FOREIGN KEY (deptid) REFERENCES public.department(deptid) not valid;

alter table "public"."faculty" validate constraint "faculty_deptid_fkey";

alter table "public"."faculty" add constraint "faculty_userid_fkey" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE not valid;

alter table "public"."faculty" validate constraint "faculty_userid_fkey";

alter table "public"."postingskills" add constraint "postingskills_postingid_fkey" FOREIGN KEY (postingid) REFERENCES public.researchpostings(postingid) ON DELETE CASCADE not valid;

alter table "public"."postingskills" validate constraint "postingskills_postingid_fkey";

alter table "public"."postingskills" add constraint "postingskills_skillid_fkey" FOREIGN KEY (skillid) REFERENCES public.skills(skillid) ON DELETE CASCADE not valid;

alter table "public"."postingskills" validate constraint "postingskills_skillid_fkey";

alter table "public"."questions" add constraint "questions_assessmentid_fkey" FOREIGN KEY (assessmentid) REFERENCES public.assessments(assessmentid) ON DELETE CASCADE not valid;

alter table "public"."questions" validate constraint "questions_assessmentid_fkey";

alter table "public"."researchpostings" add constraint "researchpostings_deptid_fkey" FOREIGN KEY (deptid) REFERENCES public.department(deptid) not valid;

alter table "public"."researchpostings" validate constraint "researchpostings_deptid_fkey";

alter table "public"."researchpostings" add constraint "researchpostings_facultyid_fkey" FOREIGN KEY (facultyid) REFERENCES public.faculty(userid) ON DELETE CASCADE not valid;

alter table "public"."researchpostings" validate constraint "researchpostings_facultyid_fkey";

alter table "public"."skills" add constraint "skills_skillname_key" UNIQUE using index "skills_skillname_key";

alter table "public"."students" add constraint "students_deptid_fkey" FOREIGN KEY (deptid) REFERENCES public.department(deptid) not valid;

alter table "public"."students" validate constraint "students_deptid_fkey";

alter table "public"."students" add constraint "students_userid_fkey" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE not valid;

alter table "public"."students" validate constraint "students_userid_fkey";

alter table "public"."students" add constraint "students_userid_key" UNIQUE using index "students_userid_key";

alter table "public"."studentskills" add constraint "studentskills_skillid_fkey" FOREIGN KEY (skillid) REFERENCES public.skills(skillid) ON DELETE CASCADE not valid;

alter table "public"."studentskills" validate constraint "studentskills_skillid_fkey";

alter table "public"."studentskills" add constraint "studentskills_studentid_fkey" FOREIGN KEY (studentid) REFERENCES public.students(studentid) ON DELETE CASCADE not valid;

alter table "public"."studentskills" validate constraint "studentskills_studentid_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

grant delete on table "public"."applications" to "anon";

grant insert on table "public"."applications" to "anon";

grant references on table "public"."applications" to "anon";

grant select on table "public"."applications" to "anon";

grant trigger on table "public"."applications" to "anon";

grant truncate on table "public"."applications" to "anon";

grant update on table "public"."applications" to "anon";

grant delete on table "public"."applications" to "authenticated";

grant insert on table "public"."applications" to "authenticated";

grant references on table "public"."applications" to "authenticated";

grant select on table "public"."applications" to "authenticated";

grant trigger on table "public"."applications" to "authenticated";

grant truncate on table "public"."applications" to "authenticated";

grant update on table "public"."applications" to "authenticated";

grant delete on table "public"."applications" to "service_role";

grant insert on table "public"."applications" to "service_role";

grant references on table "public"."applications" to "service_role";

grant select on table "public"."applications" to "service_role";

grant trigger on table "public"."applications" to "service_role";

grant truncate on table "public"."applications" to "service_role";

grant update on table "public"."applications" to "service_role";

grant delete on table "public"."assessmentattempts" to "anon";

grant insert on table "public"."assessmentattempts" to "anon";

grant references on table "public"."assessmentattempts" to "anon";

grant select on table "public"."assessmentattempts" to "anon";

grant trigger on table "public"."assessmentattempts" to "anon";

grant truncate on table "public"."assessmentattempts" to "anon";

grant update on table "public"."assessmentattempts" to "anon";

grant delete on table "public"."assessmentattempts" to "authenticated";

grant insert on table "public"."assessmentattempts" to "authenticated";

grant references on table "public"."assessmentattempts" to "authenticated";

grant select on table "public"."assessmentattempts" to "authenticated";

grant trigger on table "public"."assessmentattempts" to "authenticated";

grant truncate on table "public"."assessmentattempts" to "authenticated";

grant update on table "public"."assessmentattempts" to "authenticated";

grant delete on table "public"."assessmentattempts" to "service_role";

grant insert on table "public"."assessmentattempts" to "service_role";

grant references on table "public"."assessmentattempts" to "service_role";

grant select on table "public"."assessmentattempts" to "service_role";

grant trigger on table "public"."assessmentattempts" to "service_role";

grant truncate on table "public"."assessmentattempts" to "service_role";

grant update on table "public"."assessmentattempts" to "service_role";

grant delete on table "public"."assessments" to "anon";

grant insert on table "public"."assessments" to "anon";

grant references on table "public"."assessments" to "anon";

grant select on table "public"."assessments" to "anon";

grant trigger on table "public"."assessments" to "anon";

grant truncate on table "public"."assessments" to "anon";

grant update on table "public"."assessments" to "anon";

grant delete on table "public"."assessments" to "authenticated";

grant insert on table "public"."assessments" to "authenticated";

grant references on table "public"."assessments" to "authenticated";

grant select on table "public"."assessments" to "authenticated";

grant trigger on table "public"."assessments" to "authenticated";

grant truncate on table "public"."assessments" to "authenticated";

grant update on table "public"."assessments" to "authenticated";

grant delete on table "public"."assessments" to "service_role";

grant insert on table "public"."assessments" to "service_role";

grant references on table "public"."assessments" to "service_role";

grant select on table "public"."assessments" to "service_role";

grant trigger on table "public"."assessments" to "service_role";

grant truncate on table "public"."assessments" to "service_role";

grant update on table "public"."assessments" to "service_role";

grant delete on table "public"."department" to "anon";

grant insert on table "public"."department" to "anon";

grant references on table "public"."department" to "anon";

grant select on table "public"."department" to "anon";

grant trigger on table "public"."department" to "anon";

grant truncate on table "public"."department" to "anon";

grant update on table "public"."department" to "anon";

grant delete on table "public"."department" to "authenticated";

grant insert on table "public"."department" to "authenticated";

grant references on table "public"."department" to "authenticated";

grant select on table "public"."department" to "authenticated";

grant trigger on table "public"."department" to "authenticated";

grant truncate on table "public"."department" to "authenticated";

grant update on table "public"."department" to "authenticated";

grant delete on table "public"."department" to "service_role";

grant insert on table "public"."department" to "service_role";

grant references on table "public"."department" to "service_role";

grant select on table "public"."department" to "service_role";

grant trigger on table "public"."department" to "service_role";

grant truncate on table "public"."department" to "service_role";

grant update on table "public"."department" to "service_role";

grant delete on table "public"."faculty" to "anon";

grant insert on table "public"."faculty" to "anon";

grant references on table "public"."faculty" to "anon";

grant select on table "public"."faculty" to "anon";

grant trigger on table "public"."faculty" to "anon";

grant truncate on table "public"."faculty" to "anon";

grant update on table "public"."faculty" to "anon";

grant delete on table "public"."faculty" to "authenticated";

grant insert on table "public"."faculty" to "authenticated";

grant references on table "public"."faculty" to "authenticated";

grant select on table "public"."faculty" to "authenticated";

grant trigger on table "public"."faculty" to "authenticated";

grant truncate on table "public"."faculty" to "authenticated";

grant update on table "public"."faculty" to "authenticated";

grant delete on table "public"."faculty" to "service_role";

grant insert on table "public"."faculty" to "service_role";

grant references on table "public"."faculty" to "service_role";

grant select on table "public"."faculty" to "service_role";

grant trigger on table "public"."faculty" to "service_role";

grant truncate on table "public"."faculty" to "service_role";

grant update on table "public"."faculty" to "service_role";

grant delete on table "public"."postingskills" to "anon";

grant insert on table "public"."postingskills" to "anon";

grant references on table "public"."postingskills" to "anon";

grant select on table "public"."postingskills" to "anon";

grant trigger on table "public"."postingskills" to "anon";

grant truncate on table "public"."postingskills" to "anon";

grant update on table "public"."postingskills" to "anon";

grant delete on table "public"."postingskills" to "authenticated";

grant insert on table "public"."postingskills" to "authenticated";

grant references on table "public"."postingskills" to "authenticated";

grant select on table "public"."postingskills" to "authenticated";

grant trigger on table "public"."postingskills" to "authenticated";

grant truncate on table "public"."postingskills" to "authenticated";

grant update on table "public"."postingskills" to "authenticated";

grant delete on table "public"."postingskills" to "service_role";

grant insert on table "public"."postingskills" to "service_role";

grant references on table "public"."postingskills" to "service_role";

grant select on table "public"."postingskills" to "service_role";

grant trigger on table "public"."postingskills" to "service_role";

grant truncate on table "public"."postingskills" to "service_role";

grant update on table "public"."postingskills" to "service_role";

grant delete on table "public"."questions" to "anon";

grant insert on table "public"."questions" to "anon";

grant references on table "public"."questions" to "anon";

grant select on table "public"."questions" to "anon";

grant trigger on table "public"."questions" to "anon";

grant truncate on table "public"."questions" to "anon";

grant update on table "public"."questions" to "anon";

grant delete on table "public"."questions" to "authenticated";

grant insert on table "public"."questions" to "authenticated";

grant references on table "public"."questions" to "authenticated";

grant select on table "public"."questions" to "authenticated";

grant trigger on table "public"."questions" to "authenticated";

grant truncate on table "public"."questions" to "authenticated";

grant update on table "public"."questions" to "authenticated";

grant delete on table "public"."questions" to "service_role";

grant insert on table "public"."questions" to "service_role";

grant references on table "public"."questions" to "service_role";

grant select on table "public"."questions" to "service_role";

grant trigger on table "public"."questions" to "service_role";

grant truncate on table "public"."questions" to "service_role";

grant update on table "public"."questions" to "service_role";

grant delete on table "public"."researchpostings" to "anon";

grant insert on table "public"."researchpostings" to "anon";

grant references on table "public"."researchpostings" to "anon";

grant select on table "public"."researchpostings" to "anon";

grant trigger on table "public"."researchpostings" to "anon";

grant truncate on table "public"."researchpostings" to "anon";

grant update on table "public"."researchpostings" to "anon";

grant delete on table "public"."researchpostings" to "authenticated";

grant insert on table "public"."researchpostings" to "authenticated";

grant references on table "public"."researchpostings" to "authenticated";

grant select on table "public"."researchpostings" to "authenticated";

grant trigger on table "public"."researchpostings" to "authenticated";

grant truncate on table "public"."researchpostings" to "authenticated";

grant update on table "public"."researchpostings" to "authenticated";

grant delete on table "public"."researchpostings" to "service_role";

grant insert on table "public"."researchpostings" to "service_role";

grant references on table "public"."researchpostings" to "service_role";

grant select on table "public"."researchpostings" to "service_role";

grant trigger on table "public"."researchpostings" to "service_role";

grant truncate on table "public"."researchpostings" to "service_role";

grant update on table "public"."researchpostings" to "service_role";

grant delete on table "public"."skills" to "anon";

grant insert on table "public"."skills" to "anon";

grant references on table "public"."skills" to "anon";

grant select on table "public"."skills" to "anon";

grant trigger on table "public"."skills" to "anon";

grant truncate on table "public"."skills" to "anon";

grant update on table "public"."skills" to "anon";

grant delete on table "public"."skills" to "authenticated";

grant insert on table "public"."skills" to "authenticated";

grant references on table "public"."skills" to "authenticated";

grant select on table "public"."skills" to "authenticated";

grant trigger on table "public"."skills" to "authenticated";

grant truncate on table "public"."skills" to "authenticated";

grant update on table "public"."skills" to "authenticated";

grant delete on table "public"."skills" to "service_role";

grant insert on table "public"."skills" to "service_role";

grant references on table "public"."skills" to "service_role";

grant select on table "public"."skills" to "service_role";

grant trigger on table "public"."skills" to "service_role";

grant truncate on table "public"."skills" to "service_role";

grant update on table "public"."skills" to "service_role";

grant delete on table "public"."students" to "anon";

grant insert on table "public"."students" to "anon";

grant references on table "public"."students" to "anon";

grant select on table "public"."students" to "anon";

grant trigger on table "public"."students" to "anon";

grant truncate on table "public"."students" to "anon";

grant update on table "public"."students" to "anon";

grant delete on table "public"."students" to "authenticated";

grant insert on table "public"."students" to "authenticated";

grant references on table "public"."students" to "authenticated";

grant select on table "public"."students" to "authenticated";

grant trigger on table "public"."students" to "authenticated";

grant truncate on table "public"."students" to "authenticated";

grant update on table "public"."students" to "authenticated";

grant delete on table "public"."students" to "service_role";

grant insert on table "public"."students" to "service_role";

grant references on table "public"."students" to "service_role";

grant select on table "public"."students" to "service_role";

grant trigger on table "public"."students" to "service_role";

grant truncate on table "public"."students" to "service_role";

grant update on table "public"."students" to "service_role";

grant delete on table "public"."studentskills" to "anon";

grant insert on table "public"."studentskills" to "anon";

grant references on table "public"."studentskills" to "anon";

grant select on table "public"."studentskills" to "anon";

grant trigger on table "public"."studentskills" to "anon";

grant truncate on table "public"."studentskills" to "anon";

grant update on table "public"."studentskills" to "anon";

grant delete on table "public"."studentskills" to "authenticated";

grant insert on table "public"."studentskills" to "authenticated";

grant references on table "public"."studentskills" to "authenticated";

grant select on table "public"."studentskills" to "authenticated";

grant trigger on table "public"."studentskills" to "authenticated";

grant truncate on table "public"."studentskills" to "authenticated";

grant update on table "public"."studentskills" to "authenticated";

grant delete on table "public"."studentskills" to "service_role";

grant insert on table "public"."studentskills" to "service_role";

grant references on table "public"."studentskills" to "service_role";

grant select on table "public"."studentskills" to "service_role";

grant trigger on table "public"."studentskills" to "service_role";

grant truncate on table "public"."studentskills" to "service_role";

grant update on table "public"."studentskills" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


