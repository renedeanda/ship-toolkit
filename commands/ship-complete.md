---
description: Run complete ship sequence - assets, SEO, performance, launch validation, and optional deployment
---

# Ship Complete Command

The ultimate all-in-one command that runs the entire ship toolkit workflow. Automates asset generation, SEO optimization, performance tuning, launch validation, and optional deployment in a single command.

## What This Command Does

The `/ship-complete` command orchestrates:

1. **Asset Generation** - Optimizes existing images and assets
2. **SEO Optimization** - Validates sitemap, robots.txt, and meta tags
3. **Performance Optimization** - Optimizes images and configuration
4. **Launch Checklist** - Validates all 8 categories for launch readiness
5. **Deployment** (Optional) - Deploys to production if ready

**Total Time:** Typically 2-5 minutes depending on project size

## Example Output

```bash
/ship-complete

🚀 Running Complete Ship Workflow
Automating your final steps to production

Step 1/5: Asset Generation
⏳ Optimizing images...
✓ Assets optimized (23 images)
Savings: 2.06 MB → 340 KB (84% reduction)

Step 2/5: SEO Optimization
⏳ Checking SEO configuration...
✓ SEO checked (4/4 items configured)
   • Sitemap: ✓
   • Robots.txt: ✓
   • Manifest: ✓
   • Meta tags: ✓

Step 3/5: Performance Optimization
⏳ Optimizing performance...
✓ Performance optimized (23 images, 2.06 MB saved)
   • Images: 23 optimized
   • WebP format: ✓
   • Lazy loading: ✓

Step 4/5: Launch Checklist
⏳ Validating project readiness...
✅ Launch score: 85/100
✓ Ready to launch!

Step 5/5: Deployment
ℹ️ Deployment skipped (run /ship-deploy to deploy)

✨ Workflow Complete!

📊 Step Results:
   ✅ Asset Generation (2.3s)
   ✅ SEO Optimization (0.8s)
   ✅ Performance Optimization (4.1s)
   ✅ Launch Checklist (1.2s)
   ℹ️  Deployment (skipped)

📈 Summary
   Assets Optimized: 23 images
   SEO Score: 100/100
   Performance Score: 80/100
   Launch Score: 85/100
   Total Time: 8.4 seconds

┌──────────────────────────────────────┐
│   🎉 Your project is ready to launch!│
│                                       │
│   Launch Score: 85/100                │
│   Next: Run /ship-deploy to go live  │
└──────────────────────────────────────┘

📋 Next Steps

1. Review the launch checklist above
2. Deploy to production: /ship-deploy
3. Share your launch: /ship-export
4. Monitor analytics and errors

💡 Tip: Save the detailed report for your records
```

## Workflow Steps Explained

### Step 1: Asset Generation

**What it does:**
- Scans for existing images
- Optimizes all images (JPG, PNG → WebP)
- Compresses and resizes oversized images
- Removes EXIF data for privacy

**Checks:**
- Favicon exists
- OG images present
- PWA icons configured
- Manifest.json valid

**Typical Results:**
- 20-30 images optimized
- 70-85% size reduction
- 1-3 MB savings

### Step 2: SEO Optimization

**What it does:**
- Validates sitemap exists
- Checks robots.txt configuration
- Verifies manifest.json
- Checks meta tags in framework files

**Validates:**
- Sitemap (static or dynamic)
- Robots.txt (allows crawlers)
- Manifest.json (PWA ready)
- Meta tags (title, description)

**Score Calculation:**
- 25 points per item
- 100/100 = All configured
- 75/100 = 3/4 configured
- 50/100 = 2/4 configured

### Step 3: Performance Optimization

**What it does:**
- Optimizes all images
- Converts to WebP format
- Removes EXIF data
- Checks framework configuration

**Optimizations:**
- Image compression
- Format conversion
- Size reduction
- Configuration validation

**Performance Score:**
- Base: 70 points
- Images optimized: +10
- Significant savings (>1MB): +10
- Config optimized: +10
- Target: 90+

### Step 4: Launch Checklist

**What it does:**
- Runs comprehensive 34-point checklist
- Validates 8 major categories
- Identifies critical issues
- Calculates launch readiness score

