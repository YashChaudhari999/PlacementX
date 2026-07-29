import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { DashboardScreen } from './src/screens/student/DashboardScreen';
import { theme } from './src/theme/theme';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <DashboardScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;
