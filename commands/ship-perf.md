---
description: Optimize your site's performance - images, bundle size, Core Web Vitals
---

# Ship Performance Command

Comprehensive performance optimization for your web project using Lighthouse analysis, image optimization, and bundle analysis.

## What This Command Does

The `/ship-perf` command:

1. **Analyzes Performance** - Runs Lighthouse audit on your development server
2. **Optimizes Images** - Converts images to WebP, resizes, and compresses them
3. **Analyzes Bundle** - Identifies large files and optimization opportunities
4. **Auto-Fixes Issues** - Automatically applies performance improvements
5. **Updates Config** - Optimizes framework configuration (Next.js, Vite)
6. **Generates Report** - Creates before/after comparison

## Prerequisites

- Project must be buildable (`npm run build` works)
- For Lighthouse analysis, dev server must be runnable (`npm run dev`)

## Steps

### 1. Detect Framework and Start Server

```bash
🔍 Detecting project type...
✓ Framework: Next.js (App Router)

🚀 Starting development server...
> npm run dev

✓ Server running at http://localhost:3000
```

### 2. Run Performance Analysis

```bash
🔍 Running Lighthouse performance audit...

This may take 30-60 seconds...

⏳ Analyzing performance metrics...
⏳ Checking Core Web Vitals...
⏳ Identifying opportunities...

✓ Performance analysis complete!
```

### 3. Display Current Performance

```bash
📊 Performance Score: 58/100

⏱️  Core Web Vitals:
   First Contentful Paint: 2.1s (⚠️  Needs improvement)
   Largest Contentful Paint: 3.8s (❌ Poor)
   Total Blocking Time: 450ms (⚠️  Needs improvement)
   Cumulative Layout Shift: 0.15 (⚠️  Needs improvement)
   Speed Index: 3.2s

📦 Bundle Analysis:
   Total size: 458 KB (gzipped: 142 KB)
   Largest file: main.js (234 KB)
   JavaScript: 380 KB
   CSS: 78 KB

🖼️  Image Issues:
   Total images: 23 files
   Total size: 2.4 MB
   Unoptimized: 23 images (can be 340 KB with WebP)
   Missing lazy loading: 18 images
   Oversized images: 12 files (larger than 1920px)

❌ Issues Found:
   1. Unoptimized images → potential 2.1 MB savings
   2. No lazy loading on images
   3. Large bundle size (458 KB)
   4. Unused CSS detected (94 KB)
   5. No compression enabled
   6. Images not in next-gen formats
   7. SWC minification not enabled
```

### 4. Show Optimization Opportunities

```bash
💡 Recommended Optimizations:

High Impact (Auto-fixable):
   1. ✅ Optimize images → Save ~2.1 MB, improve LCP by 1.2s
   2. ✅ Convert images to WebP → Save 450 KB
   3. ✅ Add lazy loading → Improve initial load by 800ms
   4. ✅ Enable compression → Save 280 KB transfer size
   5. ✅ Resize oversized images → Save 340 KB

Medium Impact (Auto-fixable):
   6. ✅ Enable SWC minification → Save ~60 KB
   7. ✅ Remove console logs in production → Save ~15 KB
   8. ✅ Optimize Next.js config → Improve overall performance

Low Impact (Manual review needed):
   9. ⚠️  Code splitting → Reduce initial bundle
   10. ⚠️  Remove unused dependencies → Save space

📊 Estimated Improvement: +36 points (to 94/100)

Auto-fix available for items 1-8.
Would you like to apply these optimizations? (y/n)
```

### 5. Apply Optimizations

User confirms: **y**

```bash
🔧 Applying optimizations...

⏳ Step 1/5: Optimizing images...
   Converting to WebP format...
   ✓ hero.jpg → hero.webp (480 KB → 145 KB, 70% smaller)
   ✓ product-1.png → product-1.webp (320 KB → 85 KB, 73% smaller)
   ✓ background.jpg → background.webp (650 KB → 180 KB, 72% smaller)
   ... (20 more files)

   Resizing oversized images...
   ✓ banner.jpg (3840x2160 → 1920x1080)
   ✓ header.png (2560x1440 → 1920x1080)
   ... (10 more files)

   ✓ Image optimization complete!
   Optimized: 23 images
   Savings: 2.06 MB → 340 KB (84% reduction)

⏳ Step 2/5: Adding lazy loading...
   ✓ Updated 18 <img> tags with loading="lazy"
   ✓ Converted to Next.js <Image> where possible
   ✓ Lazy loading complete!

⏳ Step 3/5: Optimizing configuration...
   ✓ Updated next.config.js:
      • Enabled compress: true
      • Enabled swcMinify: true
      • Added image optimization settings
      • Configured console.log removal for production
      • Added security headers
   ✓ Configuration optimized!

⏳ Step 4/5: Enabling compression...
   ✓ Compression enabled in Next.js config
   ✓ Assets will be gzipped automatically

⏳ Step 5/5: Removing unused CSS...
   Analyzing CSS usage...
   ✓ Identified 94 KB unused styles
   ✓ Suggestions added to report

🎉 Optimizations applied successfully!
```

