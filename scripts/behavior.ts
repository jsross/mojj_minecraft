export abstract class Behavior {
  onEvent(eventName: string, event: any): void {
    const eventMap = this.getEventMap();
    const handler = eventMap.get(eventName);
    if (handler) {
      handler(event);
    }
  }

  abstract getEventMap(): Map<string, Function>;
}
