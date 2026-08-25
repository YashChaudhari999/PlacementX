import { useState, useEffect } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { useSendNotification } from '@/hooks/queries/useAdminNotifications';
import { 
  Users, MessageSquare, Send, Calendar, CheckCircle, 
  Smartphone, Bell, Mail, ArrowRight, ArrowLeft, Megaphone, AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface NotificationComposerProps {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function NotificationComposer({ onComplete }: NotificationComposerProps) {
  const [searchParams] = useSearchParams();
  const preSelectedIds = searchParams.get('selectedStudents')?.split(',') || [];

  const [step, setStep] = useState<Step>(1);
  const { mutate: sendNotification, isPending } = useSendNotification();

  const [formData, setFormData] = useState({
    audienceType: preSelectedIds.length > 0 ? 'selected' : 'group',
    selectedStudents: preSelectedIds,
    group: '2026 Batch',
    filterRules: {} as any, // Mock for filters
    driveId: '',
    
    title: '',
    message: '',
    type: 'Placement',
    priority: 'Normal',
    ctaLabel: '',
    ctaTarget: '',
    
    channels: {
      inApp: true,
      push: true,
      email: false
    },
    
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: '',
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateChannel = (channel: 'inApp' | 'push' | 'email') => {
    setFormData(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: !prev.channels[channel] }
    }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5) as Step);
  const handlePrev = () => setStep(s => Math.max(s - 1, 1) as Step);

  const handleSend = () => {
    sendNotification(formData, {
      onSuccess: () => onComplete()
    });
  };

  // Mock recipient count based on selection
  const recipientCount = formData.audienceType === 'selected' 
    ? formData.selectedStudents.length 
    : formData.audienceType === 'group' ? 1248 : 0;

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
      
      {/* ─── Main Composer Column ──────────────────────────────────────── */}
      <div className="flex-1 space-y-6">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'Audience', icon: Users },
            { num: 2, label: 'Content', icon: MessageSquare },
            { num: 3, label: 'Channels', icon: Send },
            { num: 4, label: 'Schedule', icon: Calendar },
            { num: 5, label: 'Review', icon: CheckCircle },
          ].map((s, idx) => (
            <div key={s.num} className="flex flex-col items-center gap-2 relative z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                step === s.num ? 'bg-indigo-600 text-white border-indigo-600' :
                step > s.num ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                'bg-white text-slate-400 border-slate-200'
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {/* Connector line */}
              {idx < 4 && (
                <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${
                  step > s.num ? 'bg-indigo-200' : 'bg-slate-100'
                }`} style={{ transform: 'translateX(50%)' }} />
              )}
            </div>
          ))}
        </div>

        <Card className="p-6 border-slate-200 shadow-sm min-h-[400px]">
          {/* STEP 1: AUDIENCE */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Who should receive this notification?</h2>
                <p className="text-sm text-slate-500">Target your audience precisely to ensure high relevance.</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'selected', label: 'Selected Students', desc: 'Students explicitly selected from the management table.' },
                  { id: 'group', label: 'Student Group / Batch', desc: 'Send to a predefined cohort (e.g. 2026 Batch).' },
                  { id: 'drive', label: 'Placement Drive', desc: 'Target students based on their status in a specific drive.' },
                  { id: 'dynamic', label: 'Dynamic Filter', desc: 'Create a custom rule (e.g. Unplaced & CGPA > 8.0).' },
                ].map(opt => (
                  <label key={opt.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.audienceType === opt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="audienceType" 
                      className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                      checked={formData.audienceType === opt.id}
                      onChange={() => updateForm('audienceType', opt.id)}
                    />
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{opt.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {formData.audienceType === 'group' && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Group</label>
                  <select 
                    className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    value={formData.group}
                    onChange={(e) => updateForm('group', e.target.value)}
                  >
                    <option>2026 Batch</option>
                    <option>2026 MBA Finance</option>
                    <option>Unplaced Students</option>
                    <option>Placement Ready</option>
                  </select>
                </div>
              )}

              {formData.audienceType === 'selected' && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-2">Pre-selected Students</div>
                  <div className="flex flex-wrap gap-2">
                    {preSelectedIds.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {preSelectedIds.length} students selected
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">No students pre-selected. Go to Student Management to select students.</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Audience Safety Check */}
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-emerald-900">Estimated Audience</div>
                  <div className="text-xs text-emerald-700 mt-0.5">Based on your current selection.</div>
                </div>
                <div className="text-2xl font-bold text-emerald-700">{recipientCount.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTENT */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Compose Message</h2>
                <p className="text-sm text-slate-500">Write your notification content. Use variables for personalization.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notification Type</label>
                  <select 
                    className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    value={formData.type}
                    onChange={(e) => updateForm('type', e.target.value)}
                  >
                    <option>Placement</option>
                    <option>Interview</option>
                    <option>Shortlist</option>
                    <option>Deadline</option>
                    <option>Announcement</option>
                    <option>System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select 
                    className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    value={formData.priority}
                    onChange={(e) => updateForm('priority', e.target.value)}
                  >
                    <option>Normal</option>
                    <option>Important</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Deloitte Placement Drive – Applications Open"
                  className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Message</label>
                  <div className="text-xs text-indigo-600 font-medium cursor-pointer flex gap-2">
                    <button onClick={() => updateForm('message', formData.message + '{{studentName}}')}>+ Name</button>
                    <button onClick={() => updateForm('message', formData.message + '{{companyName}}')}>+ Company</button>
                    <button onClick={() => updateForm('message', formData.message + '{{deadline}}')}>+ Deadline</button>
                  </div>
                </div>
                <textarea 
                  rows={4}
                  placeholder="The placement drive is now open..."
                  className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                  value={formData.message}
                  onChange={(e) => updateForm('message', e.target.value)}
                />
                <div className="text-xs text-slate-400 text-right mt-1">{formData.message.length} characters</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Call to Action (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. View Drive"
                    className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    value={formData.ctaLabel}
                    onChange={(e) => updateForm('ctaLabel', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destination URL / Deep Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. /student/drives/deloitte"
                    className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    value={formData.ctaTarget}
                    onChange={(e) => updateForm('ctaTarget', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CHANNELS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Select Delivery Channels</h2>
                <p className="text-sm text-slate-500">Choose how the students will receive this notification.</p>
              </div>

              <div className="space-y-4">
                <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-colors ${formData.channels.inApp ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
                    checked={formData.channels.inApp}
                    onChange={() => updateChannel('inApp')}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-600" />
                      <div className="font-bold text-slate-900 text-base">In-App Notification</div>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Displays inside the PlacementX platform in the notification center.</div>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Recommended</div>
                </label>

                <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-colors ${formData.channels.push ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
                    checked={formData.channels.push}
                    onChange={() => updateChannel('push')}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-indigo-600" />
                      <div className="font-bold text-slate-900 text-base">Push Notification</div>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Mobile push notification via FCM. Best for urgent updates.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-colors ${formData.channels.email ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 opacity-60'}`}>
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
                    checked={formData.channels.email}
                    onChange={() => updateChannel('email')}
                    disabled
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div className="font-bold text-slate-700 text-base">Email Broadcast</div>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Send a standard email. (Requires SendGrid configuration)</div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">Coming Soon</div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: SCHEDULE */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Scheduling</h2>
                <p className="text-sm text-slate-500">When should this notification be sent?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-colors text-center gap-2 ${formData.scheduleType === 'now' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}>
                  <input type="radio" name="scheduleType" className="sr-only" checked={formData.scheduleType === 'now'} onChange={() => updateForm('scheduleType', 'now')} />
                  <Send className="w-8 h-8 mb-2" />
                  <span className="font-bold">Send Immediately</span>
                  <span className="text-xs opacity-70">Will be processed right away</span>
                </label>

                <label className={`flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-colors text-center gap-2 ${formData.scheduleType === 'later' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}>
                  <input type="radio" name="scheduleType" className="sr-only" checked={formData.scheduleType === 'later'} onChange={() => updateForm('scheduleType', 'later')} />
                  <Calendar className="w-8 h-8 mb-2" />
                  <span className="font-bold">Schedule for Later</span>
                  <span className="text-xs opacity-70">Set a specific date and time</span>
                </label>
              </div>

              {formData.scheduleType === 'later' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value={formData.scheduledDate}
                      onChange={(e) => updateForm('scheduledDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time (IST)</label>
                    <input 
                      type="time" 
                      className="w-full h-10 px-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value={formData.scheduledTime}
                      onChange={(e) => updateForm('scheduledTime', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Review & Confirm</h2>
                <p className="text-sm text-slate-500">Please review the details before broadcasting.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                <div className="p-4 flex gap-4">
                  <div className="w-1/3 text-sm font-medium text-slate-500">Audience</div>
                  <div className="w-2/3">
                    <div className="text-sm font-bold text-slate-900">{formData.audienceType === 'group' ? formData.group : 'Selected Students'}</div>
                    <div className="text-xs text-indigo-600 font-semibold mt-1">{recipientCount.toLocaleString()} recipients</div>
                  </div>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="w-1/3 text-sm font-medium text-slate-500">Message</div>
                  <div className="w-2/3">
                    <div className="text-sm font-bold text-slate-900 mb-1">{formData.title}</div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">{formData.message}</div>
                    {formData.ctaLabel && (
                      <div className="mt-2 text-xs font-semibold text-indigo-600">CTA: {formData.ctaLabel} → {formData.ctaTarget}</div>
                    )}
                  </div>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="w-1/3 text-sm font-medium text-slate-500">Channels</div>
                  <div className="w-2/3 flex gap-2">
                    {formData.channels.inApp && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">In-App</span>}
                    {formData.channels.push && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">Push</span>}
                  </div>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="w-1/3 text-sm font-medium text-slate-500">Schedule</div>
                  <div className="w-2/3 text-sm font-bold text-slate-900">
                    {formData.scheduleType === 'now' ? 'Send Immediately' : `${formData.scheduledDate} at ${formData.scheduledTime} (IST)`}
                  </div>
                </div>
              </div>

              {recipientCount > 1000 && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-900">Mass Broadcast Warning</h4>
                    <p className="text-xs text-red-700 mt-1">You are about to notify over 1,000 students. This action cannot be undone once sent.</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={step === 1 ? onComplete : handlePrev}
          >
            {step === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-2" /> Back</>}
          </Button>
          
          {step < 5 ? (
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleNext}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              className={`${formData.scheduleType === 'now' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`} 
              onClick={handleSend}
              disabled={isPending || !formData.title || !formData.message || recipientCount === 0}
            >
              {isPending ? 'Processing...' : formData.scheduleType === 'now' ? 'Confirm Broadcast' : 'Schedule Notification'}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Live Preview Column ──────────────────────────────────────── */}
      <div className="w-full lg:w-80 space-y-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Preview</h3>
        
        {/* Push Notification Preview */}
        {formData.channels.push && (
          <div className="relative mx-auto w-72 h-[140px] bg-white rounded-3xl shadow-xl border-4 border-slate-100 overflow-hidden flex flex-col justify-center px-4 animate-in fade-in zoom-in duration-300">
            <div className="absolute top-2 left-0 right-0 flex justify-between px-5 text-[10px] text-slate-500 font-medium">
              <span>PlacementX</span>
              <span>now</span>
            </div>
            <div className="mt-4 flex gap-3 items-start">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {formData.title || 'Notification Title'}
                </div>
                <div className="text-xs text-slate-600 leading-snug line-clamp-2 mt-0.5">
                  {formData.message.replace(/{{.*?}}/g, '(...)') || 'Notification message will appear here.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* In-App Notification Preview */}
        {formData.channels.inApp && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 animate-in fade-in zoom-in duration-300">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{formData.title || 'Notification Title'}</div>
                <div className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                  {formData.message || 'The detailed message content goes here. Variables like {{studentName}} will be resolved.'}
                </div>
                {formData.ctaLabel && (
                  <div className="mt-3 text-xs font-semibold text-indigo-600">
                    {formData.ctaLabel} →
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
