import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, GraduationCap, MapPin, Edit, FileText, Calendar, ChevronRight, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, DashboardSkeleton, Button, Input, Toast } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useStudentProfile, useUpdateStudentProfile } from '../../hooks/queries';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuthStore();
  const { data: profile, isLoading, refetch } = useStudentProfile(user?.id);
  const updateMutation = useUpdateStudentProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    skills: '',
    cgpa: '',
  });

  // Effect to initialize form data when profile loads
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        phone: profile.phone || '',
        address: profile.address || '',
        skills: profile.skills?.join(', ') || '',
        cgpa: profile.academics?.cgpa?.toString() || '',
      });
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        userId: user!.id,
        data: {
          phone: formData.phone,
          address: formData.address,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          academics: {
            ...profile?.academics,
            cgpa: parseFloat(formData.cgpa) || profile?.academics?.cgpa,
          }
        }
      });
      setIsEditing(false);
    } catch (error) {
      // Error is handled in the mutation hook
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Profile" />
          <DashboardSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader 
          title="My Profile" 
          rightElement={
            !isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
                <Edit color={theme.colors.primary} size={20} />
              </TouchableOpacity>
            )
          }
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={theme.colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0) || 'S'}
                </Text>
              </View>
            </View>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.role}>{user?.role}</Text>
            
            <View style={styles.badgeContainer}>
              {profile?.department && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{profile.department}</Text>
                </View>
              )}
              {profile?.graduationYear && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Batch of {profile.graduationYear}</Text>
                </View>
              )}
            </View>
          </View>

          {isEditing ? (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Edit Details</Text>
              <View style={styles.formSpace}>
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
                <Input
                  label="Address"
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                />
                <Input
                  label="Skills (comma separated)"
                  value={formData.skills}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, skills: text }))}
                />
                <Input
                  label="CGPA"
                  value={formData.cgpa}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, cgpa: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.editActions}>
                <Button 
                  title="Cancel" 
                  variant="outline" 
                  onPress={() => setIsEditing(false)} 
                  style={styles.actionBtn}
                />
                <Button 
                  title="Save" 
                  onPress={handleSave} 
                  isLoading={updateMutation.isPending}
                  style={styles.actionBtn}
                />
              </View>
            </Card>
          ) : (
            <>
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <Phone size={18} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoText}>{profile?.phone || 'Not provided'}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <MapPin size={18} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoText}>{profile?.address || 'Not provided'}</Text>
                  </View>
                </View>
              </Card>

              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Academic Details</Text>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <GraduationCap size={18} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>CGPA</Text>
                    <Text style={styles.infoText}>{profile?.academics?.cgpa || 'N/A'}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <FileText size={18} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Active Backlogs</Text>
                    <Text style={styles.infoText}>{profile?.academics?.activeBacklogs || 0}</Text>
                  </View>
                </View>
              </Card>
            </>
          )}

          {!isEditing && (
            <View style={styles.navLinks}>
              <TouchableOpacity 
                style={styles.navLinkCard}
                onPress={() => navigation.navigate('Documents')}
                activeOpacity={0.8}
              >
                <View style={styles.navLinkIcon}>
                  <FileText size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.navLinkContent}>
                  <Text style={styles.navLinkTitle}>My Documents</Text>
                  <Text style={styles.navLinkDesc}>Resumes and certificates</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.mutedForeground} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navLinkCard}
                onPress={() => navigation.navigate('Interviews')}
                activeOpacity={0.8}
              >
                <View style={styles.navLinkIcon}>
                  <Briefcase size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.navLinkContent}>
                  <Text style={styles.navLinkTitle}>My Rounds</Text>
                  <Text style={styles.navLinkDesc}>Scheduled assessments</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}
          
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
  scrollContent: {
    padding: theme.spacing[4],
  },
  headerButton: {
    padding: theme.spacing[2],
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 12,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '15',
    marginBottom: theme.spacing[4],
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: theme.colors.mutedForeground,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing[4],
    textTransform: 'capitalize',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeText: {
    color: theme.colors.foreground,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionCard: {
    padding: theme.spacing[5],
    marginBottom: theme.spacing[5],
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[4],
  },
  formSpace: {
    gap: theme.spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
    gap: theme.spacing[4],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.foreground,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
  },
  navLinks: {
    gap: theme.spacing[4],
  },
  navLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[4],
    borderRadius: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  navLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[4],
  },
  navLinkContent: {
    flex: 1,
  },
  navLinkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  navLinkDesc: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
});
