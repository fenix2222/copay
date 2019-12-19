import { Injectable } from '@angular/core';
import { PlatformProvider } from '../platform/platform';

@Injectable()
export class AnalyticsProvider {
  constructor(
    private platformProvider: PlatformProvider
  ) {}
  logEvent(eventName: string, eventParams: { [key: string]: any }) {
    if (this.platformProvider.isCordova)
      return;
  }

  setUserProperty(name: string, value: string) {
  }
}
