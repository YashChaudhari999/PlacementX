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

test('admin navigation excludes the removed coordinator page', () => {
  const navigator = source('src/navigation/AdminDrawerNavigator.tsx');
  assert.match(navigator, /isSuperAdmin/);
  assert.match(navigator, /initialRouteName=\{isSuperAdmin \? 'Dashboard' : 'Students'\}/);
  assert.match(navigator, /name="Reports"/);
  assert.doesNotMatch(navigator, /name="Coordinators"/);
});

test('demo APK configuration uses a distinct identity and existing notification asset', () => {
  const config = JSON.parse(source('app.json'));
  assert.equal(config.expo.android.package, 'com.placementx.app.demo');
  assert.equal(config.expo.name, 'PlacementX');
  assert.equal(config.expo.icon, './assets/nmims-placementx-launcher-icon.png');
  assert.equal(config.expo.android.adaptiveIcon.foregroundImage, './assets/nmims-placementx-launcher-icon.png');
  assert.equal(config.expo.android.adaptiveIcon.backgroundColor, '#F9F6EF');
  assert.equal(config.expo.android.adaptiveIcon.backgroundImage, undefined);
  assert.equal(config.expo.userInterfaceStyle, 'automatic');
  assert.equal(config.expo.plugins[1][1].icon, './assets/android-icon-monochrome.png');
  const eas = JSON.parse(source('eas.json'));
  assert.equal(eas.build.preview.android.buildType, 'apk');
});

test('standalone APK has Firebase client configuration when build env is absent', () => {
  const firebase = source('src/lib/firebaseApp.ts');
  assert.match(firebase, /EXPO_PUBLIC_FIREBASE_API_KEY \|\| 'AIza/);
  assert.match(firebase, /EXPO_PUBLIC_FIREBASE_PROJECT_ID \|\| 'placementx-a3f1d'/);
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
  assert.match(app, /https:\/\/placementx-v1\.vercel\.app/);
  assert.match(app, /DriveDetails: 'drives\/:id'/);
  assert.match(app, /setPendingDriveId/);
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
  assert.match(drives, /filterScroll: \{ flexGrow: 0, flexShrink: 0 \}/);
  assert.match(drives, /filterRow: \{ alignItems: 'center'/);
});

test('applications expose status cards and an empty application state', () => {
  const applications = source('src/screens/student/ApplicationsScreen.tsx');
  assert.match(applications, /My Applications/);
  assert.match(applications, /StatusBadge/);
  assert.match(applications, /No Applications/);
  assert.doesNotMatch(applications, /â‚¹/);
  assert.match(applications, /LPA/);
  assert.doesNotMatch(applications, /`₹\$\{drive\.fixedSalary/);
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

test('theme preferences are account-scoped and authentication stays light', () => {
  const provider = source('src/theme/ThemeProvider.tsx');
  assert.match(provider, /placementx-theme-mode:/);
  assert.match(provider, /user\?\.id/);
  assert.match(provider, /isAuthenticated && !mustChangePassword/);
  assert.match(provider, /accountId && loadedAccountId === accountId \? mode : 'light'/);
  assert.match(provider, /if \(!accountId\) return/);
  assert.doesNotMatch(provider, /const STORAGE_KEY = 'placementx-theme-mode'/);
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

test('forms keep focused inputs visible during keyboard transitions', () => {
  const keyboardAware = source('src/components/ui/KeyboardAwareScrollView.tsx');
  const input = source('src/components/ui/Input.tsx');
  const config = JSON.parse(source('app.json'));
  assert.match(keyboardAware, /scrollResponderScrollNativeHandleToKeyboard/);
  assert.match(keyboardAware, /Keyboard\.scheduleLayoutAnimation/);
  assert.match(keyboardAware, /keyboardDismissMode/);
  assert.match(input, /revealInput\(inputRef\.current\)/);
  assert.equal(config.expo.android.softwareKeyboardLayoutMode, 'resize');
  for (const screen of [
    'src/screens/auth/LoginScreen.tsx',
    'src/screens/auth/ChangePasswordScreen.tsx',
    'src/screens/student/ProfileScreen.tsx',
    'src/screens/admin/CreateDriveScreen.tsx',
    'src/screens/admin/AdminSettingsScreen.tsx',
    'src/screens/admin/AdminNotificationsScreen.tsx',
  ]) assert.match(source(screen), /KeyboardAwareScrollView/);
});
test('student primary navigation separates drives and applications while retaining notification routing', () => {
  const navigator = source('src/navigation/StudentTabNavigator.tsx');
  assert.doesNotMatch(navigator, /\/>[ \t]+<Tab\.Screen/);
  assert.match(navigator, /name="Applications"/);
  assert.match(navigator, /name="Notifications"/);
  assert.match(navigator, /tabBarButton: \(\) => null/);
  assert.match(source('App.tsx'), /Applications: 'student\/applications'/);
});

test('notification lifecycle uses real tokens and role-aware destinations', () => {
  const push = source('src/services/pushNotification.service.ts');
  const hook = source('src/hooks/usePushNotifications.ts');
  const deepLinks = source('src/services/deepLink.service.ts');
  assert.doesNotMatch(push, /mock-token-for-expo-go/);
  assert.match(hook, /setPushToken\(pushToken\)/);
  assert.match(hook, /getSocketStatus\(\)/);
  assert.match(deepLinks, /useAuthStore\.getState\(\)\.user\?\.role/);
});

test('dashboard surfaces real unread and profile status', () => {
  const dashboard = source('src/screens/student/DashboardScreen.tsx');
  assert.match(dashboard, /unreadCount > 0/);
  assert.match(dashboard, /Complete your profile/);
  assert.match(dashboard, /Profile verified/);
  assert.match(dashboard, /\[user\?\.firstName, user\?\.lastName\]/);
  assert.match(dashboard, /\[profile\?\.firstName, profile\?\.lastName\]/);
  assert.match(dashboard, /\.toUpperCase\(\)/);
  assert.match(dashboard, /Hello, \{studentName\}/);
});

test('unverified students are sent to the website profile verification flow', () => {
  const api = source('src/config/api.ts');
  assert.match(api, /https:\/\/placementx-v1\.vercel\.app\/student\/profile/);
  for (const screen of [
    'src/screens/student/DashboardScreen.tsx',
    'src/screens/student/ApplicationsScreen.tsx',
  ]) {
    const content = source(screen);
    assert.match(content, /Linking\.openURL\(PLACEMENTX_PROFILE_URL\)/);
    assert.match(content, /submit it to the placement cell for verification/);
    assert.match(content, /Open PlacementX Website/);
  }
});

test('password recovery uses the backend OTP flow without persistent reset secrets', () => {
  const service = source('src/lib/authService.ts');
  const screen = source('src/screens/auth/PasswordResetScreen.tsx');
  const routes = source('src/navigation/AuthStack.tsx');
  assert.match(service, /PASSWORD_RESET_REQUEST/);
  assert.match(service, /PASSWORD_RESET_VERIFY/);
  assert.match(service, /PASSWORD_RESET_CONFIRM/);
  assert.doesNotMatch(service, /sendPasswordResetEmail/);
  assert.match(screen, /one-time-code/);
  assert.match(screen, /newPassword\.length < 12/);
  assert.doesNotMatch(screen, /AsyncStorage|SecureStore/);
  assert.match(routes, /name="PasswordReset"/);
});
