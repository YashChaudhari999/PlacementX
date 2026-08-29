import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Building,
  Info,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useDeleteCustomEvent } from '@/hooks/queries/useAdminCalendar';
import { Link } from 'react-router-dom';

interface EventDetailsModalProps {
  event: any;
  onClose: () => void;
  onEdit?: (event: any) => void;
}

export default function EventDetailsModal({ event, onClose, onEdit }: EventDetailsModalProps) {
  if (!event) return null;

  const { title, start, end, allDay, extendedProps, color } = event;
  const isCustom = extendedProps?.isCustom;
  const deleteEvent = useDeleteCustomEvent();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent.mutate(extendedProps.eventId, {
        onSuccess: onClose,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header with dynamic color */}
        <div
          className="px-6 py-4 flex justify-between items-start text-white relative"
          style={{ backgroundColor: color || '#4f46e5' }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 pr-6">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">
              {extendedProps?.type || 'Event'}
            </div>
            <h2 className="text-xl font-bold leading-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Time & Date */}
          <div className="flex gap-3">
            <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-slate-500">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {format(start, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {allDay ? (
                  'All Day'
                ) : (
                  <>
                    {format(start, 'h:mm a')}
                    {end && ` - ${format(end, 'h:mm a')}`}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location/Platform (if exists) */}
          {extendedProps?.venue && (
            <div className="flex gap-3">
              <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-slate-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Location / Platform</div>
                <div className="text-sm text-slate-600 mt-0.5">{extendedProps.venue}</div>
              </div>
            </div>
          )}

          {/* Company (if exists) */}
          {extendedProps?.company && (
            <div className="flex gap-3">
              <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-slate-500">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Company</div>
                <div className="text-sm text-slate-600 mt-0.5">{extendedProps.company}</div>
              </div>
            </div>
          )}

          {/* Description (if exists) */}
          {extendedProps?.description && (
            <div className="flex gap-3">
              <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-slate-500">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Details</div>
                <div className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap leading-relaxed">
                  {extendedProps.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          {isCustom ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit?.(event);
                }}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Edit Event"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div></div> // empty spacer
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>

            {extendedProps?.driveId && (
              <Link
                to={`/admin/drives/${extendedProps.driveId}`}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                View Drive <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
