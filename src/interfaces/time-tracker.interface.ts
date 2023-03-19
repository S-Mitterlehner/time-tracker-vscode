import { TrackingStatus } from '../services/time-tracker';

export interface ITimeTracker {
  get trackingStatus(): TrackingStatus;
  startTracking(): Promise<void>;
  stopTracking(): Promise<void>;
  printTime(): Promise<void>;
}
