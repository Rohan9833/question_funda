# Authentication data model

This branch defines the initial database models for authentication and role-specific profiles.

## User
Common authentication/account fields: name, email, passwordHash, role, profile image, phone, activation and verification state, and last login time.

## StudentProfile
Student-specific academic information linked one-to-one with User.

## TeacherProfile
Teacher-specific professional information linked one-to-one with User.

## Session
Refresh-token sessions with expiry and revocation support for login/logout.

Exam-domain collections such as Question, QuestionPaper, Exam, ExamAttempt, and Result will be added separately.
