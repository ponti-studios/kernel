import chalk from 'chalk';

export const colors = {
  primary: chalk.cyan,
  secondary: chalk.gray,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  cyan: chalk.cyan,
  dim: chalk.dim,
  bold: chalk.bold,
  
  icon: {
    check: '✓',
    cross: '✗',
    arrow: '→',
    bullet: '•',
    star: '★',
    search: '🔍',
    package: '📦',
    gear: '⚙️',
  },
  
  tool: {
    installed: chalk.green('✓'),
    notInstalled: chalk.red('✗'),
    detected: chalk.green('●'),
    notDetected: chalk.gray('○'),
  },
};

export const theme = {
  banner: {
    text: chalk.cyan,
    subtitle: chalk.gray,
    border: chalk.cyan,
  },
  table: {
    header: chalk.bold.cyan,
    row: chalk.white,
    border: chalk.gray,
  },
  tree: {
    branch: chalk.gray,
    leaf: chalk.white,
    icon: chalk.yellow,
  },
  spinner: {
    start: chalk.cyan,
    success: chalk.green,
    error: chalk.red,
  },
};
