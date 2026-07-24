export interface NotificationPrefs {
  newBrands: boolean;
  pitchesReady: boolean;
  callsBooked: boolean;
  weeklySummary: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  newBrands: true,
  pitchesReady: true,
  callsBooked: true,
  weeklySummary: false,
};

export const NOTIFICATION_PREF_LABELS: Record<keyof NotificationPrefs, { label: string; body: string }> = {
  newBrands: { label: "New brands found", body: "When your Research agent adds brands to your Pending queue." },
  pitchesReady: { label: "Pitches ready", body: "When an agent finishes drafting a pitch or proposal." },
  callsBooked: { label: "Calls booked", body: "When a brand call lands on your calendar." },
  weeklySummary: { label: "Weekly summary", body: "A weekly recap of what your team got done." },
};
