import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import type { AppTheme } from '../../theme/theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { Card, ScreenHeader, Input, Button, Toast, TabBar } from '../../components/ui';
import { drivesService } from '../../services/drives.service';

const STEPS = ['Basic Info', 'Details', 'Eligibility'];

export default function CreateDriveScreen() {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    description: '',
    jobType: 'FULL_TIME',
    location: '',
    salary: '',
    minimum10thMarks: '',
    minimum12thMarks: '',
    minimumCGPA: '',
    maximumBacklogs: '',
    registrationDeadline: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.companyName || !formData.role) {
        Toast.error('Company Name and Role are required');
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.registrationDeadline) {
        Toast.error('Registration Deadline is required');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      const driveData = {
        companyId: 'company_uuid', // Needs proper company selector in real app
        role: formData.role,
        description: formData.description,
        jobType: formData.jobType,
        location: formData.location,
        salary: Number(formData.salary) || 0,
        registrationDeadline: formData.registrationDeadline,
        eligibilityCriteria: {
          minimum10thMarks: Number(formData.minimum10thMarks) || 0,
          minimum12thMarks: Number(formData.minimum12thMarks) || 0,
          minimumCGPA: Number(formData.minimumCGPA) || 0,
          maximumBacklogs: Number(formData.maximumBacklogs) || 0,
        }
      };

      await drivesService.createDrive(driveData);
      
      Toast.success('Drive created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-drives'] });
      navigation.goBack();
    } catch (error: any) {
      Toast.error(error.response?.data?.message || 'Failed to create drive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Input
              label="Company Name *"
              placeholder="e.g. Google, Microsoft"
              value={formData.companyName}
              onChangeText={(text) => handleChange('companyName', text)}
            />
            <Input
              label="Role *"
              placeholder="e.g. Software Engineer"
              value={formData.role}
              onChangeText={(text) => handleChange('role', text)}
            />
            <Input
              label="Job Type"
              placeholder="FULL_TIME or INTERNSHIP"
              value={formData.jobType}
              onChangeText={(text) => handleChange('jobType', text)}
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Input
              label="Location"
              placeholder="e.g. Bangalore, Remote"
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
            />
            <Input
              label="CTC / Salary (₹)"
              placeholder="e.g. 1500000"
              keyboardType="numeric"
              value={formData.salary}
              onChangeText={(text) => handleChange('salary', text)}
            />
            <Input
              label="Registration Deadline *"
              placeholder="YYYY-MM-DD"
              value={formData.registrationDeadline}
              onChangeText={(text) => handleChange('registrationDeadline', text)}
            />
            <Input
              label="Description"
              placeholder="Job description..."
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              style={styles.textArea}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Min 10th %"
                  keyboardType="numeric"
                  value={formData.minimum10thMarks}
                  onChangeText={(text) => handleChange('minimum10thMarks', text)}
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Min 12th %"
                  keyboardType="numeric"
                  value={formData.minimum12thMarks}
                  onChangeText={(text) => handleChange('minimum12thMarks', text)}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Min CGPA"
                  keyboardType="numeric"
                  value={formData.minimumCGPA}
                  onChangeText={(text) => handleChange('minimumCGPA', text)}
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Max Backlogs"
                  keyboardType="numeric"
                  value={formData.maximumBacklogs}
                  onChangeText={(text) => handleChange('maximumBacklogs', text)}
                />
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Create Drive" showBack />
      
      <View style={styles.stepperHeader}>
        {STEPS.map((step, index) => (
          <React.Fragment key={step}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, currentStep >= index && styles.stepCircleActive]}>
                {currentStep > index ? (
                  <CheckCircle size={14} color="#FFF" />
                ) : (
                  <Text style={[styles.stepNumber, currentStep >= index && styles.stepNumberActive]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepTitle, currentStep >= index && styles.stepTitleActive]}>
                {step}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View style={[styles.stepLine, currentStep > index && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            {renderStep()}
            
            <View style={styles.actionsRow}>
              {currentStep > 0 ? (
                <Button 
                  title="Back" 
                  variant="outline" 
                  onPress={handlePrev} 
                  style={styles.actionBtn}
                  icon={<ChevronLeft size={18} color={theme.colors.primary} />}
                />
              ) : <View style={styles.actionBtn} />}
              
              {currentStep < STEPS.length - 1 ? (
                <Button 
                  title="Next" 
                  onPress={handleNext} 
                  style={styles.actionBtn}
                  iconRight={<ChevronRight size={18} color="#FFF" />}
                />
              ) : (
                <Button 
                  title="Publish Drive" 
                  onPress={handleCreate} 
                  isLoading={isSubmitting}
                  style={styles.actionBtn}
                />
              )}
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardAvoid: { flex: 1 },
  stepperHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing[4], backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  stepIndicator: { alignItems: 'center', width: 80 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  stepCircleActive: { backgroundColor: theme.colors.primary },
  stepNumber: { fontSize: 13, fontWeight: '700', color: theme.colors.mutedForeground },
  stepNumberActive: { color: '#FFF' },
  stepTitle: { fontSize: 11, fontWeight: '600', color: theme.colors.mutedForeground, textAlign: 'center' },
  stepTitleActive: { color: theme.colors.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: theme.colors.border, marginHorizontal: -15, marginTop: -20 },
  stepLineActive: { backgroundColor: theme.colors.primary },
  scrollContent: { padding: theme.spacing[4] },
  card: { padding: theme.spacing[5] },
  stepContainer: { gap: theme.spacing[4], marginBottom: theme.spacing[6] },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: theme.spacing[3] },
  col: { flex: 1 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing[4] },
  actionBtn: { flex: 1, borderRadius: 12 },
});
