export abstract class Behavior {
  onEvent(eventName: string, event: any): void {
    const eventMap = this.getAfterEventMap();
    const handler = eventMap.get(eventName);
    if (handler) {
      handler(event);
    }
  }

  abstract getAfterEventMap(): Map<string, Function>;
  abstract getBeforeEventMap(): Map<string, Function>;
}
