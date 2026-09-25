# Mobile Screen Inventory

Verified against the 22 screen files under `apps/mobile/src/screens` on 2026-09-25.

| Screen | Route / role | Purpose and primary interactions | Components and state contract | API dependency / accessibility |
|---|---|---|---|---|
| Login | `login` / Guest | Email/password sign-in; password-reset email | Input, Button, Card, toast; validation/loading/error feedback | Firebase Auth + `POST /auth/firebase-login`; labeled inputs/button |
| Change password | `change-password` / forced-change user | Change initial/current password | secure inputs, disabled/loading submit, toast | `PUT /auth/password`; password fields expose labels |
| Dashboard | `student` / Student | Open featured drives, search entry, profile and notifications | skeleton, loaded list, empty, retry error, refresh | published drives + profile; icon actions require labels in follow-up audit |
| Drives & applications | `student/drives` / Student | Search, work-mode filter, deadline/package sort, switch all/applied, open details | SearchBar, Tabs, FilterChip, FlatList, status card; loading/empty/error/refresh | drives + applications; chips expose selected state |
| Drive details | `student/drives/:id` / Student | Review role/eligibility and apply | header, status, loading/error, eligibility CTA and mutation feedback | drive + eligibility + apply; CTA disabled while pending |
| Calendar | `student/calendar` / Student | Browse dated drive/interview events | month navigation, loading/empty/error/refresh | calendar `{ events }`; status not color-only |
| Notifications | `student/notifications` / Student | Search/filter/read/archive/delete/open related content | infinite FlatList, unread badge, loading/empty/error/pagination | notification APIs + deep-link service; unread text/badge |
| Profile | `student/profile` / Student | View/edit logical sections, upload PDFs, request verified-profile changes | tabs, inputs, loading/error, verification state, mutation progress | profile + status + update request + document upload; status has icon/text |
| Documents | `student/documents` / Student | Open academic records and offer letters | FlatList cards, skeleton/empty/error/refresh | `/student/documents`; document actions labeled |
| Interviews | `student/interviews` / Student | Review rounds, dates, time, venue/platform | list cards, skeleton/empty/error/refresh | student interviews; status uses text badge |
| Student settings | `student/settings` / Student | Theme, notification preferences, support, confirmed logout | PageHeader, SurfaceCard, radio choices, dialog | persisted local theme + navigation; radio state and labels |
| Notification preferences | `student/settings/notifications` / Student | Select notification delivery preferences | switches/controls with loading and mutation feedback | notification preference query/mutation; labeled controls |
| Admin dashboard | `admin` / Super admin | Review operational metrics and open drives | skeleton/error/refresh, metric cards | admin dashboard; drawer/action buttons |
| Admin drives | nested drawer / Super admin | Search/list/create/open drives | search, FlatList, skeleton/empty/error/refresh | admin drives; create/detail controls |
| Create drive | nested admin / Super admin | Step through drive creation with validation | progressive form, submit loading/toast | drive create mutation; labeled inputs |
| Admin drive details | nested admin / Super admin | Review live company, role, package, applications and rounds | PageHeader, SurfaceCard, loading/error, partial sections | drive details; icon+label fact rows |
| Admin students | `admin/students` / Super admin, Coordinator | Search students, review pending profiles, approve/reject | tabs, search, cards, loading/empty/error; mutation state | scoped student/pending/verify APIs; action text and status labels |
| Admin calendar | `admin/calendar` / Super admin | Review placement timeline and summary | skeleton/error/refresh, timeline/empty handling | admin calendar; icon+text event type |
| Admin reports | `admin/reports` / Super admin | Review available KPI metrics | skeleton/error/refresh, metrics | `/admin/reports/kpis`; no fake export action |
| Admin notifications | `admin/notifications` / Super admin | Search/filter/read/archive/delete/broadcast | infinite list, error/pagination, composer validation/loading | notification APIs + broadcast; labeled form controls |
| Coordinators | `admin/coordinators` / Super admin | Search and review coordinator accounts | search, FlatList, skeleton/empty/error | coordinator API; no fake add action |
| Admin settings | `admin/settings` / Admin roles | Theme, password, logout; coordinator management for super admin | cards, labeled inputs, radio choices, dialog | `PUT /auth/password`; role-sensitive action registration |

All screen files are routed. The formerly orphaned coordinator-management and notification-preference screens are registered. Native screen-reader/device verification remains a release QA task rather than a claimed pass.
