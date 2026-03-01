import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:docs:feature-video";
export const DESCRIPTION = "Create demonstration video for feature";
export const TEMPLATE = `
# Docs:Feature-Video Command
Create demonstration video for new feature or capability.
## Video Production Process
1. **Script Writing** - Write clear, concise demo script
2. **Environment Setup** - Prepare for recording
3. **Recording** - Record feature demonstration
4. **Editing** - Edit for clarity and pacing
5. **Captioning** - Add captions for accessibility
6. **Hosting** - Upload to video platform
7. **Documentation** - Embed in documentation
8. **Publishing** - Publish to channels
## Video Types
- **Feature Demo** - Walkthrough of new feature
- **Tutorial** - Step-by-step usage guide
- **Comparison** - Before/after comparison
- **Quick Tip** - Brief optimization techniques
- **Troubleshooting** - Common issues and solutions
## Platforms
- **YouTube** - Public video hosting
- **Vimeo** - Professional video hosting
- **Docs Site** - Embedded in documentation
- **Social Media** - Short clips for marketing
- **Internal** - Private videos for team
<video-context>
$ARGUMENTS
</video-context>
`;
export const ARGUMENT_HINT = "[feature-name] [--type=demo|tutorial|comparison|tip]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
