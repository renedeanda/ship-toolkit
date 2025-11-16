---
description: Pre-launch checklist validation - ensure everything is ready before going live
---

# Ship Launch Command

Comprehensive pre-launch checklist to ensure your project is ready for deployment. Validates assets, SEO, performance, security, and more before you ship to production.

## What This Command Does

The `/ship-launch` command:

1. **Validates Assets** - Checks favicons, OG images, PWA icons
2. **Verifies SEO** - Ensures sitemap, robots.txt, meta tags are configured
3. **Checks Performance** - Validates build output and optimizations
4. **Audits Security** - Reviews security headers and environment variables
5. **Tests Functionality** - Verifies 404 page, error handling (manual)
6. **Reviews Analytics** - Checks monitoring setup (manual)
7. **Validates Documentation** - Ensures README and docs exist
8. **Checks Legal** - Reviews privacy policy and terms (if needed)
9. **Generates Report** - Creates detailed checklist report
10. **Provides Next Steps** - Guides you on what to fix

## Checklist Sections

### 1. Assets & Branding (Required)
- ✅ Favicon generated (favicon.ico)
- ✅ Open Graph images created
- ✅ Twitter cards configured
- ✅ PWA icons ready
- ✅ Manifest.json exists

### 2. SEO Optimization (Required)
- ✅ Sitemap generated
- ✅ Robots.txt created
- ✅ Meta tags complete
- ℹ️  Structured data added
- ℹ️  Google Search Console setup

### 3. Performance (Required)
- ✅ Production build exists
- ✅ Images optimized
- ✅ Framework config optimized
- ℹ️  Lighthouse score > 90
- ℹ️  Core Web Vitals good

### 4. Security (Required)
- ✅ Environment variables not exposed
- ✅ Security headers set
- ℹ️  Dependencies up to date
- ℹ️  No API keys in client code
- ℹ️  HTTPS enabled

### 5. Functionality (Optional)
- ℹ️  404 page exists
- ℹ️  Error handling in place
- ℹ️  Forms working correctly
- ℹ️  Links not broken
- ℹ️  Mobile responsive

### 6. Analytics & Monitoring (Optional)
- ℹ️  Analytics installed
- ℹ️  Error tracking setup
- ℹ️  Performance monitoring

### 7. Documentation (Optional)
- ✅ README.md complete
- ℹ️  Changelog started
- ℹ️  API docs (if applicable)

### 8. Legal & Compliance (Optional)
- ℹ️  Privacy policy (if needed)
- ℹ️  Terms of service (if needed)
- ℹ️  Cookie consent (if needed)

**Legend:**
- ✅ = Pass (automated check)
- ❌ = Fail (automated check)
- ⚠️  = Warning (needs attention)
- ℹ️  = Skip (manual verification)

## Example Output

