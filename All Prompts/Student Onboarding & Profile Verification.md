# Student Onboarding & Profile Verification Flow Prompt for Antigravity

You are designing a **modern, production-ready Placement Management System** for **NMIMS Shirpur**.

Your task is to build the complete **Student Onboarding and Profile Verification workflow** with an exceptional UI/UX, enterprise-grade architecture, and reusable component system.

---

# Design Requirements

Before generating any page:

* Design every page at **Figma-quality**.
* Follow a consistent Design System.
* Maintain visual consistency throughout the platform.
* Use reusable UI components only.
* Prioritize accessibility (WCAG).
* Build responsive layouts for Desktop, Tablet, and Mobile.
* Maintain excellent ergonomics and user experience.
* Use smooth animations and transitions.
* Follow modern SaaS dashboard aesthetics.
* Use loading skeletons wherever API data is fetched.
* Include proper empty states, error states, success states, and validation states.
* Design every interaction professionally.

Color Theme

Primary Maroon: #8B0000

Secondary Red: #9B1B1B

Professional Navy: #1C3D58

Charcoal: #2B2B2B

White: #FFFFFF

Light Background: #EFEFEF

Light Gray: #DCDCDC

Body Text: #1A1A1A

---

# Student Registration Flow

The onboarding process should be mandatory for every student before they can access placement opportunities.

Flow:

Login
↓

Basic Registration
↓

Resume Upload
↓

AI Resume Parsing
↓

Auto Profile Generation
↓

Student Review
↓

Document Upload
↓

Submit for Verification
↓

Placement Cell Verification
↓

Approved / Changes Required / Rejected
↓

Placement Dashboard Access

---

# Step 1 — Login

Allow students to authenticate using:

* NMIMS Email
* Student ID
* Password
* OTP (optional)

After successful authentication:

If profile is incomplete

Redirect to Student Onboarding.

Students should not access the dashboard until onboarding is completed.

---

# Step 2 — Basic Registration

Create a professional multi-step registration form.

Collect:

Personal Information

* Full Name
* Student ID
* NMIMS Email
* Personal Email
* Mobile Number
* Date of Birth
* Gender

Academic Information

* Program
* Branch
* Current Semester
* Graduation Year
* Current CGPA
* Active Backlogs
* Tenth Percentage
* Twelfth Percentage / Diploma Percentage

Professional Links

* LinkedIn
* GitHub
* Portfolio Website
* LeetCode
* HackerRank
* CodeChef
* Codeforces

Validation

Every field should have

* Real-time validation
* Error messages
* Success indication

---

# Step 3 — Resume Upload

Create a beautiful Resume Upload page.

Requirements

* Drag & Drop Upload
* Browse Files Button
* PDF Only
* Maximum File Size
* Upload Progress Indicator
* Preview Uploaded Resume
* Replace Resume
* Delete Resume

Show upload animation.

After upload, automatically start AI parsing.

---

# Step 4 — AI Resume Parsing

Display a professional processing screen.

Show progress animation.

Example

Uploading Resume

↓

Extracting Information

↓

Reading Education

↓

Reading Skills

↓

Reading Projects

↓

Reading Experience

↓

Generating Student Profile

↓

Completed

---

Automatically extract

Personal Information

* Name
* Email
* Phone
* LinkedIn
* GitHub

Education

* College
* Degree
* Branch
* CGPA
* Graduation Year

Technical Skills

Programming Languages

Frameworks

Libraries

Tools

Databases

Cloud Technologies

Projects

For every project

* Title
* Description
* Technology Stack
* GitHub Link
* Live Link

Experience

Internships

Work Experience

Leadership

Certifications

Achievements

Publications

Languages

Soft Skills

Resume Score

ATS Score

Profile Completeness

Missing Information

Confidence Score for extracted fields

---

# Step 5 — Auto Generated Student Profile

Automatically populate the student profile using AI.

Display editable cards.

Examples

Personal Information

Education

Skills

Projects

Experience

Certifications

Achievements

Professional Links

Each section should contain

Edit Button

Save Button

