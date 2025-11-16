---
description: Export launch announcements for social media, Product Hunt, Dev.to, and more
---

# Ship Export Command

Generate ready-to-post launch announcements for Twitter, Product Hunt, LinkedIn, HackerNews, Reddit, Dev.to, and more. Never start from a blank page again!

## What This Command Does

Generates launch content for:
- 🐦 Twitter/X thread
- 🚀 Product Hunt description
- 💼 LinkedIn post
- 🔶 HackerNews post
- 📱 Reddit r/SideProject
- 💻 Dev.to article
- 📧 Launch email template
- 📄 Press release

**All customized with your project details!**

## Example Output

```bash
/ship-export

🚀 Generating Launch Content...

✓ Analyzed project metadata
✓ Generated Twitter thread
✓ Generated Product Hunt description
✓ Generated LinkedIn post
✓ Generated HackerNews post
✓ Generated Reddit post
✓ Generated Dev.to article
✓ Generated email template

📁 All content saved to: .ship-toolkit/launch/

Open folder to review and customize!

📋 Generated Files:
   • twitter-thread.md
   • product-hunt.md
   • linkedin-post.md
   • hackernews-post.md
   • reddit-sideproject.md
   • devto-article.md
   • launch-email.md
   • press-release.md

💡 Next Steps:
   1. Review and customize each post
   2. Schedule posts across platforms
   3. Engage with responses

Ready to announce your launch! 📣
```

## Generated Content Examples

### Twitter Thread

```markdown
📄 twitter-thread.md

🚀 Just launched [Your App Name]!

After [X weeks/months] of building, I'm excited to share what I've created.

[Your App Name] helps [target audience] [solve problem] with [key benefit].

✨ Key Features:
• [Feature 1]
• [Feature 2]
• [Feature 3]

Built with [tech stack] in [timeframe]

Try it: [URL]

#BuildInPublic #IndieHacker #SaaS

---

🧵 Thread 2/5:

The problem I was solving:
[Describe the problem you encountered]

I couldn't find a good solution, so I built one.

---

🧵 Thread 3/5:

How it works:
[Simple explanation of your solution]

---

🧵 Thread 4/5:

Tech stack:
• Frontend: [Framework]
• Backend: [Tech]
• Database: [DB]
• Deployment: [Platform]

Open to questions! Ask away 👇

---

🧵 Thread 5/5:

What's next:
• [Upcoming feature 1]
• [Upcoming feature 2]
• [Upcoming feature 3]

Feedback is gold! Let me know what you think 💭

Try it: [URL]
RT appreciated! 🙏
```

### Product Hunt Description

```markdown
📄 product-hunt.md

# [Your App Name]

## Tagline
[One-line description of what it does]

## Description

[Your App Name] is a [category] tool that helps [target users] [achieve goal].

**The Problem**
[Describe the problem your app solves]

**The Solution**
[Your App Name] makes it easy to [solution description].

**Key Features**
• [Feature 1 with benefit]
• [Feature 2 with benefit]
• [Feature 3 with benefit]

**Why We Built This**
[Your story - why did you build this?]

**Tech Stack**
Built with [technologies] for [reasons]

**Try It Now**
[URL]

**We'd Love Your Feedback**
This is our first launch on Product Hunt! We're eager to hear what you think and how we can improve.

**Special Launch Offer**
[Any launch discount or special offer]

**Follow Our Journey**
Twitter: [@handle]
GitHub: [repo]
```

### LinkedIn Post

```markdown
📄 linkedin-post.md

🚀 Excited to announce the launch of [Your App Name]!

After [X months] of development, I'm thrilled to share what I've been working on.

**The Challenge**
As a [your role], I frequently encountered [problem]. Existing solutions were [limitation].

**The Solution**
[Your App Name] addresses this by [solution approach].

**Key Capabilities**
✅ [Feature 1]
✅ [Feature 2]
✅ [Feature 3]

**Built For**
[Your App Name] is designed for [target audience] who [use case].

**Technical Highlights**
Developed with [tech stack], focusing on [key technical advantages like performance, security, scalability].

**What's Next**
I'm actively seeking feedback and exploring [future plans].

**Try It**
Visit [URL] to learn more.

I'd love to connect with others working in this space. What tools are you using to solve [problem]?

#ProductLaunch #TechInnovation #[YourCategory]
```

