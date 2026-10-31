// The schema kit: a handful of combinators instead of a schema DSL, replacing the
// zod schemas the studio packages used. zod-shaped contract (.parse / .safeParse)
// so call sites stayed identical. Copied from the editorial port; shared by all
// six writing skills.

// Draft validation — the dependency-free replacement for the zod schemas in
// packages/editorial/src/types.ts.
//
// The contract is deliberately zod-shaped: every schema exposes `parse` and
// `safeParse`, and `safeParse` returns `{ success: true, data }` or
// `{ success: false, error: { message } }`. `data` is normalised the way zod
// normalises it — unknown keys stripped, optional keys present only when the
// model actually sent them — so generate.mjs keeps the exact control flow (and
// the exact "invalid JSON" error messages) of the TypeScript original.
//
// A handful of combinators instead of a schema DSL: nine drafts is not a
// general-purpose validation problem, and every rule here maps one-to-one to a
// zod call in the original.

const typeName = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const join = (parent, key) =>
  typeof key === 'number' ? `${parent}[${key}]` : parent ? `${parent}.${key}` : String(key);

function make(check, optional = false) {
  const schema = {
    optional,
    // Internal: accumulate issues on `issues` and return the normalised value.
    _check: check,
    safeParse(value) {
      const issues = [];
      const data = check(value, '', issues);
      if (issues.length === 0) return { success: true, data };
      return {
        success: false,
        error: { message: issues.map((i) => `${i.path}: ${i.message}`).join('; ') },
      };
    },
    parse(value) {
      const result = schema.safeParse(value);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  };
  return schema;
}

export function string({ min = 0, max = Infinity } = {}) {
  return make((value, path, issues) => {
    if (typeof value !== 'string') {
      issues.push({ path, message: `expected string, received ${typeName(value)}` });
      return undefined;
    }
    if (value.length < min) {
      issues.push({ path, message: `expected at least ${min} character(s)` });
      return undefined;
    }
    if (value.length > max) {
      issues.push({ path, message: `expected at most ${max} character(s)` });
      return undefined;
    }
    return value;
  });
}

export function number({ int = false, positive = false } = {}) {
  return make((value, path, issues) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      issues.push({ path, message: `expected number, received ${typeName(value)}` });
      return undefined;
    }
    if (int && !Number.isInteger(value)) {
      issues.push({ path, message: 'expected integer' });
      return undefined;
    }
    if (positive && !(value > 0)) {
      issues.push({ path, message: 'expected a positive number' });
      return undefined;
    }
    return value;
  });
}

export function boolean() {
  return make((value, path, issues) => {
    if (typeof value !== 'boolean') {
      issues.push({ path, message: `expected boolean, received ${typeName(value)}` });
      return undefined;
    }
    return value;
  });
}

/** z.optional(schema) — a missing key is fine; a present key must validate. */
export function optional(schema) {
  return make((value, path, issues) => {
    if (value === undefined) return undefined;
    return schema._check(value, path, issues);
  }, true);
}

export function array(item, { min = 0, length = undefined } = {}) {
  return make((value, path, issues) => {
    if (!Array.isArray(value)) {
      issues.push({ path, message: `expected array, received ${typeName(value)}` });
      return undefined;
    }
    if (min > 0 && value.length < min) {
      issues.push({ path, message: `expected at least ${min} item(s)` });
      return undefined;
    }
    if (length !== undefined && value.length !== length) {
      issues.push({ path, message: `expected exactly ${length} item(s), received ${value.length}` });
      return undefined;
    }
    const seen = issues.length;
    const data = [];
    value.forEach((entry, index) => {
      const inner = [];
      const parsed = item._check(entry, join(path, index), inner);
      if (inner.length > 0) issues.push(...inner);
      else data.push(parsed);
    });
    return issues.length > seen ? undefined : data;
  });
}

export function object(shape) {
  return make((value, path, issues) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      issues.push({ path, message: `expected object, received ${typeName(value)}` });
      return undefined;
    }
    const seen = issues.length;
    const data = {};
    for (const [key, schema] of Object.entries(shape)) {
      const keyPath = join(path, key);
      if (!Object.hasOwn(value, key)) {
        if (!schema.optional) issues.push({ path: keyPath, message: 'required' });
        continue;
      }
      const inner = [];
      const parsed = schema._check(value[key], keyPath, inner);
      if (inner.length > 0) issues.push(...inner);
      // Unknown keys are never copied: same stripping as a zod object.
      else data[key] = parsed;
    }
    return issues.length > seen ? undefined : data;
  });
}

// ---------------------------------------------------------------------------