```bash
/ship-launch

🚀 Running pre-launch checklist...

✅ Assets & Branding (5/5) - 100%
   ✅ Favicon generated - favicon.ico found
   ✅ Open Graph images created - 2 OG images found
   ✅ Twitter cards configured - Twitter images found
   ✅ PWA icons ready - 2 PWA icons found
   ✅ Manifest.json exists - manifest.json found

✅ SEO Optimization (4/5) - 80%
   ✅ Sitemap generated - Sitemap found
   ✅ Robots.txt created - robots.txt found
   ✅ Meta tags complete - Meta tags configured
   ⚠️  Structured data added - Manual verification needed
   ℹ️  Google Search Console setup - Manual setup required

✅ Performance (3/5) - 60%
   ✅ Production build exists - Build output found
   ✅ Images optimized - 23 WebP images found
   ✅ Framework config optimized - Config optimized
   ℹ️  Lighthouse score > 90 - Run /ship-perf to check
   ℹ️  Core Web Vitals good - Run /ship-perf to check

⚠️  Security (3/5) - 60%
   ✅ Environment variables not exposed - .env is gitignored
   ⚠️  Security headers set - No security headers
   ℹ️  Dependencies up to date - Run: npm audit
   ℹ️  No API keys in client code - Manual verification needed
   ℹ️  HTTPS enabled - Verify after deployment

ℹ️  Functionality (1/5) - 15%
   ⚠️  404 page exists - No custom 404 page
   ℹ️  Error handling in place - Manual verification needed
   ℹ️  Forms working correctly - Manual testing required
   ℹ️  Links not broken - Manual verification needed
   ℹ️  Mobile responsive - Manual testing required

ℹ️  Analytics & Monitoring (0/3) - 0%
   ℹ️  Analytics installed - Manual setup (Google Analytics, etc.)
   ℹ️  Error tracking setup - Manual setup (Sentry, etc.)
   ℹ️  Performance monitoring - Manual setup

⚠️  Documentation (1/4) - 25%
   ✅ README.md complete - README.md found
   ℹ️  Changelog started - No CHANGELOG.md
   ℹ️  API docs (if applicable) - Only if you have an API

ℹ️  Legal & Compliance (0/3) - 0%
   ℹ️  Privacy policy (if needed) - Required if collecting user data
   ℹ️  Terms of service (if needed) - Required for commercial apps
   ℹ️  Cookie consent (if needed) - Required for GDPR compliance

📊 Overall Score: 75/100

┌─────────────────────────────────────────┐
│         ✅ READY TO LAUNCH!             │
│                                          │
│ Your project passes all critical checks. │
│                                          │
│ Score: 75/100                            │
└─────────────────────────────────────────┘

⚠️  Warnings

⚠️  Security headers set: No security headers
   Suggestion: Run /ship-perf

⚠️  404 page exists: No custom 404 page

📋 Next Steps

1. Review and address warnings
2. Deploy to production: /ship-deploy
3. Share your launch: /ship-export
4. Monitor analytics and errors

💡 Tip: Run /ship-complete to optimize everything at once
```

## Scoring System

**Section Scores:**
- **Pass** (✅): 100 points
- **Warning** (⚠️ ): 50 points
- **Skip** (ℹ️ ): 75 points (manual items)
- **Fail** (❌): 0 points

**Overall Score:**
- **90-100**: Excellent - Ready to launch!
- **70-89**: Good - Minor improvements recommended
- **50-69**: Fair - Some issues need attention
- **Below 50**: Poor - Critical issues must be fixed

**Launch Readiness:**
- **Ready** if: Score ≥ 70 AND no critical failures
- **Not Ready** if: Score < 70 OR critical failures exist

## Options

Customize checklist behavior:

```bash
# Standard checklist
/ship-launch

# Generate HTML report
/ship-launch --report html

# Generate JSON report
/ship-launch --report json

# Generate Markdown summary
/ship-launch --report md

# Auto-fix issues where possible
/ship-launch --fix

# Only check specific sections
/ship-launch --sections assets,seo

# Skip manual checks
/ship-launch --skip-manual

# Strict mode (all checks required)
/ship-launch --strict
```

## Generated Reports

### HTML Report

Creates a beautiful, shareable HTML report:

```bash
/ship-launch --report html

✓ Report saved to .ship-toolkit/launch-report.html

Open in browser to view detailed results.
```

**Features:**
- Visual progress bars
- Color-coded sections
- Expandable details
- Timestamp
- Shareable link

### JSON Report

Generates machine-readable JSON:

```bash
/ship-launch --report json

✓ JSON report saved to .ship-toolkit/launch-report.json
```

**Use cases:**
- CI/CD integration
- Automated testing
- Custom dashboards
- Historical tracking

### Markdown Summary

Creates a markdown summary for documentation:

```bash
/ship-launch --report md

✓ Summary saved to .ship-toolkit/launch-summary.md
```

## Auto-Fix Mode

Automatically fix issues where possible:

```bash
/ship-launch --fix

🔧 Auto-fixing issues...

⏳ Fixing: Favicon generated
   Running: /ship-assets
   ✓ Favicon generated

⏳ Fixing: Sitemap generated
   Running: /ship-seo
   ✓ Sitemap created

⏳ Fixing: Images optimized
   Running: /ship-perf
   ✓ Images optimized

✓ Fixed 3/5 automated issues

Re-running checklist...
📊 New Score: 85/100 (↑ 10 points)
```

## Integration with CI/CD

Use in GitHub Actions or other CI/CD:

