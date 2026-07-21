import { X, MapPin, Building, Users, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface EventDetailsModalProps {
  event: any;
  onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  if (!event) return null;

  const props = event.extendedProps || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-100" style={{ borderTopWidth: '4px', borderTopColor: event.backgroundColor }}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4 pr-8">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-2xl shadow-sm">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                  {props.type || 'Event'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider" style={{ backgroundColor: `${event.backgroundColor}20`, color: event.backgroundColor }}>
                  {props.status || 'Active'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">{event.title}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5"/> Start</div>
              <div className="text-sm font-medium text-slate-800">{format(event.start, 'MMM d, yyyy h:mm a')}</div>
            </div>
            {event.end && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5"/> End</div>
                <div className="text-sm font-medium text-slate-800">{format(event.end, 'MMM d, yyyy h:mm a')}</div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {props.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{props.location}</div>
                  <div className="text-xs text-slate-500">Venue / Location</div>
                </div>
              </div>
            )}
            
            {props.package && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{props.package}</div>
                  <div className="text-xs text-slate-500">Compensation Package</div>
                </div>
              </div>
            )}

            {props.department && props.department.length > 0 && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{props.department.join(', ')}</div>
                  <div className="text-xs text-slate-500">Eligible Departments</div>
                </div>
              </div>
            )}
          </div>
          
          {props.description && (
             <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{props.description}</p>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-colors">
            Close
          </button>
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
            View Full Drive
          </button>
        </div>

      </div>
    </div>
  );
}