Cancel Button

Add New Button

Delete Button

Students must be able to correct AI extraction errors before submission.

---

# Step 6 — Document Upload

Require supporting documents.

Required Documents

College ID

Current Resume

Latest Marksheet

Optional Documents

Internship Certificate

Certification PDFs

Hackathon Certificates

Achievements

Portfolio PDF

Each uploaded document should display

Preview

Download

Replace

Delete

Upload Status

---

# Step 7 — Profile Completeness

Display a professional completion widget.

Example

Profile Completeness

92%

Missing

Portfolio

Certification

GitHub

Resume Updated

Suggest improvements using AI.

---

# Step 8 — Submit for Verification

After student confirms all information

Display

Review Summary

↓

Declaration Checkbox

↓

Submit Profile

↓

Status becomes

Pending Verification

After submission

Lock all verified academic information.

Students cannot edit the profile while verification is pending.

---

# Placement Cell Verification Dashboard

Create a powerful admin verification interface.

Display

Student Name

Student ID

Department

CGPA

Verification Status

Resume

Profile Completeness

Verification Progress

Search

Filters

Sort

Pagination

---

# Student Verification Screen

Split layout.

Left Side

Resume PDF Viewer

Right Side

Extracted Profile

Sections

Personal Information

Education

Projects

Skills

Experience

Achievements

Certifications

Professional Links

Documents

---

# Verification Checklist

Placement officers should verify

Student Name

Student ID

Branch

Semester

Graduation Year

CGPA

Backlogs

Projects

Skills

Internships

Certifications

Documents

LinkedIn

GitHub

Portfolio

Every item should contain

Verified

Not Verified

Needs Correction

---

# Placement Cell Actions

Provide three primary actions

Approve Profile

Reject Profile

Request Changes

When requesting changes

Placement Cell must provide

Reason

Affected Section

Comments

Deadline for Resubmission

Students receive instant notifications.

---

# Student Notification Flow

Notify students when

Resume Uploaded

Profile Generated

Profile Submitted

Verification Started

Changes Requested

Profile Approved

Profile Rejected

Notifications

In-App

Email

Push Notification (Mobile)

---

# Student Dashboard Access Rules

If profile is

Pending

Dashboard access is limited.

Verified

Full access to placement portal.

Rejected

Student must resubmit.

Changes Required

Student can edit only requested sections.

---

# Security

Students cannot modify verified fields.

Every profile edit should create an audit log.

Track

Old Value

New Value

Modified By

Modified Time

Verification History

Admin Comments

---

# AI Features

Integrate intelligent automation throughout the onboarding flow.

* AI Resume Parsing
* OCR for uploaded documents
* Automatic profile creation
* Resume ATS scoring
* Resume completeness analysis
* Skill extraction
* Project categorization
* Internship detection
* Certification detection
* Duplicate profile detection
* Missing information suggestions
* Smart validation against resume content
* AI-powered profile quality score

---

# Backend Workflow

Student Login

↓

Basic Registration

↓

Resume Upload

↓

AI Resume Parsing

↓

Extract Structured Data

↓

Auto Generate Profile

↓

Student Review & Edit

↓

Upload Supporting Documents

↓

Submit for Verification

↓

Placement Cell Review

↓

Approve / Request Changes / Reject

↓

Verified Student Profile

↓

Eligible for Placement Drives

---

# Technical Requirements

* Component-based architecture.
* React + TypeScript frontend.
* Responsive layouts.
* REST API integration.
* Secure file upload.
* Resume parsing service integration.
* Role-based access control (Student and Placement Cell).
* Optimistic UI updates where appropriate.
* Form autosave.
* Client-side and server-side validation.
* Audit logging for all profile changes.

---

# Expected Outcome

Generate a complete, production-ready onboarding and verification module with:

* Premium Figma-quality UI.
* Smooth multi-step onboarding experience.
* AI-assisted resume parsing and profile generation.
* Professional verification workflow for the Placement Cell.
* Secure approval process with audit history.
* Highly reusable components and scalable architecture suitable for an enterprise Placement Management System.
