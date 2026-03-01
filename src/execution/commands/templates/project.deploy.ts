export const PROJECT_DEPLOY_TEMPLATE = `
# Project:Deploy Command
Deploy project to specified environment (staging, production, etc.).
## Process
1. **Build Verification** - Ensure successful build
2. **Environment Validation** - Verify target environment configuration
3. **Dependency Preparation** - Install/update all dependencies
4. **Migration Execution** - Run any database migrations
5. **Deployment** - Deploy to target environment
6. **Health Checks** - Verify deployment health
7. **Rollback Plan** - Prepare rollback if needed
## Deployment Targets
- **Development** - Local or dev server
- **Staging** - Pre-production testing environment
- **Production** - Public-facing environment
- **Multiple Regions** - Distributed deployment
## Features
- Blue-green deployments
- Canary deployments
- Zero-downtime updates
- Automatic rollback on failure
- Health check monitoring
- Deployment notifications
## Safety
- Always test deployments in staging first
- Use feature flags for risky changes
- Monitor logs and metrics after deployment
- Have rollback procedure ready
- Get approval for production deployments
<deploy-context>
$ARGUMENTS
</deploy-context>
`;