### 6. Re-run Analysis

```bash
🔄 Re-running Lighthouse to verify improvements...

⏳ Analyzing optimized site...
✓ Analysis complete!
```

### 7. Show Improvements

```bash
📊 New Performance Score: 94/100 (↑ 36 points!)

⏱️  Improved Core Web Vitals:
   First Contentful Paint: 0.9s (↓ 1.2s) ✅ Good
   Largest Contentful Paint: 1.4s (↓ 2.4s) ✅ Good
   Total Blocking Time: 120ms (↓ 330ms) ✅ Good
   Cumulative Layout Shift: 0.02 (↓ 0.13) ✅ Good
   Speed Index: 1.2s (↓ 2.0s) ✅ Good

💾 File Size Improvements:
   Total bundle: 458 KB → 164 KB (64% reduction)
   Transfer size: 458 KB → 178 KB (61% reduction)
   Images: 2.4 MB → 340 KB (86% reduction)

⚡ Performance Improvements:
   Load time: 3.8s → 1.4s (63% faster)
   Time to Interactive: 4.2s → 1.8s (57% faster)

✅ All Core Web Vitals in "Good" range!

🎯 Target Score: 90/100 → Achieved! ✓
```

### 8. Generate Summary Report

```bash
✅ Performance Optimization Complete!

📈 Summary:
   Score: 58 → 94 (↑ 62%)
   LCP: 3.8s → 1.4s (↓ 63%)
   Bundle: 458 KB → 164 KB (↓ 64%)
   Images: 2.4 MB → 340 KB (↓ 86%)

📝 Applied Fixes:
   ✓ Optimized 23 images (2.06 MB → 340 KB)
   ✓ Converted images to WebP format
   ✓ Resized 12 oversized images
   ✓ Added lazy loading to 18 images
   ✓ Enabled compression
   ✓ Optimized Next.js configuration
   ✓ Enabled SWC minification
   ✓ Configured console.log removal

📊 Detailed Report:
   Saved to: .ship-toolkit/performance-report.html
   View in browser for before/after comparison

🎯 Next Steps:
   1. Run a production build: npm run build
   2. Test on real devices
   3. Monitor Core Web Vitals in production
   4. Set up performance budgets
   5. Deploy: /ship-deploy

💡 Pro Tips:
   • Run /ship-perf before each deployment
   • Monitor performance in production
   • Consider using CDN for static assets
   • Set up performance monitoring (Vercel Analytics, etc.)
```

## Options

You can customize the optimization behavior:

```bash
# Auto-apply all fixes without prompting
/ship-perf --fix

# Just analyze, don't apply any fixes
/ship-perf --analyze-only

# Only optimize images
/ship-perf --images-only

# Set target performance score
/ship-perf --target-score 95

# Run analysis for mobile
/ship-perf --mobile

# Run analysis for desktop
/ship-perf --desktop

# Skip Lighthouse (just optimize)
/ship-perf --skip-lighthouse

# Compare with production
/ship-perf --compare-prod https://yoursite.com
```

## Error Handling

### Dev Server Fails to Start

```bash
❌ Failed to start dev server

Please ensure:
   1. Dependencies are installed (npm install)
   2. Port 3000 is available
   3. No build errors

Try manually: npm run dev

Or specify a different port: /ship-perf --port 3001
```

### Lighthouse Timeout

```bash
⚠️  Lighthouse analysis timed out

Trying again with increased timeout...

If this continues:
   1. Check if server is responding
   2. Simplify the page being analyzed
   3. Try analyzing a specific route: /ship-perf --url /about
```

### Optimization Fails

