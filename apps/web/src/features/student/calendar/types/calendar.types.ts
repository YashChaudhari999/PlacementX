export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  type?: string;
  status?: string;
  extendedProps?: {
    driveId?: string;
    company?: string;
    jobRole?: string;
    applicationId?: string;
    applicationStatus?: string;
    roundId?: string;
    venue?: string;
    instructions?: string;
    description?: string;
    eventId?: string;
    isEligible?: boolean;
    hasApplied?: boolean;
    isCustom?: boolean;
    type?: string;
    status?: string;
  };
}

export interface CalendarResponse {
  events: CalendarEvent[];
}
