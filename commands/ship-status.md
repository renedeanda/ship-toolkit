---
description: Quick status check - see what's done vs. what's missing
---

# Ship Status Command

Quick overview of your project's ship-readiness. Shows what's been completed, what's missing, and your current scores at a glance.

## What This Command Does

Provides instant status check:
- ✅ What's completed
- ❌ What's missing
- 📊 Current scores
- 🎯 Next steps

**Duration:** < 1 second

## Example Output

```bash
/ship-status

📊 Ship Toolkit Status

✅ Assets & Branding
   ✓ Favicon: favicon.ico
   ✓ OG Images: 2 files
   ✓ PWA Icons: 2 files
   ✓ Manifest: manifest.json

✅ SEO Optimization
   ✓ Sitemap: app/sitemap.ts
   ✓ Robots: public/robots.txt
   ✓ Meta Tags: Configured
   ⚠ Search Console: Not set up

⚠️  Performance
   ✓ Images: 23 optimized (WebP)
   ✓ Build: .next/ exists
   ⚠ Lighthouse: Not run yet

   Run /ship-perf for full analysis

❌ Deployment
   ✗ Not deployed

   Run /ship-deploy when ready

📈 Scores
   Assets: 100/100 ✅
   SEO: 75/100 ⚠️
   Performance: 80/100 ✅
   Launch Readiness: 70/100 ✅

🎯 Status: Ready to Launch!

📋 Recommended Next Steps
   1. Deploy to production: /ship-deploy
   2. Set up Google Search Console
   3. Monitor analytics

💡 Quick Actions
   /ship-complete  - Run full optimization
   /ship-launch    - Detailed checklist
   /ship-deploy    - Deploy now
```

## Quick Status (One-Liner)

```bash
/ship-status --quick

🚀 Status: Ready to Launch (70/100) | Assets: ✅ | SEO: ⚠️ | Perf: ✅ | Deploy: ❌
```

## Detailed Breakdown

### Assets Status

Shows:
- Favicon files (all sizes)
- OG images (Open Graph)
- Twitter card images
- PWA icons
- Manifest.json
- Apple touch icons

### SEO Status

Shows:
- Sitemap (static or dynamic)
- Robots.txt
- Meta tags
- Schema.org markup
- Search Console verification

### Performance Status

Shows:
- Image optimization
- Build output
- Config optimization
- Last Lighthouse score (if run)
- Bundle size

### Deployment Status

Shows:
- Platform detected
- Last deployment
- Production URL
- Preview URLs

## Options

```bash
# Standard status
/ship-status

# Quick one-liner
/ship-status --quick

# JSON output
/ship-status --json

# Only show missing items
/ship-status --missing-only

# Only show specific category
/ship-status --assets
/ship-status --seo
/ship-status --performance
/ship-status --deployment
```

## JSON Output

Perfect for scripts and automation:

```bash
/ship-status --json

{
  "timestamp": "2025-01-15T14:30:00.000Z",
  "overallScore": 70,
  "readyToLaunch": true,
  "categories": {
    "assets": {
      "score": 100,
      "items": {
        "favicon": true,
        "ogImages": 2,
        "pwaIcons": 2,
        "manifest": true
      }
    },
    "seo": {
      "score": 75,
      "items": {
        "sitemap": true,
        "robots": true,
        "metaTags": true,
        "searchConsole": false
      }
    },
    "performance": {
      "score": 80,
      "items": {
        "imagesOptimized": 23,
        "buildExists": true,
        "lighthouseScore": null
      }
    },
    "deployment": {
      "deployed": false,
      "platform": "vercel",
      "url": null
    }
  },
  "nextSteps": [
    "Deploy to production",
    "Set up Search Console"
  ]
}
```

## Use in Scripts

```bash
#!/bin/bash

# Check if ready to deploy
STATUS=$(ship-status --json)
SCORE=$(echo $STATUS | jq '.overallScore')

if [ $SCORE -ge 70 ]; then
  echo "✅ Ready to deploy (score: $SCORE)"
  ship-deploy
else
  echo "❌ Not ready (score: $SCORE)"
  echo "Run: ship-complete --fix"
  exit 1
fi
```

## Comparison View

See before/after changes:

```bash
/ship-status --compare

📊 Status Comparison

                    Before    After    Change
Assets Score:       60/100    100/100  +40 ✅
SEO Score:          45/100    75/100   +30 ✅
Performance Score:  58/100    80/100   +22 ✅
Launch Score:       50/100    70/100   +20 ✅

Last run: 2 hours ago
Improvements: 4 categories
```

## Watch Mode

Monitor status in real-time:

```bash
/ship-status --watch

📊 Ship Status (Auto-refresh every 5s)

[Status display updates automatically...]

Press Ctrl+C to exit
```

## Integration with Other Commands

```bash
# Check status before deploying
/ship-status && /ship-deploy

# Fix issues if status is low
/ship-status --quick || /ship-complete --fix

# Status as part of workflow
/ship-complete && /ship-status
```

## Status Badges

Generate status badges for README:

```bash
/ship-status --badge

Generated badges:
  Launch: ![Launch Ready](https://img.shields.io/badge/launch-ready-brightgreen)
  SEO: ![SEO Score](https://img.shields.io/badge/seo-75%25-yellow)
  Perf: ![Performance](https://img.shields.io/badge/performance-80%25-green)

Saved to: .ship-toolkit/badges.md
```

## Exit Codes

For CI/CD integration:

- `0` - Ready to launch (score ≥ 70)
- `1` - Not ready (score < 70)
- `2` - Critical errors

```bash
# Use in CI/CD
/ship-status || exit 1
```

## Configuration

`.ship-toolkit/config.json`:

```json
{
  "status": {
    "minimumScore": 70,
    "showOnlyMissing": false,
    "includeHistory": true,
    "refreshInterval": 5
  }
}
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `/ship-status` | Full status display |
| `/ship-status --quick` | One-line summary |
| `/ship-status --json` | JSON output |
| `/ship-status --missing-only` | Show only issues |
| `/ship-status --compare` | Before/after view |
| `/ship-status --watch` | Auto-refresh |

---

**Check your status anytime with `/ship-status`! 📊**
