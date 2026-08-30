import { useState } from 'react';
import { Button } from '@/components/ui';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { Note01Icon, UserIcon, Clock01Icon } from 'hugeicons-react';
import { format } from 'date-fns';

export function TabNotes({ studentId, importedData, profileData, reload }: { studentId: string, importedData: any, profileData: any, reload: () => void }) {
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminNotes = profileData?.adminNotes || [];

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      setIsSubmitting(true);
      const newNote = {
        text: noteText,
        author: 'Admin', // In a real app, this would be the logged-in admin's name
        createdAt: new Date().toISOString()
      };

      const updatedNotes = [...adminNotes, newNote];

      await adminService.updateStudentAdminNotes(studentId, updatedNotes);
      toast.success('Note added successfully');
      setNoteText('');
      reload();
    } catch (err) {
      toast.error('Failed to add note');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Internal Remarks & Notes</h3>
          <p className="text-sm text-gray-500 mt-1">These notes are only visible to the Placement Cell staff.</p>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Add a new note
            </label>
            <div className="flex flex-col gap-3">
              <textarea
                id="note"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                placeholder="Enter your remarks here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddNote} disabled={isSubmitting || !noteText.trim()}>
                  {isSubmitting ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Previous Notes</h4>
            {adminNotes.length > 0 ? (
              <div className="space-y-4 mt-4">
                {[...adminNotes].reverse().map((note: any, idx: number) => (
                  <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{note.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock01Icon className="w-3.5 h-3.5" />
                        <span>{format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Note01Icon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No internal notes added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
