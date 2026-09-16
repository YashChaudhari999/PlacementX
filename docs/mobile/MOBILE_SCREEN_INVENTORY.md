# Mobile Screen Inventory

| Screen | Route | Role | Purpose | API | Actions | Status |
|---|---|---|---|---|---|---|
| LoginScreen | `auth/login` | Guest | User authentication | `POST /auth/login` | Login, View Password | ✅ PASS |
| DashboardScreen | `student/dashboard` | Student | Overview of active tasks and metrics | `GET /student/dashboard` | Navigate to modules | ✅ PASS |
| ProfileScreen | `student/profile` | Student | Profile management | `GET /student/profile`, `PUT /student/profile` | View, Edit, Save | ✅ PASS |
| DrivesListScreen | `student/drives` | Student | Browse active drives | `GET /student/drives` | Search, View Details | ✅ PASS |
| DriveDetailsScreen | `student/drives/:id` | Student | View drive info and apply | `GET /admin/drives/:id`, `POST /student/applications` | Apply, Back | ✅ PASS |
| ApplicationsScreen | `student/applications` | Student | Track applied drives | `GET /student/applications` | View Status | ✅ PASS |
| CalendarScreen | `student/calendar` | Student | View scheduled events and interviews | `GET /admin/calendar` | Switch dates | ✅ PASS |
| NotificationsScreen | `student/notifications` | Student | View real-time alerts | `GET /notifications` | Read, Click | ✅ PASS |
| SettingsScreen | `student/settings` | Student | Manage app preferences and logout | `PUT /notifications/preferences` | Toggle push, Logout | ✅ PASS |
