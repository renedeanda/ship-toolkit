---
description: Preview how your site looks in social shares and search results
---

# Ship Preview Command

Visual preview of how your site appears in social media shares, search results, and browser tabs. See your OG images, meta tags, and favicons in action before launching.

## What This Command Does

Generates visual previews:
- 🖼️ Social share previews (Facebook, LinkedIn, Twitter)
- 🔍 Google search result preview
- 🌐 Browser tab preview
- 📱 Mobile app card preview
- 📊 Interactive HTML preview

**Duration:** < 5 seconds

## Example Output

```bash
/ship-preview

🔍 Generating Previews...

✓ Generated social share previews
✓ Generated search result preview
✓ Generated browser tab preview
✓ Created interactive preview page

📄 Preview saved to: .ship-toolkit/preview.html

Open in browser to see:
  • Facebook share preview
  • Twitter card preview
  • LinkedIn share preview
  • Google search result
  • Browser tab appearance
  • Mobile app cards

🌐 Opening preview in browser...

file://.ship-toolkit/preview.html
```

## Interactive Preview Page

The generated `preview.html` shows:

### 1. Social Media Previews

**Facebook/LinkedIn Preview:**
```
┌─────────────────────────────────────┐
│ [OG Image - 1200x630]                │
│                                      │
│ Your App Name                        │
│ Your app description that appears... │
│ 🔗 yourapp.com                       │
└─────────────────────────────────────┘
```

**Twitter Card Preview:**
```
┌─────────────────────────────────────┐
│ [Twitter Image - 1200x600]           │
│                                      │
│ Your App Name                        │
│ Your app description...              │
│ 🔗 yourapp.com                       │
└─────────────────────────────────────┘
```

### 2. Search Result Preview

**Google Search Result:**
```
🔗 Your App Name
https://yourapp.com
Your meta description appears here and
tells people what your app does...
```

### 3. Browser Tab Preview

**Browser Tab:**
```
[🎯 Favicon] Your App Name
```

### 4. Mobile App Card

**iOS/Android Share Card:**
```
┌─────────────────────────┐
│ [App Icon]              │
│ Your App Name           │
│ Your description        │
│ [ Open ]                │
└─────────────────────────┘
```

## Options

```bash
# Standard preview
/ship-preview

# Open automatically in browser
/ship-preview --open

# Generate specific preview only
/ship-preview --social
/ship-preview --search
/ship-preview --browser

# Export as images
/ship-preview --export png

# Dark mode preview
/ship-preview --dark

# Multiple devices
/ship-preview --devices mobile,tablet,desktop

# Share preview URL
/ship-preview --share
```

## Preview Types

### Social Media Preview

Shows how your site appears when shared on:
- Facebook
- LinkedIn
- Twitter
- Slack
- Discord
- WhatsApp
- Telegram

**Validates:**
- OG image size (1200x630)
- Title length (< 60 chars)
- Description length (< 155 chars)
- Image quality
- Aspect ratio

### Search Result Preview

Shows Google search appearance:

**Validates:**
- Title length (< 60 chars)
- Meta description (150-160 chars)
- URL display
- Rich snippets
- Structured data

### Browser Tab Preview

Shows browser tab appearance:

**Validates:**
- Favicon displays correctly
- Title is readable
- Icon is clear at 16x16
- Works in all browsers

### Mobile Preview

Shows mobile app card:

**Validates:**
- Apple touch icon (180x180)
- Android icons (192x192, 512x512)
- Manifest configuration
- Theme color

## Export Options

### Export as Images

```bash
/ship-preview --export png

✓ Exported previews:
  - facebook-preview.png
  - twitter-preview.png
  - search-preview.png
  - browser-preview.png

Saved to: .ship-toolkit/previews/
```

### Export as PDF

```bash
/ship-preview --export pdf

✓ Generated: social-media-previews.pdf

Perfect for:
  • Client presentations
  • Team reviews
  • Documentation
```

## Live Preview Server

Start a local preview server:

```bash
/ship-preview --serve

🌐 Preview server started

  Local:    http://localhost:3333
  Network:  http://192.168.1.100:3333

  View on any device connected to your network

Press Ctrl+C to stop
```

## Compare Mode

Compare before/after changes:

```bash
/ship-preview --compare

📊 Preview Comparison

Before (left) vs After (right)

[Split view showing old and new previews side by side]

Changes detected:
  • OG image: Updated
  • Description: Improved (+15 chars)
  • Title: Optimized
```

## Device Preview

Preview on different devices:

