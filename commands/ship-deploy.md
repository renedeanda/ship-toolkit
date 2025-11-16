---
description: Deploy your project to production (Vercel, Netlify, etc.)
---

# Ship Deploy Command

Automated deployment to your hosting platform. Detects your platform, runs pre-deployment checks, builds your project, and deploys to production.

## What This Command Does

The `/ship-deploy` command:

1. **Detects Platform** - Automatically identifies Vercel, Netlify, or other platforms
2. **Runs Pre-Checks** - Validates build configuration and dependencies
3. **Builds Project** - Runs production build with error checking
4. **Deploys** - Pushes to production with real-time progress
5. **Verifies** - Checks deployment status and accessibility
6. **Reports** - Provides live URL and deployment summary

## Supported Platforms

- ✅ **Vercel** (Recommended for Next.js)
- ✅ **Netlify** (Great for static sites and React)
- 🚧 **Railway** (Coming soon)
- 🚧 **Render** (Coming soon)
- 🚧 **GitHub Pages** (Coming soon)

## Steps

### 1. Detect Platform

```bash
/ship-deploy

🔍 Detecting deployment platform...
✓ Found vercel.json
Platform: Vercel
```

**If no platform detected:**

```bash
⚠️  No deployment platform detected

Which platform would you like to use?
  1. Vercel (recommended for Next.js)
  2. Netlify (recommended for static sites)
  3. Manual configuration

Select: 1

✓ Creating vercel.json...
Platform: Vercel
```

### 2. Check Authentication

```bash
🔐 Checking authentication...

Vercel CLI: ✓ Installed (v32.5.0)
Authentication: ❌ Not logged in

Opening browser for authentication...
✓ Successfully logged in as: yourname

📊 Account Info:
   Username: yourname
   Email: you@example.com
   Team: Personal
```

### 3. Pre-Deployment Checks

```bash
🔍 Running pre-deployment checks...

✓ package.json found
✓ Build script configured
✓ Dependencies installed
✓ No uncommitted changes
✓ All checks passed
```

**If checks fail:**

```bash
❌ Pre-deployment checks failed:

Issues:
  1. ❌ node_modules not found
  2. ⚠️  Uncommitted changes detected

Fixes:
  1. Run: npm install
  2. Commit changes or use --force to deploy anyway

Continue anyway? (y/n): n
Deployment cancelled.
```

### 4. Build Project

```bash
🔨 Building project for production...

> npm run build

⏳ Creating optimized production build...
✓ Compiled successfully
✓ Bundle analysis:
   Total: 164 KB (gzipped)
   Pages: 12
   Chunks: 8

✓ Build complete (28.4s)
```

**If build fails:**

```bash
❌ Build failed!

Error in src/pages/index.tsx:
  Type error: Property 'foo' does not exist on type 'Props'

Fix the build errors and try again.
Or run: /ship-deploy --skip-build (not recommended)
```

### 5. Deploy to Platform

```bash
🚀 Deploying to Vercel...

⏳ Uploading files...
✓ Files uploaded (2.4 MB)

⏳ Building on Vercel...
✓ Build successful

⏳ Deploying to production...
✓ Deployment complete!

🌐 Live URLs:
   Production: https://yourapp.vercel.app
   Deployment: https://yourapp-abc123.vercel.app

📊 Deployment Info:
   ID: dpl_abc123xyz
   Build time: 32s
   Deploy time: 5s
   Total time: 37s
```

### 6. Post-Deployment Verification

```bash
🔍 Verifying deployment...

✓ Site is accessible
✓ SSL certificate active
✓ All routes responding
✓ Assets loading correctly

📊 Performance Check:
   Response time: 245ms
   Status: Healthy
```

### 7. Summary

```bash
✅ Deployment Complete!

🌐 Your site is live!
   Production URL: https://yourapp.vercel.app

📊 Deployment Summary:
   Platform: Vercel
   Status: Active
   Build: Successful (28.4s)
   Deploy: Successful (37s total)
   SSL: Active

📋 Next Steps:
   1. Test the live site
   2. Share: /ship-export (generate social posts)
   3. Monitor: Visit Vercel dashboard
   4. Analytics: Set up Vercel Analytics

💡 Custom Domain:
   Add your domain: /ship-deploy --domain yoursite.com
   Or in Vercel dashboard: Settings → Domains
```

## Options

