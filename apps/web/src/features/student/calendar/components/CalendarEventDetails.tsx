import React from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '../types/calendar.types';
import { downloadIcs } from '../services/calendar.service';
import {
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  FileText,
  Info,
  Download,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Modal, Badge } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CalendarEventDetailsProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarEventDetails: React.FC<CalendarEventDetailsProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!event) return null;

  const props = event.extendedProps || {};
  const isAllDay = event.allDay;

  const formatDate = (dateStr: string) => format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
  const formatTime = (dateStr: string) => format(new Date(dateStr), 'h:mm a');

  const handleAction = () => {
    if (props.hasApplied && props.driveId) {
      navigate('/student/applications'); // or specific application route
    } else if (props.isEligible && !props.hasApplied && props.driveId) {
      navigate(`/student/drives/${props.driveId}`);
    } else if (props.isCustom) {
      // Just close or do nothing special for custom
      onClose();
    }
    onClose();
  };

  const renderActionButtons = () => {
    if (props.isCustom) {
      return null;
    }

    if (props.hasApplied) {
      return (
        <Button onClick={handleAction} variant="default" className="w-full sm:w-auto">
          View Application <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      );
    }

    if (props.isEligible && !props.hasApplied && props.status === 'Open') {
      return (
        <Button onClick={handleAction} variant="default" className="w-full sm:w-auto">
          Apply Now <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      );
    }

    if (props.isEligible && !props.hasApplied) {
      return (
        <Button onClick={handleAction} variant="outline" className="w-full sm:w-auto">
          View Drive Details
        </Button>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0 overflow-hidden"
      footer={
        <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadIcs(event)}
            className="w-full sm:w-auto text-muted-foreground"
          >
            <Download className="mr-2 h-4 w-4" /> Download .ics
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
            {renderActionButtons()}
          </div>
        </div>
      }
    >
      <div className="-mx-6 -mt-6">
        <div
          className="h-3 w-full"
          style={{ backgroundColor: event.backgroundColor || 'var(--primary)' }}
        />

        <div className="px-6 pt-5 pb-3 bg-muted/20 border-b border-border/40">
          <div className="mb-4 pr-8">
            <div className="flex items-center justify-between mb-3.5">
              <Badge
                variant="outline"
                className="bg-background font-semibold tracking-wide uppercase text-[10px] text-muted-foreground border-border/80 shadow-sm"
              >
                {props.type || 'Event'}
              </Badge>
              {props.status && (
                <Badge
                  variant={
                    props.status === 'Open' || props.status === 'Scheduled'
                      ? 'success'
                      : 'secondary'
                  }
                  className="shadow-sm"
                >
                  {props.status}
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight">
              {event.title}
            </h2>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="space-y-6 text-sm text-foreground">
            {/* Time / Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-base">{formatDate(event.start)}</p>
                {!isAllDay && (
                  <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(event.start)}
                    {event.end && ` - ${formatTime(event.end)}`}
                  </p>
                )}
                {isAllDay && <p className="text-muted-foreground mt-1">All Day Event</p>}
              </div>
            </div>

            {/* Company / Role */}
            {(props.company || props.jobRole) && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  {props.company && <p className="font-medium text-base">{props.company}</p>}
                  {props.jobRole && <p className="text-muted-foreground mt-1">{props.jobRole}</p>}
                </div>
              </div>
            )}

            {/* Venue */}
            {props.venue && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="font-medium mt-0.5">{props.venue}</p>
              </div>
            )}

            {/* Description / Instructions */}
            {(props.description || props.instructions) && (
              <div className="flex items-start gap-3 pt-5 border-t border-border/60">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-4 flex-1">
                  {props.description && (
                    <div>
                      <span className="font-semibold block text-foreground mb-1.5 uppercase text-xs tracking-wider text-muted-foreground">
                        Description
                      </span>
                      <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed bg-muted/10 p-4 rounded-xl border border-border/40">
                        {props.description}
                      </p>
                    </div>
                  )}
                  {props.instructions && (
                    <div>
                      <span className="font-semibold block text-foreground mb-1.5 uppercase text-xs tracking-wider text-muted-foreground">
                        Instructions
                      </span>
                      <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/20 text-primary-900">
                        {props.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Context Message */}
            {!props.isCustom && !props.hasApplied && props.isEligible && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3 mt-6">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                  You are eligible for this drive. Check the deadline and apply before it closes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
