import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, MapPin, GraduationCap, FileText, Briefcase, ChevronRight, CheckCircle, AlertCircle, Upload, Save, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, DashboardSkeleton, Button, Input, Toast, TabBar } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useStudentProfile, useUpdateStudentProfile } from '../../hooks/queries';
import apiClient from '../../lib/apiClient';
import { API_ENDPOINTS } from '../../config/api';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuthStore();
  const { data: profile, isLoading, refetch } = useStudentProfile();
  const updateMutation = useUpdateStudentProfile();

  const [activeTab, setActiveTab] = useState('Personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    // Personal
    phone: '',
    alternatePhone: '',
    address: '',
    category: '',
    
    // Academic
    tenthPercentage: '',
    twelfthPercentage: '',
    diplomaPercentage: '',
    currentSemester: '',
    cgpa: '',
    activeBacklogs: '',
    totalBacklogs: '',
    
    // Professional
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        phone: profile.phone || '',
        alternatePhone: profile.alternatePhone || '',
        address: profile.address || '',
        category: profile.category || '',
        
        tenthPercentage: profile.tenthPercentage?.toString() || '',
        twelfthPercentage: profile.twelfthPercentage?.toString() || '',
        diplomaPercentage: profile.diplomaPercentage?.toString() || '',
        currentSemester: profile.currentSemester?.toString() || '',
        cgpa: profile.cgpa?.toString() || profile.academics?.cgpa?.toString() || '',
        activeBacklogs: profile.activeBacklogs?.toString() || profile.academics?.activeBacklogs?.toString() || '0',
        totalBacklogs: profile.totalBacklogs?.toString() || '0',
        
        skills: profile.skills ? profile.skills.join(', ') : '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
      });
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
          phone: formData.phone,
          alternatePhone: formData.alternatePhone,
          address: formData.address,
          category: formData.category,
          
          tenthPercentage: formData.tenthPercentage || undefined,
          twelfthPercentage: formData.twelfthPercentage || undefined,
          diplomaPercentage: formData.diplomaPercentage || undefined,
          currentSemester: formData.currentSemester || undefined,
          cgpa: formData.cgpa || undefined,
          activeBacklogs: formData.activeBacklogs || '0',
          totalBacklogs: formData.totalBacklogs || '0',
          
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          portfolioUrl: formData.portfolioUrl,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDocumentUpload = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      const file = result.assets[0];
      
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf'
      } as any);
      formData.append('type', docType);

      setIsUploading(true);
      await apiClient.post('/student/documents/academic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Toast.success(`${docType} uploaded successfully`);
      refetch();
    } catch (error: any) {
      Toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
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

  const renderPersonalFields = () => (
    <View style={styles.formSpace}>
      <Input label="Phone Number" value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})} keyboardType="phone-pad" />
      <Input label="Alternate Phone" value={formData.alternatePhone} onChangeText={(t) => setFormData({...formData, alternatePhone: t})} keyboardType="phone-pad" />
      <Input label="Address" value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})} multiline />
      <Input label="Category (Gen/OBC/SC/ST)" value={formData.category} onChangeText={(t) => setFormData({...formData, category: t})} />
    </View>
  );

  const renderAcademicFields = () => (
    <View style={styles.formSpace}>
      <Input label="10th Percentage" value={formData.tenthPercentage} onChangeText={(t) => setFormData({...formData, tenthPercentage: t})} keyboardType="numeric" />
      <Input label="12th Percentage" value={formData.twelfthPercentage} onChangeText={(t) => setFormData({...formData, twelfthPercentage: t})} keyboardType="numeric" />
      <Input label="Diploma Percentage (If applicable)" value={formData.diplomaPercentage} onChangeText={(t) => setFormData({...formData, diplomaPercentage: t})} keyboardType="numeric" />
      <Input label="Current Semester" value={formData.currentSemester} onChangeText={(t) => setFormData({...formData, currentSemester: t})} keyboardType="numeric" />
      <Input label="Current CGPA" value={formData.cgpa} onChangeText={(t) => setFormData({...formData, cgpa: t})} keyboardType="numeric" />
      <Input label="Active Backlogs" value={formData.activeBacklogs} onChangeText={(t) => setFormData({...formData, activeBacklogs: t})} keyboardType="numeric" />
      <Input label="Total Backlogs History" value={formData.totalBacklogs} onChangeText={(t) => setFormData({...formData, totalBacklogs: t})} keyboardType="numeric" />
    </View>
  );

  const renderProfessionalFields = () => (
    <View style={styles.formSpace}>
      <Input label="Skills (comma separated)" value={formData.skills} onChangeText={(t) => setFormData({...formData, skills: t})} multiline />
      <Input label="LinkedIn URL" value={formData.linkedinUrl} onChangeText={(t) => setFormData({...formData, linkedinUrl: t})} keyboardType="url" autoCapitalize="none" />
      <Input label="GitHub URL" value={formData.githubUrl} onChangeText={(t) => setFormData({...formData, githubUrl: t})} keyboardType="url" autoCapitalize="none" />
      <Input label="Portfolio URL" value={formData.portfolioUrl} onChangeText={(t) => setFormData({...formData, portfolioUrl: t})} keyboardType="url" autoCapitalize="none" />
      
      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <Button 
          title="Upload Resume (PDF)" 
          variant="outline" 
          icon={<Upload size={18} color={theme.colors.primary} />} 
          onPress={() => handleDocumentUpload('Resume')}
          isLoading={isUploading}
        />
        <View style={{height: 10}} />
        <Button 
          title="Upload Consolidated Marksheet (PDF)" 
          variant="outline" 
          icon={<Upload size={18} color={theme.colors.primary} />} 
          onPress={() => handleDocumentUpload('Marksheet')}
          isLoading={isUploading}
        />
        

      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="My Profile" />
        
        <TabBar 
          tabs={['Personal', 'Academic', 'Professional']}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={theme.colors.primary} />}
            showsVerticalScrollIndicator={false}
          >
            {/* Header section always visible at top */}
            <View style={styles.profileHeaderCard}>
              <View style={styles.avatarGlow}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'S'}</Text>
                </View>
              </View>
              <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              
              {!user?.isProfileComplete ? (
                <View style={styles.incompleteWarning}>
                  <AlertCircle size={16} color={theme.colors.destructive} />
                  <Text style={styles.incompleteText}>Profile Incomplete</Text>
                </View>
              ) : (
                <View style={[styles.incompleteWarning, { backgroundColor: (theme.colors.success + "15") }]}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  <Text style={[styles.incompleteText, { color: theme.colors.success }]}>Profile Verified</Text>
                </View>
              )}
            </View>

            {/* Editable Form Card */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{activeTab} Details</Text>
                {!user?.isProfileComplete && (
                  !isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.editBtn}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {!isEditing ? (
                <View style={styles.readOnlyContainer}>
                  {!user?.isProfileComplete ? (
                    <Text style={styles.readOnlyHint}>Tap "Edit" to update these details.</Text>
                  ) : (
                    <Text style={styles.readOnlyHint}>Your profile is verified and locked. Contact the placement cell to request changes.</Text>
                  )}
                  {activeTab === 'Personal' && (
                     <>
                       <Text style={styles.label}>Phone Number</Text><Text style={styles.value}>{profile?.phone || 'N/A'}</Text>
                       <Text style={styles.label}>Alternate Phone</Text><Text style={styles.value}>{profile?.alternatePhone || 'N/A'}</Text>
                       <Text style={styles.label}>Address</Text><Text style={styles.value}>{profile?.address || 'N/A'}</Text>
                       <Text style={styles.label}>Category</Text><Text style={styles.value}>{profile?.category || 'N/A'}</Text>
                     </>
                  )}
                  {activeTab === 'Academic' && (
                     <>
                       <Text style={styles.label}>10th Percentage</Text><Text style={styles.value}>{profile?.tenthPercentage || 'N/A'}</Text>
                       <Text style={styles.label}>12th Percentage</Text><Text style={styles.value}>{profile?.twelfthPercentage || 'N/A'}</Text>
                       <Text style={styles.label}>Diploma Percentage</Text><Text style={styles.value}>{profile?.diplomaPercentage || 'N/A'}</Text>
                       <Text style={styles.label}>Current Semester</Text><Text style={styles.value}>{profile?.currentSemester || 'N/A'}</Text>
                       <Text style={styles.label}>CGPA</Text><Text style={styles.value}>{profile?.cgpa || profile?.academics?.cgpa || 'N/A'}</Text>
                       <Text style={styles.label}>Active Backlogs</Text><Text style={styles.value}>{profile?.activeBacklogs || profile?.academics?.activeBacklogs || '0'}</Text>
                       <Text style={styles.label}>Total Backlogs History</Text><Text style={styles.value}>{profile?.totalBacklogs || '0'}</Text>
                     </>
                  )}
                  {activeTab === 'Professional' && (
                     <>
                       <Text style={styles.label}>Skills</Text><Text style={styles.value}>{profile?.skills?.join(', ') || 'N/A'}</Text>
                       <Text style={styles.label}>LinkedIn URL</Text><Text style={styles.value}>{profile?.linkedinUrl || 'N/A'}</Text>
                       <Text style={styles.label}>GitHub URL</Text><Text style={styles.value}>{profile?.githubUrl || 'N/A'}</Text>
                       <Text style={styles.label}>Portfolio URL</Text><Text style={styles.value}>{profile?.portfolioUrl || 'N/A'}</Text>
                     </>
                  )}
                </View>
              ) : (
                <>
                  {activeTab === 'Personal' && renderPersonalFields()}
                  {activeTab === 'Academic' && renderAcademicFields()}
                  {activeTab === 'Professional' && renderProfessionalFields()}
                  
                  <Button 
                    title="Save Changes" 
                    onPress={handleSave} 
                    isLoading={updateMutation.isPending}
                    style={styles.submitButton}
                    icon={<Save size={20} color="#fff" />}
                  />
                </>
              )}
            </Card>

            <View style={{ height: theme.spacing[8] }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  scrollContent: { padding: theme.spacing[4] },
  profileHeaderCard: { alignItems: 'center', paddingVertical: theme.spacing[4], marginBottom: theme.spacing[2] },
  avatarGlow: { padding: 4, borderRadius: 60, backgroundColor: theme.colors.primary + '15', marginBottom: theme.spacing[4] },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.colors.card },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: theme.colors.card },
  name: { fontSize: 24, fontWeight: '800', color: theme.colors.foreground, marginBottom: 4 },
  email: { fontSize: 15, color: theme.colors.mutedForeground, marginBottom: 8 },
  incompleteWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: (theme.colors.destructive + "15"), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  incompleteText: { color: theme.colors.destructive, fontSize: 13, fontWeight: '600' },
  sectionCard: { padding: theme.spacing[5], borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 0, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 14, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[5] },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.foreground },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F1F5F9', borderRadius: 12 },
  editBtnText: { color: theme.colors.primary, fontWeight: '600' },
  cancelBtnText: { color: theme.colors.mutedForeground, fontWeight: '600' },
  formSpace: { gap: theme.spacing[4] },
  submitButton: { marginTop: theme.spacing[6], borderRadius: 12 },
  readOnlyContainer: { gap: 8 },
  readOnlyHint: { fontSize: 13, color: theme.colors.mutedForeground, marginBottom: 12, fontStyle: 'italic' },
  label: { fontSize: 12, color: theme.colors.mutedForeground, marginTop: 4 },
  value: { fontSize: 15, color: theme.colors.foreground, fontWeight: '500' },
  uploadSection: { marginTop: theme.spacing[6], paddingTop: theme.spacing[4], borderTopWidth: 1, borderTopColor: theme.colors.border },
});
