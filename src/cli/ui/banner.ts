import { theme } from './colors.js';

const BANNER = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ██████╗ ██╗     ██████╗  ██████╗ ███████╗ ██████╗      ║
║  ██╔════╝ ██║     ██╔══██╗██╔═══██╗██╔════╝██╔═══██╗     ║
║  ██║  ███╗██║     ██████╔╝██║   ██║███████╗██████╔╝      ║
║  ██║   ██║██║     ██╔══██╗██║   ██║╚════██║██╔══██╗      ║
║  ╚██████╔╝███████╗██████╔╝╚██████╔╝███████║██║  ██║      ║
║   ╚═════╝ ╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝      ║
║                                                            ║
║   AI Agent Distribution Platform                           ║
╚════════════════════════════════════════════════════════════╝
`;

export function displayBanner(): void {
  console.log(theme.banner.border(BANNER));
}

export function displaySubtitle(text: string): void {
  console.log(theme.banner.subtitle(`  ${text}\n`));
}