### HackerNews Post

```markdown
📄 hackernews-post.md

Title: [Your App Name] – [Compelling one-line description]

Body:
Hi HN!

I built [Your App Name] to solve [specific problem].

**Background**
[Brief background on why you built it]

**What It Does**
[Clear, concise explanation]

**How It Works**
[Technical explanation - HN loves technical details]

**Tech Stack**
• [Technology 1]
• [Technology 2]
• [Technology 3]

**Why These Choices**
[Reasoning for technical decisions]

**Current Status**
• [Current state]
• [Number of users/projects/etc if applicable]
• [What's working well]

**Looking For**
• Feedback on [specific aspect]
• Suggestions for [area]
• Beta testers for [feature]

**Try It**
[URL]

**Open Source**
[If applicable: GitHub repo]

Happy to answer any technical questions!
```

### Reddit r/SideProject

```markdown
📄 reddit-sideproject.md

**Title:** I built [Your App Name] - [Description] in [timeframe]

**Post:**

Hey r/SideProject!

I just launched my latest project: **[Your App Name]**

**🎯 What it does:**
[Clear description of what it solves]

**💡 Why I built it:**
[Your motivation]

**✨ Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**🛠 Built with:**
- [Technology 1]
- [Technology 2]
- [Technology 3]

**📊 Stats:**
- Development time: [X weeks/months]
- Lines of code: [if impressive]
- [Other interesting metrics]

**🔗 Try it:** [URL]

**🚀 What's next:**
- [Planned feature 1]
- [Planned feature 2]

**💬 Feedback welcome!**
This is my [first/Xth] side project. I'd love to hear:
- What you think
- What could be improved
- What features you'd like to see

**Questions?** Ask away! I'll be around to answer.

Thanks for checking it out! 🙏
```

### Dev.to Article

```markdown
📄 devto-article.md

---
title: Building and Launching [Your App Name]
published: true
description: How I built [Your App Name] using [tech stack]
tags: [tag1, tag2, tag3, tag4]
---

# Building and Launching [Your App Name]

## Introduction
[Hook - why this post is interesting]

## The Problem
[Describe the problem you set out to solve]

## The Solution
[Your approach]

## Tech Stack
- **Frontend:** [Technology]
- **Backend:** [Technology]
- **Database:** [Technology]
- **Deployment:** [Platform]

## Architecture
[Brief architecture overview]

```
[Optional: Architecture diagram]
```

## Key Features

### Feature 1: [Name]
[Description and implementation details]

```javascript
// Code example
```

### Feature 2: [Name]
[Description and implementation details]

### Feature 3: [Name]
[Description and implementation details]

## Challenges Faced

### Challenge 1
[Problem and solution]

### Challenge 2
[Problem and solution]

## Lessons Learned
1. [Lesson 1]
2. [Lesson 2]
3. [Lesson 3]

## Results
- [Metric 1]
- [Metric 2]
- [Metric 3]

## What's Next
[Future plans]

## Try It
[Your App Name] is live at [URL]

## Conclusion
[Wrap up and call to action]

---

*Have questions? Drop them in the comments!*
```

## Options

```bash
# Generate all content
/ship-export

# Generate specific platform only
/ship-export --twitter
/ship-export --producthunt
/ship-export --linkedin
/ship-export --hackernews
/ship-export --reddit
/ship-export --devto

# Custom tone
/ship-export --tone professional
/ship-export --tone casual
/ship-export --tone technical

# Include hashtags
/ship-export --hashtags

# Schedule posts
/ship-export --schedule

# Generate graphics
/ship-export --graphics
```

## Customization

Edit `.ship-toolkit/launch-config.json`:

```json
{
  "project": {
    "name": "Your App Name",
    "tagline": "One-line description",
    "description": "Full description",
    "url": "https://yourapp.com",
    "category": "Developer Tools",
    "targetAudience": "developers",
    "keyFeatures": [
      "Feature 1",
      "Feature 2",
      "Feature 3"
    ],
    "techStack": [
      "Next.js",
      "TypeScript",
      "Vercel"
    ],
    "launchGoals": {
      "twitter": "100 retweets",
      "productHunt": "Top 5",
      "reddit": "100 upvotes"
    }
  },
  "author": {
    "name": "Your Name",
    "twitter": "@yourhandle",
    "github": "yourgithub",
    "linkedin": "yourlinkedin"
  }
}
```

