import { TrackingStatus } from '../enums/tracking-status';

export interface ITimeTracker {
  get trackingStatus(): TrackingStatus;
  startTracking(): Promise<void>;
  stopTracking(): Promise<void>;
  printTime(): Promise<void>;
}