**Categories:**
1. Assets & Branding (5 checks)
2. SEO Optimization (5 checks)
3. Performance (5 checks)
4. Security (5 checks)
5. Functionality (5 checks)
6. Analytics & Monitoring (3 checks)
7. Documentation (3 checks)
8. Legal & Compliance (3 checks)

**Readiness Criteria:**
- Score ≥ 70/100
- No critical failures
- All required items pass

### Step 5: Deployment (Optional)

**What it does:**
- Only runs if `--deploy` flag used
- Only deploys if launch checklist passes
- Integrates with Vercel/Netlify
- Provides live URL

**Skipped by default** - use `/ship-deploy` for manual deployment

## Options & Flags

Customize the workflow:

```bash
# Standard workflow (no deployment)
/ship-complete

# Include deployment
/ship-complete --deploy

# Skip specific steps
/ship-complete --skip-assets
/ship-complete --skip-seo
/ship-complete --skip-perf

# Auto-fix issues
/ship-complete --fix

# Set target performance score
/ship-complete --target-score 95

# Production deployment
/ship-complete --deploy --production

# Generate detailed report
/ship-complete --report html
/ship-complete --report json
/ship-complete --report md

# Resume interrupted workflow
/ship-complete --resume

# View workflow history
/ship-complete --history

# Quick mode (minimal output)
/ship-complete --quick
```

## Workflow Configuration

Create `.ship-toolkit/config.json` for persistent settings:

```json
{
  "complete": {
    "skipAssets": false,
    "skipSEO": false,
    "skipPerf": false,
    "skipDeploy": true,
    "autoFix": true,
    "targetScore": 90,
    "generateReport": true,
    "reportFormat": "html"
  }
}
```

## Resume Interrupted Workflow

If workflow is interrupted (network issue, timeout, etc.):

```bash
/ship-complete --resume

🔄 Resuming workflow from last checkpoint...

Found workflow: workflow-1234567890-abc123
Status: in-progress (3/5 steps completed)
Last updated: 5 minutes ago

Resuming from Step 4: Launch Checklist...
```

**Workflow State:**
- Automatically saved after each step
- Can resume within 24 hours
- Picks up from last completed step
- Skips already-completed steps

## Workflow History

Track your optimization runs:

```bash
/ship-complete --history

📊 Workflow History (Last 10 runs)

1. ✅ 2025-01-15 14:30:00
   Duration: 8m 32s
   Launch Score: 85/100
   Assets: 23 optimized
   Performance: 80/100

2. ✅ 2025-01-14 10:15:00
   Duration: 7m 45s
   Launch Score: 78/100
   Assets: 20 optimized
   Performance: 75/100

3. ❌ 2025-01-13 16:20:00
   Duration: 3m 12s
   Launch Score: 45/100
   Failed: Critical SEO issues
```

## Generated Reports

### HTML Report

```bash
/ship-complete --report html

✓ Report saved to .ship-toolkit/workflow-report-2025-01-15.html

Open in browser for detailed results:
- Visual progress timeline
- Before/after comparisons
- Detailed metrics
- Recommendations
```

### JSON Report

```bash
/ship-complete --report json

✓ Report saved to .ship-toolkit/workflow-report-2025-01-15.json

Perfect for:
- CI/CD integration
- Automated analysis
- Historical tracking
- Custom dashboards
```

### Markdown Summary

```bash
/ship-complete --report md

✓ Report saved to .ship-toolkit/workflow-report-2025-01-15.md

Use for:
- Documentation
- Team sharing
- Pull request comments
- Project wikis
```

## Auto-Fix Mode

Automatically fix issues:

```bash
/ship-complete --fix

🔧 Running with auto-fix enabled...

Step 1/5: Asset Generation
⚠️  No favicon found
🔧 Auto-fix: Running /ship-assets...
✓ Favicon generated

Step 2/5: SEO Optimization
⚠️  No sitemap found
🔧 Auto-fix: Creating sitemap...
✓ Sitemap created

[workflow continues...]
```

**What Auto-Fix Handles:**
- Missing assets (generates them)
- Missing sitemap (creates it)
- Missing robots.txt (creates it)
- Unoptimized images (optimizes them)
- Missing manifest (creates it)

**What Requires Manual Fix:**
- Analytics setup
- Error tracking
- Legal pages
- Custom functionality
- Domain configuration

## Integration with CI/CD

Use in GitHub Actions:

