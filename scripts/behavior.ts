export interface Behavior {
  onEvent(eventName: string, event: any): void;
  getEventMap(): Map<string, Function>;
}
