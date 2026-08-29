import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Building, MapPin, Calendar, Clock, DollarSign, Briefcase, CheckCircle2, XCircle } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, StatusBadge, Button, Toast } from '../../components/ui';
import { useDriveDetails, useCheckEligibility, useApplyForDrive } from '../../hooks/queries';

const { width } = Dimensions.get('window');

export default function DriveDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const driveId = route.params?.id;

  const { data: drive, isLoading: loadingDrive } = useDriveDetails(driveId);
  const { data: eligibility, isLoading: loadingEligibility } = useCheckEligibility(driveId);
  const applyMutation = useApplyForDrive();

  const handleApply = async () => {
    if (!eligibility?.isEligible) {
      Toast.error(eligibility?.reasons?.[0] || 'Not eligible for this drive');
      return;
    }
    
    try {
      await applyMutation.mutateAsync(driveId);
      Toast.success('Successfully applied for the drive');
    } catch (error: any) {
      Toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  if (loadingDrive) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Drive Details" showBack />
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!drive) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Drive Details" showBack />
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>Drive not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Drive Details" showBack />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={styles.heroSection}>
            <View style={styles.heroLogoContainer}>
              <Text style={styles.heroLogoText}>
                {drive.company?.name ? drive.company.name.charAt(0).toUpperCase() : 'C'}
              </Text>
            </View>
            <StatusBadge status={drive.status} />
            <Text style={styles.heroCompanyName}>{drive.company?.name || 'Unknown Company'}</Text>
            <Text style={styles.heroRole}>{drive.jobRole || 'Role TBA'}</Text>
          </View>

          <Card style={styles.quickInfoCard}>
            <View style={styles.quickInfoGrid}>
              <View style={styles.quickInfoItem}>
                <View style={styles.quickInfoIconBox}>
                  <MapPin size={18} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.quickInfoLabel}>Location</Text>
                  <Text style={styles.quickInfoValue}>{drive.location || 'TBA'}</Text>
                </View>
              </View>
              
              <View style={styles.quickInfoDivider} />
              
              <View style={styles.quickInfoItem}>
                <View style={styles.quickInfoIconBox}>
                  <DollarSign size={18} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.quickInfoLabel}>Package</Text>
                  <Text style={styles.quickInfoValue}>{drive.fixedSalary ? `₹${drive.fixedSalary.toLocaleString()}` : 'TBA'}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Eligibility Card */}
          {drive.status === 'PUBLISHED' && (
            <View style={styles.eligibilityWrapper}>
              <View style={styles.eligibilityHeaderRow}>
                <Text style={styles.sectionTitle}>Application Status</Text>
              </View>
              
              {loadingEligibility ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 20 }} />
              ) : eligibility?.isEligible ? (
                <View style={styles.eligibleBox}>
                  <View style={styles.eligibleIconRow}>
                    <CheckCircle2 size={20} color={theme.colors.success} />
                    <Text style={styles.eligibleText}>You are eligible to apply</Text>
                  </View>
                  <Button 
                    title="Apply Now" 
                    onPress={handleApply}
                    disabled={applyMutation.isPending}
                    isLoading={applyMutation.isPending}
                    style={styles.applyButton}
                  />
                </View>
              ) : (
                <View style={styles.notEligibleBox}>
                  <View style={styles.eligibleIconRow}>
                    <XCircle size={20} color={theme.colors.destructive} />
                    <Text style={styles.notEligibleText}>Not Eligible</Text>
                  </View>
                  <Text style={styles.notEligibleReason}>{eligibility?.reasons?.[0]}</Text>
                </View>
              )}
            </View>
          )}

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Role</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {drive.jobDescription || drive.remarks || 'No detailed description has been provided for this drive yet.'}
              </Text>
            </View>
          </View>

          {/* Requirements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
            <View style={styles.criteriaGrid}>
              <View style={styles.criteriaTile}>
                <Text style={styles.criteriaLabel}>Min CGPA</Text>
                <Text style={styles.criteriaValue}>{drive.minimumCgpa || 'N/A'}</Text>
              </View>
              <View style={styles.criteriaTile}>
                <Text style={styles.criteriaLabel}>Passing Year</Text>
                <Text style={styles.criteriaValue}>{drive.passingYear || 'N/A'}</Text>
              </View>
              <View style={styles.criteriaTile}>
                <Text style={styles.criteriaLabel}>Backlogs</Text>
                <Text style={styles.criteriaValue}>{drive.activeBacklogsAllowed !== undefined ? drive.activeBacklogsAllowed : 'N/A'}</Text>
              </View>
              <View style={styles.criteriaTile}>
                <Text style={styles.criteriaLabel}>Gap Years</Text>
                <Text style={styles.criteriaValue}>{drive.maximumGapYears !== undefined ? drive.maximumGapYears : 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Dates Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineCard}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIconBox}>
                  <Calendar size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={styles.timelineLabel}>Registration Deadline</Text>
                  <Text style={styles.timelineValue}>
                    {drive.registrationEnd ? new Date(drive.registrationEnd).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'TBA'}
                  </Text>
                </View>
              </View>
              
              {drive.assessments && drive.assessments.length > 0 && (
                <>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineIconBox}>
                      <Clock size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.timelineTextContainer}>
                      <Text style={styles.timelineLabel}>First Assessment</Text>
                      <Text style={styles.timelineValue}>
                        {new Date(drive.assessments[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
          
          <View style={{ height: theme.spacing[8] }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: 16,
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
  },
  heroLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  heroLogoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  heroCompanyName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.foreground,
    marginTop: theme.spacing[3],
    marginBottom: 4,
    textAlign: 'center',
  },
  heroRole: {
    fontSize: 16,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickInfoCard: {
    padding: 0,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: theme.spacing[6],
  },
  quickInfoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  quickInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
  },
  quickInfoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.foreground,
  },
  quickInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  eligibilityWrapper: {
    marginBottom: theme.spacing[6],
  },
  eligibilityHeaderRow: {
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[3],
  },
  eligibleBox: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[5],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  eligibleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  eligibleText: {
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: 16,
  },
  notEligibleBox: {
    backgroundColor: theme.colors.destructive + '0A',
    padding: theme.spacing[5],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.destructive + '30',
    alignItems: 'center',
  },
  notEligibleText: {
    color: theme.colors.destructive,
    fontWeight: '700',
    fontSize: 16,
  },
  notEligibleReason: {
    color: theme.colors.destructive,
    fontSize: 14,
    marginTop: theme.spacing[2],
    textAlign: 'center',
  },
  applyButton: {
    borderRadius: 12,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[5],
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 15,
    color: theme.colors.foreground,
    lineHeight: 24,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  criteriaTile: {
    width: (width - theme.spacing[4] * 2 - theme.spacing[3]) / 2,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[4],
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  criteriaLabel: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginBottom: 6,
  },
  criteriaValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.foreground,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  timelineIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.border,
    marginLeft: 19, // center under the 40px icon box
    marginVertical: 4,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.foreground,
  },
});
