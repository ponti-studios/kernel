// Draft validation for this skill. Combinators come from studio-core.

import { object, string } from '../../../studio-core/scripts/lib/validate.mjs';

export const essayDraftSchema = object({
  title: string({ min: 1 }),
  content: string({ min: 1 }),
});