```bash
⚠️  Some optimizations failed:

❌ Image optimization failed for 2 files:
   • large-file.tiff (unsupported format)
   • broken.jpg (corrupted file)

✓ Other optimizations applied successfully

View detailed log: .ship-toolkit/perf-errors.log
```

### Build Not Found

```bash
⚠️  No build output found

Please run a production build first:
   npm run build

Then run: /ship-perf
```

## Configuration

Create `.ship-toolkit/config.json` to customize behavior:

```json
{
  "performance": {
    "targetScore": 90,
    "imageQuality": 85,
    "enableWebP": true,
    "enableAVIF": false,
    "enableLazyLoading": true,
    "enableCompression": true,
    "maxImageWidth": 1920,
    "maxImageHeight": 1080,
    "removeExif": true,
    "budgets": {
      "maxBundleSize": 200000,
      "maxImageSize": 100000,
      "maxLCP": 2000,
      "maxCLS": 0.1
    },
    "lighthouse": {
      "formFactor": "mobile",
      "throttling": true
    }
  }
}
```

## What Gets Modified

This command will modify:

- **Images**: Optimized versions replace originals
- **Config files**: `next.config.js`, `vite.config.ts`
- **HTML/JSX files**: Adds `loading="lazy"` to images
- **Package.json**: May suggest dependency updates

## Best Practices

1. **Run before deployment** - Always optimize before going live
2. **Test after optimization** - Verify site still works correctly
3. **Commit changes** - Version control your optimizations
4. **Monitor production** - Track real-world performance
5. **Set budgets** - Define performance budgets and stick to them

## Integration with Other Commands

```bash
# Full optimization workflow
/ship-assets    # Generate optimized assets
/ship-seo       # SEO optimization
/ship-perf      # Performance optimization ← You are here
/ship-deploy    # Deploy to production
```

## Performance Budgets

Set performance budgets to maintain quality:

```json
{
  "budgets": {
    "maxBundleSize": 200000,      // 200 KB
    "maxImageSize": 100000,       // 100 KB per image
    "maxLCP": 2000,               // 2 seconds
    "maxFCP": 1800,               // 1.8 seconds
    "maxCLS": 0.1,                // Layout shift
    "minLighthouseScore": 90      // Lighthouse score
  }
}
```

If budgets are exceeded, the command will warn you.

## Troubleshooting

### Images Not Optimizing

- Check file permissions
- Ensure Sharp is installed: `npm install sharp`
- Check image formats (only JPG, PNG, WebP supported)

### Config Not Updating

- Check if config file is read-only
- Manually review and merge changes
- Backup config before running command

### Performance Score Not Improving

- Ensure production build is used
- Check for external dependencies (slow APIs)
- Review Lighthouse diagnostics
- Consider server-side optimizations

## Technical Details

### Tools Used

- **Lighthouse** - Performance analysis
- **Sharp** - Image processing
- **Puppeteer** - Browser automation
- **Custom analyzers** - Bundle and dependency analysis

### What Gets Analyzed

- Core Web Vitals (FCP, LCP, CLS, TBT)
- Image optimization opportunities
- JavaScript bundle size
- CSS usage and size
- Compression settings
- Caching strategies
- Third-party scripts
- Render-blocking resources

### Performance Metrics Explained

- **FCP (First Contentful Paint)**: When first content appears
- **LCP (Largest Contentful Paint)**: When main content loads
- **TBT (Total Blocking Time)**: How long page is unresponsive
- **CLS (Cumulative Layout Shift)**: Visual stability
- **SI (Speed Index)**: How quickly content is visually displayed

## Examples

### Basic Usage

```bash
/ship-perf
```

### Advanced Usage

```bash
# Mobile optimization
/ship-perf --mobile --target-score 95 --fix

# Desktop optimization with specific URL
/ship-perf --desktop --url /dashboard

# Images only, no Lighthouse
/ship-perf --images-only --skip-lighthouse

# Full analysis with comparison
/ship-perf --compare-prod https://mysite.com --analyze-only
```

## Success Criteria

After running `/ship-perf`, you should see:

- ✅ Performance score ≥ 90
- ✅ All Core Web Vitals in "Good" range
- ✅ Bundle size reduced by at least 30%
- ✅ Images optimized (WebP format)
- ✅ Lazy loading enabled
- ✅ Compression configured

---

**Ready to ship fast? Run `/ship-perf` now! 🚀**