```yaml
# .github/workflows/ship-complete.yml
name: Ship Complete Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ship-complete:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Run ship complete
        run: npx ship-complete --report json

      - name: Check launch score
        run: |
          SCORE=$(cat .ship-toolkit/workflow-report-*.json | jq '.summary.launchScore')
          if [ $SCORE -lt 70 ]; then
            echo "Launch score too low: $SCORE/100"
            exit 1
          fi
          echo "Launch score: $SCORE/100 ✅"

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: ship-report
          path: .ship-toolkit/workflow-report-*.json
```

## Error Handling

### Build Not Found

```bash
❌ Step 3/5: Performance Optimization failed

Error: Build output not found

Fixes:
1. Run: npm run build
2. Check build command in package.json
3. Verify output directory

Skip this step: /ship-complete --skip-perf
```

### Low Launch Score

```bash
⚠️  Step 4/5: Launch Checklist

⚠️  Launch score: 45/100
❌ Not ready (3 critical issues)

Critical Issues:
1. No sitemap.xml
2. Missing security headers
3. No error tracking

Run individual fixes:
  /ship-seo  # Fix sitemap
  /ship-perf # Fix headers

Then re-run: /ship-complete
```

### Deployment Failed

```bash
❌ Step 5/5: Deployment failed

Error: Vercel CLI not authenticated

Fixes:
1. Run: vercel login
2. Or skip deployment: /ship-complete --skip-deploy

Manual deployment: /ship-deploy
```

## Performance Benchmarks

**Typical Timings:**

| Project Size | Duration | Steps |
|-------------|----------|-------|
| Small (< 10 files) | 30-60s | 4/5 |
| Medium (10-50 files) | 1-3 min | 5/5 |
| Large (50+ files) | 3-5 min | 5/5 |

**Bottlenecks:**
- Image optimization (largest factor)
- Network speed (deployment)
- Build complexity

**Optimization Tips:**
- Pre-optimize large images
- Use SSD storage
- Good internet connection for deployment

## Best Practices

**Before Running:**
1. Commit all changes
2. Run `npm install`
3. Ensure `npm run build` works
4. Review `.gitignore` includes `.env`

**After Running:**
1. Review the launch checklist
2. Fix any critical issues
3. Re-run if score < 70
4. Deploy when ready

**Regular Usage:**
- Run before each deployment
- Run weekly during development
- Run after major changes
- Track scores over time

## Comparison with Individual Commands

**Individual Commands:**
```bash
/ship-assets      # ~1 min
/ship-seo         # ~30 sec
/ship-perf        # ~2 min
/ship-launch      # ~30 sec
/ship-deploy      # ~1 min
Total: ~5 min + manual coordination
```

**Complete Workflow:**
```bash
/ship-complete    # ~3 min automated
Total: ~3 min, fully automated
```

**Savings:** 40% faster + zero manual coordination

## Success Criteria

After running `/ship-complete`, you should have:

- ✅ Overall workflow success
- ✅ Launch score ≥ 70
- ✅ All automated optimizations applied
- ✅ Detailed report generated
- ✅ Clear next steps provided

## Troubleshooting

**Workflow Stuck:**
```bash
# Cancel and restart
Ctrl+C
/ship-complete
```

**Resume Not Working:**
```bash
# Clear state and restart
/ship-complete --clear-state
/ship-complete
```

**Scores Not Improving:**
```bash
# Run with detailed output
/ship-complete --verbose

# Check individual steps
/ship-assets --verbose
/ship-seo --analyze
/ship-perf --analyze
```

---

**Ready to ship? Run `/ship-complete` now! 🚀🚀🚀**

---

## Complete Command Family

All ship commands at a glance:

```bash
# Individual Commands
/ship-assets      # Generate favicons, OG images, icons
/ship-seo         # Optimize meta tags, sitemap, robots.txt
/ship-perf        # Optimize performance, images, bundle
/ship-deploy      # Deploy to Vercel/Netlify
/ship-launch      # Pre-launch checklist validation

# Orchestrator
/ship-complete    # Run everything in sequence ← You are here

# Utilities
/ship-status      # Check what's done vs. missing
/ship-preview     # Preview OG images, meta tags
/ship-export      # Export launch assets (tweets, etc)
```

**Pro Tip:** Use `/ship-complete` for new projects, individual commands for targeted optimizations.