Customize deployment behavior:

```bash
# Deploy to production
/ship-deploy

# Deploy to preview/staging
/ship-deploy --preview

# Skip build (deploy existing build output)
/ship-deploy --skip-build

# Force deploy (ignore warnings)
/ship-deploy --force

# Deploy to specific platform
/ship-deploy --platform vercel
/ship-deploy --platform netlify

# Add custom domain during deployment
/ship-deploy --domain yoursite.com

# Set environment variables
/ship-deploy --env KEY=value --env API_KEY=secret

# Deploy specific branch
/ship-deploy --branch main

# Verbose output
/ship-deploy --verbose
```

## Platform-Specific Features

### Vercel

**Automatic Features:**
- Next.js optimization
- Edge functions support
- Image optimization
- Automatic SSL
- DDoS protection

**Commands:**
```bash
# View deployment logs
vercel logs <deployment-url>

# List all deployments
vercel ls

# Promote preview to production
vercel promote <deployment-url>

# Rollback to previous deployment
vercel rollback
```

### Netlify

**Automatic Features:**
- Form handling
- Serverless functions
- Split testing
- Automatic SSL
- Asset optimization

**Commands:**
```bash
# Open dashboard
netlify open

# View site info
netlify status

# Set environment variable
netlify env:set KEY value
```

## Error Handling

### CLI Not Installed

```bash
❌ Vercel CLI not installed

Installing Vercel CLI globally...
> npm install -g vercel

✓ Vercel CLI installed successfully

Continuing with deployment...
```

### Authentication Failed

```bash
❌ Authentication failed

Please login manually:
  vercel login

Or use a deploy token:
  export VERCEL_TOKEN=your_token_here

Then run /ship-deploy again.
```

### Build Errors

```bash
❌ Build failed with errors:

TypeScript Error:
  src/pages/api/users.ts:15:10
  Property 'id' does not exist on type 'User'

Recommendation:
  1. Fix the TypeScript errors
  2. Run locally: npm run build
  3. Try deployment again

Skip build and deploy anyway? (NOT recommended)
(y/n): n
```

### Deployment Timeout

```bash
⚠️  Deployment is taking longer than expected...

Current status: Building
Elapsed time: 5m 30s

This can happen for large projects.

Options:
  1. Continue waiting
  2. Cancel and investigate
  3. Check dashboard for details

Continue? (y/n): y
```

### Deployment Failed

```bash
❌ Deployment failed!

Error: Build exceeded maximum duration (45s)

Possible causes:
  - Large bundle size
  - Heavy dependencies
  - Slow build scripts

Recommendations:
  1. Optimize build performance
  2. Review dependencies
  3. Check Vercel/Netlify build limits
  4. Consider upgrading plan

View full logs: vercel logs
```

## Configuration

Create `.ship-toolkit/config.json` to customize deployment:

```json
{
  "deploy": {
    "platform": "vercel",
    "autoDetect": true,
    "buildBeforeDeploy": true,
    "runChecks": true,
    "promptBeforeDeploy": true,
    "vercel": {
      "production": true,
      "regions": ["sfo1"],
      "framework": "nextjs"
    },
    "netlify": {
      "production": true,
      "functionsDirectory": "functions"
    },
    "preDeployHooks": [
      "npm run lint",
      "npm run test"
    ],
    "postDeployHooks": [
      "npm run e2e"
    ]
  }
}
```

## Environment Variables

### Set During Deployment

```bash
/ship-deploy --env DATABASE_URL=postgres://...
/ship-deploy --env API_KEY=secret --env NODE_ENV=production
```

### Load from .env file

The command automatically detects environment variables needed:

```bash
🔍 Detecting required environment variables...

Found in .env:
  - DATABASE_URL
  - API_KEY
  - STRIPE_SECRET

These will be set in production.
Continue? (y/n): y

✓ Environment variables configured
```

**Security Note:** Never commit `.env` files. The deployment will read from your local `.env` but won't upload it.

## Pre-Deployment Hooks

Run custom commands before deploying:

```json
{
  "deploy": {
    "preDeployHooks": [
      "npm run lint",
      "npm run type-check",
      "npm run test:unit"
    ]
  }
}
```

Output:

```bash
🔍 Running pre-deployment hooks...

1/3: npm run lint
✓ No linting errors

2/3: npm run type-check
✓ No type errors

3/3: npm run test:unit
✓ All tests passed (24/24)

✓ All hooks passed
```

