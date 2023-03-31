import { TrackingStatus } from '../enums/tracking-status';

export interface ITimeTracker {
  get version(): string;
  getTrackingStatus(): TrackingStatus;
  startTracking(): Promise<void>;
  stopTracking(): Promise<void>;
  printTime(): Promise<void>;
  allowMultipleProjects(): Promise<void>;
  toggleAskProductivityFactor(): Promise<void>;
}

export interface ITimeTrackerSpecific<T> extends ITimeTracker {}
