
- we use `fd` instead of `find`
## Module export policy

To improve clarity and maintain explicit dependency boundaries we **never use export * or re-export symbols** from one module in another. Every consumer must import directly from the file that defines the value. This avoids accidental coupling, makes tree-shaking reliable, and prevents hidden "pass-through" dependencies like the old skill-name-values.ts stub.

If a barrel file is needed for convenience it must list each export explicitly, and it may only re-export from modules inside this repository – generated or external manifests are off limits. Follow this rule consistently when reviewing or adding new code.
