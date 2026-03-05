import { Command } from '@oclif/core';
import { displayBanner } from './ui/banner.js';

export abstract class GhostwireCommand extends Command {
  async init(): Promise<void> {
    // Add banner for init command
    if (this.id === 'init') {
      displayBanner();
    }
    await super.init();
  }
}