## Launch Graphics

Generate launch graphics:

```bash
/ship-export --graphics

🎨 Generating launch graphics...

✓ OG image with launch announcement
✓ Twitter card with key features
✓ Product Hunt thumbnail
✓ Instagram story template

Saved to: .ship-toolkit/launch/graphics/
```

## Schedule Launch

Create a launch schedule:

```bash
/ship-export --schedule

📅 Launch Schedule Created

Day 1 (Launch Day):
  09:00 AM - Twitter announcement
  10:00 AM - Product Hunt submission
  12:00 PM - LinkedIn post
  02:00 PM - HackerNews post
  04:00 PM - Reddit r/SideProject

Day 2:
  09:00 AM - Dev.to article
  12:00 PM - Follow-up Twitter thread

Day 3:
  09:00 AM - Thank you post
  Share results

Saved to: .ship-toolkit/launch/schedule.md
```

## Email Template

Launch email to subscribers:

```markdown
📄 launch-email.md

Subject: 🚀 [Your App Name] is Live!

Hi [Name],

I'm excited to announce that [Your App Name] is now live!

**What is [Your App Name]?**
[Brief description]

**Why I Built It**
[Your story]

**Key Features**
• [Feature 1]
• [Feature 2]
• [Feature 3]

**Special Launch Offer**
As a thank you for being an early supporter, use code LAUNCH for [offer].

**Try It Now**
[URL]

**I'd Love Your Feedback**
Reply to this email with your thoughts!

Thanks for your support,
[Your Name]

P.S. Share with friends who might find this useful!
```

## Press Release

Professional press release:

```markdown
📄 press-release.md

FOR IMMEDIATE RELEASE

[Your Company] Launches [Your App Name]
[Tagline]

[CITY, STATE] – [DATE] – [Your Company] today announced the launch of [Your App Name], a [category] platform designed to [primary benefit].

[Opening paragraph with key announcement]

"[Quote from you about why you built it]," said [Your Name], [Your Title] of [Your Company].

Key features of [Your App Name] include:
• [Feature 1]
• [Feature 2]
• [Feature 3]

[Paragraph about the problem and solution]

[Paragraph about target market]

[Your App Name] is available now at [URL].

**About [Your Company]**
[Company description]

**Media Contact**
[Your Name]
[Email]
[Phone]
[Website]
```

## Best Practices

**Before Exporting:**
1. Run `/ship-complete` first
2. Have clear metrics ready
3. Prepare screenshots/demos
4. Set up analytics tracking

**Content Tips:**
- Be authentic and honest
- Focus on problems solved
- Include visuals
- Call to action
- Engage with responses

**Posting Strategy:**
- Schedule across multiple days
- Time for each platform's peak hours
- Engage immediately after posting
- Share results transparently

## Integration with Analytics

Track launch performance:

```bash
/ship-export --analytics

📊 Launch Analytics Setup

Created tracking links for:
  • Twitter: [URL]?utm_source=twitter
  • Product Hunt: [URL]?utm_source=producthunt
  • LinkedIn: [URL]?utm_source=linkedin
  • HackerNews: [URL]?utm_source=hackernews
  • Reddit: [URL]?utm_source=reddit

Track in Google Analytics or Plausible
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `/ship-export` | Generate all content |
| `/ship-export --twitter` | Twitter thread only |
| `/ship-export --schedule` | Create launch schedule |
| `/ship-export --graphics` | Generate graphics |
| `/ship-export --tone casual` | Casual tone |

---

**Export your launch content with `/ship-export`! 📣**

---

## Complete Ship Command Family

```bash
# Core Commands
/ship-assets       # Generate assets
/ship-seo          # SEO optimization
/ship-perf         # Performance optimization
/ship-deploy       # Deploy to production
/ship-launch       # Launch checklist

# Orchestrator
/ship-complete     # Run everything

# Utilities
/ship-status       # Quick status check
/ship-preview      # Preview assets
/ship-export       # Export launch content ← You are here
```

**You're ready to ship! 🚀**