## Post-Deployment Verification

Automatically verify deployment:

```bash
✓ Deployment complete

🔍 Running post-deployment checks...

✓ Homepage loads (200 OK)
✓ API endpoint responds (/api/health)
✓ Static assets load
✓ SSL certificate valid
✓ Response time: 245ms (Good)

All checks passed!
```

## Rollback

If deployment has issues:

```bash
# View recent deployments
/ship-deploy --list

Deployments:
  1. https://yourapp-abc123.vercel.app (5 min ago) [CURRENT]
  2. https://yourapp-xyz789.vercel.app (2 hours ago)
  3. https://yourapp-def456.vercel.app (1 day ago)

# Rollback to previous
/ship-deploy --rollback

Rolling back to: xyz789
✓ Rollback successful
Production now points to: xyz789
```

## Continuous Deployment

For automatic deployments on git push:

**Vercel:**
- Connects automatically via GitHub integration
- Each push to main deploys to production
- Pull requests get preview deployments

**Netlify:**
- Connect via Netlify dashboard
- Configure build settings
- Auto-deploy on push

**Manual setup:**
```bash
# Link repository
vercel link

# Configure build settings
vercel env pull
```

## Troubleshooting

### Deployment Stuck

```bash
⚠️  Deployment appears stuck

Debug steps:
  1. Check platform status page
  2. View deployment logs
  3. Cancel and retry

Cancel deployment? (y/n): y
```

### Large Files Warning

```bash
⚠️  Large files detected:

Files over 10 MB:
  - public/video.mp4 (45 MB)
  - public/data.json (12 MB)

These may slow deployment or exceed limits.

Recommendations:
  - Use external CDN for large media
  - Add to .vercelignore or .gitignore
  - Compress files

Continue anyway? (y/n): n
```

### Region Selection

For Vercel, deploy to specific regions:

```bash
/ship-deploy --region sfo1,iad1

Deploying to regions:
  ✓ San Francisco (sfo1)
  ✓ Washington DC (iad1)
```

## Integration with Other Commands

Complete deployment workflow:

```bash
# Full optimization and deployment
/ship-assets     # Generate assets
/ship-seo        # SEO optimization
/ship-perf       # Performance tuning
/ship-deploy     # Deploy to production ← You are here
/ship-export     # Generate launch posts
```

## Best Practices

1. **Always run build locally first**
   ```bash
   npm run build
   ```

2. **Commit changes before deploying**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   ```

3. **Use preview deployments for testing**
   ```bash
   /ship-deploy --preview
   ```

4. **Set up environment variables properly**
   - Use platform dashboard for sensitive values
   - Never commit secrets to git

5. **Monitor first deployment**
   - Test all critical functionality
   - Check error tracking
   - Verify analytics

6. **Set up custom domain**
   ```bash
   /ship-deploy --domain yoursite.com
   ```

## Advanced Usage

### Multi-Environment Deployment

```bash
# Production
/ship-deploy --env production

# Staging
/ship-deploy --env staging --preview

# Development
/ship-deploy --env development --preview
```

### Monorepo Deployment

```bash
# Deploy specific app
/ship-deploy --app web

# Deploy with specific build command
/ship-deploy --build-command "npm run build:web"
```

### Deploy with Custom Build

```bash
# Use custom build output
/ship-deploy --output-dir .output

# Use custom build command
/ship-deploy --build-command "npm run build:custom"
```

## Deployment Checklist

Before deploying:

- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ Build succeeds locally
- ✅ Environment variables configured
- ✅ Domain name ready (optional)
- ✅ Analytics set up (optional)
- ✅ Error tracking configured (optional)

## Platform Comparison

| Feature | Vercel | Netlify |
|---------|---------|---------|
| Next.js | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Static Sites | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Edge Functions | ✅ | ✅ |
| Build Time | Fast | Fast |
| Free Tier | Generous | Generous |
| Analytics | Built-in | Add-on |
| Forms | No | Built-in |

## Success Criteria

After running `/ship-deploy`, you should have:

- ✅ Live production URL
- ✅ SSL certificate active
- ✅ All routes accessible
- ✅ Assets loading correctly
- ✅ Environment variables set
- ✅ Deployment verified

---

**Ready to ship? Run `/ship-deploy` now! 🚀**
