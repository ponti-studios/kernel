---
name: ready
description: Check production readiness before deployment. Use before major releases.
license: MIT
compatibility: Works with any project.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Quality
  tags: [quality, production, deployment, readiness]
---

Check production readiness before deployment.

## Production Readiness Checklist

### 1. Code Quality
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets or keys
- [ ] Error handling in place
- [ ] TypeScript types correct

### 2. Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases covered

### 3. Security
- [ ] Input validation
- [ ] Authentication/authorization verified
- [ ] No security vulnerabilities (run security scan)
- [ ] Secrets not in code

### 4. Performance
- [ ] No memory leaks
- [ ] Load testing done if applicable
- [ ] Performance benchmarks met

### 5. Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Changelog updated

### 6. Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Rollback plan in place
- [ ] Monitoring/alerts configured

### 7. Business
- [ ] Feature complete per requirements
- [ ] Stakeholder sign-off

## Output

Provide a report showing:
- What's complete
- What's missing
- Risks identified
- Go/no-go recommendation
