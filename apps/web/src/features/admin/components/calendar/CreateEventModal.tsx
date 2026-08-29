import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, Tag, Loader2 } from 'lucide-react';
import { useCreateCustomEvent, useUpdateCustomEvent } from '@/hooks/queries/useAdminCalendar';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  editEvent?: any;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  selectedDate,
  editEvent,
}: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [type, setType] = useState('Event');
  const [color, setColor] = useState('#4f46e5');
  const [description, setDescription] = useState('');

  const createEvent = useCreateCustomEvent();
  const updateEvent = useUpdateCustomEvent();

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title || '');
      const sDate = new Date(editEvent.start);
      setDate(sDate.toISOString().split('T')[0] || '');
      setIsAllDay(editEvent.allDay || false);
      if (!editEvent.allDay) {
        setStartTime(sDate.toTimeString().slice(0, 5));
        if (editEvent.end) {
          setEndTime(new Date(editEvent.end).toTimeString().slice(0, 5));
        }
      }
      setType(editEvent.extendedProps?.type || 'Event');
      setColor(editEvent.color || '#4f46e5');
      setDescription(editEvent.extendedProps?.description || '');
    } else if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0] || '');
      setStartTime('09:00');
      setEndTime('10:00');
      setIsAllDay(false);
      setTitle('');
      setType('Event');
      setColor('#4f46e5');
      setDescription('');
    }
  }, [selectedDate, editEvent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startStr = isAllDay ? date : `${date}T${startTime}:00`;
    const endStr = isAllDay ? date : `${date}T${endTime}:00`;

    const payload = {
      title,
      start: startStr,
      end: endStr,
      isAllDay,
      type,
      color,
      description,
    };

    if (editEvent) {
      updateEvent.mutate(
        { id: editEvent.extendedProps.eventId, ...payload },
        {
          onSuccess: onClose,
        }
      );
    } else {
      createEvent.mutate(payload, {
        onSuccess: onClose,
      });
    }
  };

  if (!isOpen) return null;

  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            {editEvent ? 'Edit Event' : 'Create Custom Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <input
                autoFocus
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold text-slate-800 placeholder:text-slate-300 border-0 border-b-2 border-slate-100 focus:ring-0 focus:border-indigo-500 px-0 py-2 transition-colors"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="flex gap-4 items-start">
              <CalendarIcon className="w-5 h-5 text-slate-400 mt-2.5 shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    All Day
                  </label>
                </div>

                {!isAllDay && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                      required={!isAllDay}
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                      required={!isAllDay}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Type & Color */}
            <div className="flex gap-4 items-center">
              <Tag className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="flex-1 flex gap-4">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 flex-1"
                >
                  <option value="Event">General Event</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Holiday">Holiday</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Color:</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex gap-4 items-start">
              <AlignLeft className="w-5 h-5 text-slate-400 mt-2.5 shrink-0" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                rows={4}
                className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={isPending || !title}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {editEvent ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
