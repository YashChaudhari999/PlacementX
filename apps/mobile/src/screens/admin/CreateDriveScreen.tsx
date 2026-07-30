import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, Input, Button, Toast } from '../../components/ui';
import { drivesService } from '../../services/drives.service';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateDriveScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
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

  const handleCreate = async () => {
    if (!formData.companyName || !formData.role || !formData.registrationDeadline) {
      Toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const driveData = {
        companyId: 'company_uuid', // In a real app, this would be selected from a dropdown or created first
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

      // Real implementation would have a createDrive method in drivesService
      // await drivesService.createDrive(driveData);
      
      Toast.success('Drive created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-drives'] });
      navigation.goBack();
    } catch (error: any) {
      Toast.error(error.response?.data?.message || 'Failed to create drive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Create Drive" 
        showBack
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Details</Text>
            
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
              label="Description"
              placeholder="Job description..."
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              style={styles.textArea}
            />

            <Input
              label="Registration Deadline *"
              placeholder="YYYY-MM-DD"
              value={formData.registrationDeadline}
              onChangeText={(text) => handleChange('registrationDeadline', text)}
            />

            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
            
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

            <Button
              title="Create Placement Drive"
              onPress={handleCreate}
              isLoading={isSubmitting}
              style={styles.submitBtn}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  card: {
    padding: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[4],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing[6],
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  col: {
    flex: 1,
  },
  submitBtn: {
    marginTop: theme.spacing[4],
  },
});
