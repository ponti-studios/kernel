import { theme, colors } from './colors.js';

export interface TreeNode {
  label: string;
  icon?: string;
  status?: 'success' | 'error' | 'warning' | 'neutral';
  children?: TreeNode[];
}

function renderNode(node: TreeNode, prefix: string, isLast: boolean, isRoot: boolean): void {
  const connector = isRoot ? '' : (isLast ? '└── ' : '├── ');
  const childPrefix = isRoot ? '' : (isLast ? '    ' : '│   ');

  let icon = node.icon ?? '';
  if (node.status === 'success') {
    icon = icon || colors.tool.installed;
  } else if (node.status === 'error') {
    icon = icon || colors.tool.notInstalled;
  } else if (node.status === 'warning') {
    icon = icon || colors.warning('!');
  }

  const label = node.label;
  if (icon) {
    console.log(`${prefix}${connector}${icon} ${label}`);
  } else {
    console.log(`${prefix}${connector}${theme.tree.leaf(label)}`);
  }

  if (node.children) {
    node.children.forEach((child, i) => {
      renderNode(child, prefix + childPrefix, i === node.children!.length - 1, false);
    });
  }
}

export function tree(root: TreeNode): void {
  renderNode(root, '', true, true);
}

export function toolTree(tools: Array<{ name: string; path: string; detected: boolean }>): void {
  console.log(colors.primary('\n🔍 Detected Tools:'));
  console.log('');

  const root: TreeNode = {
    label: 'Tools',
    children: tools.map((tool) => ({
      label: `${tool.name} (${tool.path})`,
      status: tool.detected ? 'success' : 'error',
    })),
  };

  tree(root);
}