```yaml
# .github/workflows/pre-deploy.yml
name: Pre-Deploy Checks

on:
  push:
    branches: [main]

jobs:
  checklist:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Run launch checklist
        run: npx ship-launch --report json

      - name: Check score
        run: |
          SCORE=$(cat .ship-toolkit/launch-report.json | jq '.overallScore')
          if [ $SCORE -lt 70 ]; then
            echo "Score too low: $SCORE"
            exit 1
          fi
```

## Manual Checklist Items

Some items require manual verification:

### Functionality Checks

**404 Page:**
- Visit: `https://yoursite.com/nonexistent`
- Should show custom 404 page
- Should have helpful navigation

**Error Handling:**
- Test error scenarios
- Verify error boundaries work
- Check error messages are helpful

**Forms:**
- Submit all forms
- Test validation
- Verify success/error states

**Links:**
- Click all navigation links
- Test external links
- Verify deep links work

**Mobile Responsiveness:**
- Test on real devices
- Check breakpoints
- Verify touch interactions

### Analytics & Monitoring

**Analytics:**
```bash
# Google Analytics
Check: window.gtag exists
Verify: Events are tracked

# Vercel Analytics
Check: Analytics script loaded
Verify: Page views tracked
```

**Error Tracking:**
```bash
# Sentry
Check: Sentry.init() called
Verify: Test error is captured
```

**Performance Monitoring:**
```bash
# Check Real User Monitoring (RUM)
Verify: Metrics are collected
Check: Dashboard shows data
```

### Legal & Compliance

**Privacy Policy:**
- Required if: Collecting user data
- Should include: Data collection, usage, sharing
- Must have: Contact information

**Terms of Service:**
- Required if: Commercial app
- Should include: User rights, limitations
- Must have: Dispute resolution

**Cookie Consent:**
- Required if: EU users (GDPR)
- Should show: Cookie banner
- Must allow: Opt-out

## Troubleshooting

### Score Lower Than Expected

```bash
❌ Score: 45/100

Debug steps:
1. Check which sections failed
2. Run individual commands:
   - /ship-assets
   - /ship-seo
   - /ship-perf
3. Re-run checklist
```

### False Positives

```bash
⚠️  Item marked as warning but is correct

Solutions:
1. Check file locations
2. Verify naming conventions
3. Manual verification may be needed
```

### Critical Issues Won't Fix

```bash
❌ Critical issues remain after fixes

Possible causes:
1. Files in wrong location
2. Build not run
3. Git not committed

Solutions:
1. Verify file paths
2. Run: npm run build
3. Commit changes
```

## Best Practices

**Before Every Deployment:**
1. Run `/ship-launch`
2. Fix all critical issues
3. Address warnings
4. Re-run to verify
5. Deploy when score ≥ 70

**Regular Audits:**
- Run weekly during development
- Run before each release
- Track score over time
- Document improvements

**Team Collaboration:**
- Share HTML reports
- Set minimum score requirements
- Assign sections to team members
- Review checklist in standups

## Configuration

Customize checklist via `.ship-toolkit/config.json`:

```json
{
  "launch": {
    "minimumScore": 70,
    "requireAllCritical": true,
    "sections": {
      "assets": {
        "required": true,
        "weight": 1.0
      },
      "seo": {
        "required": true,
        "weight": 1.0
      },
      "performance": {
        "required": true,
        "weight": 0.8
      },
      "security": {
        "required": true,
        "weight": 0.9
      },
      "functionality": {
        "required": false,
        "weight": 0.5
      },
      "analytics": {
        "required": false,
        "weight": 0.3
      }
    },
    "autoFix": false,
    "generateReport": true,
    "reportFormat": "html"
  }
}
```

## Success Criteria

After running `/ship-launch`, you should have:

- ✅ Overall score ≥ 70
- ✅ No critical failures
- ✅ All required sections passing
- ✅ Warnings reviewed and addressed
- ✅ Manual items verified
- ✅ Report generated for records

## Complete Workflow

Full optimization workflow:

```bash
# 1. Generate assets
/ship-assets

# 2. Optimize SEO
/ship-seo

# 3. Optimize performance
/ship-perf

# 4. Run launch checklist
/ship-launch ← You are here

# 5. Deploy if ready
/ship-deploy

# 6. Share launch
/ship-export
```

Or use the combined command:

```bash
/ship-complete  # Runs everything automatically
```

---

**Ready to launch? Run `/ship-launch` now to verify! 🚀**