```bash
/ship-preview --devices mobile,tablet,desktop

Generated previews for:
  📱 Mobile (375x667)
  📱 Tablet (768x1024)
  💻 Desktop (1440x900)

View all: .ship-toolkit/device-previews.html
```

## Validation Warnings

The preview includes warnings:

```bash
⚠️  Preview Warnings

Social Media:
  • OG image slightly small (optimize for 1200x630)
  • Description too long (165 chars, max 155)

Search Results:
  • Title could be shorter (62 chars, optimal 50-60)

Recommendations:
  1. Resize OG image to exactly 1200x630
  2. Shorten meta description by 10 chars
  3. Optimize title for better CTR
```

## Preview Templates

Use different preview styles:

```bash
/ship-preview --template minimal
/ship-preview --template detailed
/ship-preview --template presentation
```

**Templates:**
- `minimal` - Simple, clean preview
- `detailed` - All metadata visible
- `presentation` - Slide-ready format
- `debug` - Technical details shown

## Share Preview

Share preview with your team:

```bash
/ship-preview --share

🔗 Shareable preview link:
   https://ship-preview.vercel.app/abc123xyz

   Valid for: 7 days
   Password: (optional)

Share with team for review!
```

## Automated Screenshots

Take actual screenshots using browser automation:

```bash
/ship-preview --screenshot

📸 Taking screenshots...

✓ Captured Facebook preview
✓ Captured Twitter preview
✓ Captured Google preview

Screenshots saved to: .ship-toolkit/screenshots/

Note: Requires Puppeteer
```

## Preview Checklist

Built-in validation:

```bash
/ship-preview --validate

✅ Social Media Validation

Facebook/LinkedIn:
  ✓ OG image: 1200x630 ✅
  ✓ Title: 42 chars ✅
  ✓ Description: 148 chars ✅
  ✓ Image quality: High ✅

Twitter:
  ✓ Card type: summary_large_image ✅
  ✓ Image: 1200x600 ✅
  ✓ Creator tag: @yourhandle ✅

Search:
  ✓ Title: 58 chars (optimal) ✅
  ✓ Description: 155 chars ✅
  ⚠ Missing structured data

Browser:
  ✓ Favicon: All sizes present ✅
  ✓ Apple touch icon: 180x180 ✅
  ✓ Theme color: Set ✅

Overall: 12/13 checks passed
```

## Integration with Design Tools

Export for design review:

```bash
/ship-preview --figma

✓ Generated Figma-compatible artboards
✓ Exported to: previews-figma.fig

Import into Figma for:
  • Design review
  • Client presentation
  • Brand consistency check
```

## A/B Testing Preview

Compare different variations:

```bash
/ship-preview --variants

Created preview variants:
  1. Current version
  2. Variant A (shorter title)
  3. Variant B (different image)

Vote on: .ship-toolkit/preview-variants.html
```

## Preview in Real Context

See previews in actual platforms:

```bash
/ship-preview --real-context

📱 Real Context Previews

Facebook:
  • Paste this: https://yourapp.com
  • Use: https://developers.facebook.com/tools/debug/

Twitter:
  • Paste this: https://yourapp.com
  • Use: https://cards-dev.twitter.com/validator

LinkedIn:
  • Paste this: https://yourapp.com
  • Use: https://www.linkedin.com/post-inspector/

Copy URL and test on actual platforms!
```

## Configuration

`.ship-toolkit/config.json`:

```json
{
  "preview": {
    "autoOpen": true,
    "includeDevices": ["mobile", "desktop"],
    "exportFormat": "png",
    "template": "detailed",
    "darkMode": false,
    "enableScreenshots": false
  }
}
```

## Best Practices

**Before Launching:**
1. Run `/ship-preview`
2. Check all social previews
3. Verify search appearance
4. Test on real devices
5. Share with team for review

**Regular Checks:**
- After changing meta tags
- After updating OG images
- Before major releases
- When rebranding

## Troubleshooting

### Preview Looks Wrong

```bash
Common issues:
1. OG image wrong size
   Fix: /ship-assets (regenerate)

2. Meta description too long
   Fix: Edit meta tags

3. Title not showing
   Fix: Check metadata export
```

### Images Not Loading

```bash
Check:
1. Files exist in public/
2. Paths are correct
3. Image format is valid
4. No CORS issues
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `/ship-preview` | Generate all previews |
| `/ship-preview --open` | Open in browser |
| `/ship-preview --export png` | Export as images |
| `/ship-preview --validate` | Validate previews |
| `/ship-preview --compare` | Before/after |
| `/ship-preview --share` | Share with team |

---

**Preview your launch with `/ship-preview`! 🖼️**
