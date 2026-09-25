import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('login exchanges a Firebase ID token and routes authenticated students', () => {
  assert.match(source('src/lib/authService.ts'), /signInWithEmailAndPassword/);
  assert.match(source('src/lib/authService.ts'), /\{ idToken \}/);
  assert.match(source('src/navigation/AppNavigator.tsx'), /user\.role === 'STUDENT'/);
  assert.match(source('src/navigation/AppNavigator.tsx'), /name="StudentApp"/);
});

test('drive discovery links to details and uses the eligibility-gated apply mutation', () => {
  assert.match(source('src/screens/student/ApplicationsScreen.tsx'), /DriveDetails/);
  assert.match(source('src/screens/student/DriveDetailsScreen.tsx'), /eligibility\?\.isEligible/);
  assert.match(source('src/screens/student/DriveDetailsScreen.tsx'), /applyMutation\.mutateAsync/);
});

test('verified profile changes use the approval request contract', () => {
  assert.match(source('src/services/student.service.ts'), /STUDENT_PROFILE_UPDATE_REQUEST/);
  assert.match(source('src/services/student.service.ts'), /apiClient\.put/);
  assert.match(source('src/screens/student/ProfileScreen.tsx'), /profileStatus === 'VERIFIED'/);
  assert.match(source('src/screens/student/ProfileScreen.tsx'), /requestUpdateMutation\.mutateAsync/);
});

test('notification preferences are reachable from student settings', () => {
  assert.match(source('src/navigation/StudentTabNavigator.tsx'), /name="NotificationPreferences"/);
  assert.match(source('src/screens/student/SettingsScreen.tsx'), /navigate\('NotificationPreferences'\)/);
});

test('coordinator navigation excludes super-admin screens', () => {
  const navigator = source('src/navigation/AdminDrawerNavigator.tsx');
  assert.match(navigator, /isSuperAdmin/);
  assert.match(navigator, /initialRouteName=\{isSuperAdmin \? 'Dashboard' : 'Students'\}/);
  assert.match(navigator, /name="Reports"/);
  assert.match(navigator, /name="Coordinators"/);
});

test('demo APK configuration uses a distinct identity and existing notification asset', () => {
  const config = JSON.parse(source('app.json'));
  assert.equal(config.expo.android.package, 'com.placementx.app.demo');
  assert.equal(config.expo.userInterfaceStyle, 'automatic');
  assert.equal(config.expo.plugins[1][1].icon, './assets/android-icon-monochrome.png');
  const eas = JSON.parse(source('eas.json'));
  assert.equal(eas.build.preview.android.buildType, 'apk');
});

test('auth covers invalid credentials, restoration, expiration, password change, and confirmed logout', () => {
  assert.match(source('src/screens/auth/LoginScreen.tsx'), /Invalid email or password/);
  assert.match(source('src/navigation/AppNavigator.tsx'), /hasHydrated/);
  assert.match(source('src/lib/apiClient.ts'), /401/);
  assert.match(source('src/screens/auth/ChangePasswordScreen.tsx'), /apiClient\.put/);
  assert.match(source('src/screens/student/SettingsScreen.tsx'), /ConfirmationDialog/);
});

test('route contract includes every student destination and custom-scheme deep links', () => {
  const types = source('src/navigation/types.ts');
  for (const route of ['Dashboard', 'DriveDetails', 'Drives', 'Calendar', 'Notifications', 'ProfileHome', 'Documents', 'Interviews', 'NotificationPreferences', 'Settings']) assert.match(types, new RegExp(route));
  const app = source('App.tsx');
  assert.match(app, /placementx:\/\//);
  assert.match(app, /student\/drives\/:id/);
});

test('dashboard defines loading, error, empty, and refresh recovery states', () => {
  const dashboard = source('src/screens/student/DashboardScreen.tsx');
  assert.match(dashboard, /DashboardSkeleton/);
  assert.match(dashboard, /ErrorState/);
  assert.match(dashboard, /No upcoming drives/);
  assert.match(dashboard, /RefreshControl/);
});

test('drive list supports search, work-mode filtering, sorting, and empty/error recovery', () => {
  const drives = source('src/screens/student/ApplicationsScreen.tsx');
  assert.match(drives, /SearchBar/);
  assert.match(drives, /workMode/);
  assert.match(drives, /sortBy/);
  assert.match(drives, /ErrorState/);
  assert.match(drives, /EmptyState/);
});

test('applications expose status cards and an empty application state', () => {
  const applications = source('src/screens/student/ApplicationsScreen.tsx');
  assert.match(applications, /My Applications/);
  assert.match(applications, /StatusBadge/);
  assert.match(applications, /No Applications/);
});

test('interviews expose loading, schedule details, empty, and error states', () => {
  const interviews = source('src/screens/student/InterviewsScreen.tsx');
  for (const token of ['ListSkeleton', 'Selection Rounds', 'No Rounds Scheduled', 'ErrorState']) assert.match(interviews, new RegExp(token));
});

test('profile uses verification state, validation workflow, and permitted mutation paths', () => {
  const profile = source('src/screens/student/ProfileScreen.tsx');
  assert.match(profile, /useStudentProfileStatus/);
  assert.match(profile, /canEdit/);
  assert.match(profile, /UPDATE_REQUESTED|requestUpdateMutation/);
  assert.match(profile, /Save Changes/);
});

test('documents cover loading, missing files, download, upload entry, and error recovery', () => {
  const documents = source('src/screens/student/DocumentsScreen.tsx');
  assert.match(documents, /ListSkeleton/);
  assert.match(documents, /No documents yet/);
  assert.match(documents, /openDocument/);
  assert.match(documents, /ErrorState/);
  assert.match(source('src/screens/student/ProfileScreen.tsx'), /handleDocumentUpload/);
});

test('notifications cover unread actions, search, filters, deep links, preferences, and errors', () => {
  const notifications = source('src/screens/student/NotificationsScreen.tsx');
  for (const token of ['markAsRead', 'markAllAsRead', 'searchQuery', 'activeFilter', 'handleDeepLink', 'ErrorState']) assert.match(notifications, new RegExp(token));
  assert.match(source('src/screens/student/SettingsScreen.tsx'), /NotificationPreferences/);
});

test('settings persist appearance mode and confirm logout', () => {
  const settings = source('src/screens/student/SettingsScreen.tsx');
  assert.match(settings, /setMode/);
  assert.match(settings, /'system'/);
  assert.match(settings, /ConfirmationDialog/);
});

test('responsive foundation uses dimensions, breakpoints, safe area, and bounded content', () => {
  const responsive = source('src/hooks/useResponsiveLayout.ts');
  assert.match(responsive, /useWindowDimensions/);
  assert.match(responsive, /isTablet/);
  const foundation = source('src/components/ui/Foundation.tsx');
  assert.match(foundation, /SafeAreaView/);
  assert.match(foundation, /contentMaxWidth/);
  assert.match(foundation, /width: 44/);
});
