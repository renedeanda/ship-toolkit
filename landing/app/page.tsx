'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [typedText, setTypedText] = useState('')
  const fullText = '/ship-complete'

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 150)

    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-terminal-darkest relative">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative dot-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-darkest/50 to-terminal-darkest" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="mb-8">
            <div className="inline-block terminal-border bg-terminal-dark/50 p-1 px-4 mb-8">
              <span className="text-terminal-cyan text-sm">FOR CLAUDE CODE USERS</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-glow">
            <span className="text-terminal-green">ship</span>
            <span className="text-terminal-cyan">-toolkit</span>
          </h1>

          <p className="text-xl md:text-3xl text-terminal-green/80 mb-12 font-light">
            Automate your web deployment workflow.<br />
            <span className="text-terminal-amber text-glow-sm">
              3-4 hours → 3-5 minutes
            </span>
          </p>

          <div className="terminal-border bg-terminal-dark/80 p-8 md:p-12 mb-12 max-w-3xl mx-auto backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-terminal-green/60 text-sm">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              </div>
              <span>claude-code-terminal.sh</span>
            </div>
            <div className="text-left font-mono">
              <p className="text-terminal-green/60 mb-2">$ cd my-awesome-project</p>
              <p className="text-terminal-green mb-4 terminal-prompt blink-cursor">{typedText}</p>
              <div className="text-terminal-amber/80 text-sm space-y-1 animate-pulse">
                <p>✓ Generated 16 favicon sizes</p>
                <p>✓ Created Open Graph images</p>
                <p>✓ Optimized SEO metadata</p>
                <p>✓ Analyzed performance (Score: 98/100)</p>
                <p>✓ Deployed to production</p>
                <p className="text-terminal-green text-glow-sm mt-4">🚀 Ship complete! Live at: my-app.vercel.app</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#install"
              className="terminal-border bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green px-8 py-4 transition-all hover:text-glow"
            >
              Get Started →
            </a>
            <a
              href="#features"
              className="terminal-border bg-terminal-cyan/10 hover:bg-terminal-cyan/20 text-terminal-cyan px-8 py-4 transition-all hover:text-glow"
            >
              View Features
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 circuit-pattern relative">
        <div className="absolute inset-0 bg-gradient-to-b from-terminal-darkest via-transparent to-terminal-darkest" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-terminal-amber mb-6 text-glow">
              The Deployment Tax
            </h2>
            <p className="text-xl text-terminal-green/70 max-w-3xl mx-auto">
              You just built an amazing web app with Claude Code. But before you can ship...
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '🎨', task: 'Generate favicons in 16 different sizes', time: '30 min' },
              { icon: '📱', task: 'Create Open Graph images for social sharing', time: '45 min' },
              { icon: '🔍', task: 'Set up SEO meta tags, sitemap, robots.txt', time: '45 min' },
              { icon: '⚡', task: 'Optimize images and check performance', time: '1-2 hours' },
              { icon: '🚀', task: 'Configure deployment and environment', time: '30 min' },
              { icon: '✅', task: 'Run pre-launch checklist manually', time: '30 min' },
            ].map((item, i) => (
              <div key={i} className="terminal-border bg-terminal-dark/50 p-6 backdrop-blur-sm hover:bg-terminal-dark/70 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-terminal-green mb-2">{item.task}</p>
                    <p className="text-terminal-amber text-sm">⏱ {item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-3xl md:text-5xl font-bold text-terminal-amber text-glow">
              Total: 3-4 hours per project
            </p>
            <p className="text-terminal-green/60 mt-4">This kills momentum. This kills shipping.</p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold text-terminal-green mb-6 text-glow">
              One Command. Done.
            </h2>
            <p className="text-2xl text-terminal-cyan">
              ship-toolkit automates everything
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: '10x Faster',
                value: '90%',
                desc: 'Time savings per project',
                color: 'terminal-green'
              },
              {
                title: 'Zero Config',
                value: '1',
                desc: 'Command to ship everything',
                color: 'terminal-cyan'
              },
              {
                title: 'AI-Native',
                value: '100%',
                desc: 'Built for Claude Code',
                color: 'terminal-amber'
              },
            ].map((stat, i) => (
              <div key={i} className={`terminal-border bg-terminal-dark/50 p-8 text-center backdrop-blur-sm`}>
                <div className={`text-6xl font-bold text-${stat.color} text-glow mb-4`}>
                  {stat.value}
                </div>
                <h3 className={`text-xl font-bold text-${stat.color} mb-2`}>{stat.title}</h3>
                <p className="text-terminal-green/60">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 dot-pattern relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-darkest/80 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-terminal-cyan mb-6 text-glow">
              9 Powerful Commands
            </h2>
            <p className="text-xl text-terminal-green/70">
              Each command saves you hours. Use them individually or all at once.
            </p>
          </div>

          <div className="space-y-6 max-w-5xl mx-auto">
            {[
              {
                cmd: '/ship-assets',
                desc: 'Generate favicons, OG images, PWA icons - all assets for modern web apps',
                saves: '30 min',
                features: ['16 favicon sizes', 'Open Graph images', 'PWA icons', 'Apple touch icons']
              },
              {
                cmd: '/ship-seo',
                desc: 'Set up meta tags, sitemap, robots.txt - complete SEO optimization',
                saves: '45 min',
                features: ['Meta tags', 'Sitemap.xml', 'robots.txt', 'Schema markup']
              },
              {
                cmd: '/ship-perf',
                desc: 'Optimize images, performance, Core Web Vitals using Lighthouse',
                saves: '1-2 hours',
                features: ['Image optimization', 'Lighthouse audit', 'Bundle analysis', 'Auto-fixes']
              },
              {
                cmd: '/ship-deploy',
                desc: 'Deploy to Vercel/Netlify with one command',
                saves: '30 min',
                features: ['Auto platform detection', 'One-click deploy', 'Preview URLs', 'Production ready']
              },
              {
                cmd: '/ship-launch',
                desc: 'Validate 34-point launch checklist before going live',
                saves: '30 min',
                features: ['Assets check', 'SEO validation', 'Performance audit', 'Security scan']
              },
              {
                cmd: '/ship-complete',
                desc: '⭐ Run everything in sequence - complete automation workflow',
                saves: '3-4 hours',
                features: ['Full automation', 'Resumable workflow', 'HTML reports', 'CI/CD ready'],
                featured: true
              },
              {
                cmd: '/ship-status',
                desc: 'Quick status check - what\'s done vs. what\'s missing',
                saves: null,
                features: ['JSON output', 'CI/CD integration', 'Badge generation']
              },
              {
                cmd: '/ship-preview',
                desc: 'Preview OG images, meta tags, social shares',
                saves: null,
                features: ['Visual previews', 'Social media cards', 'Export to PNG/PDF']
              },
              {
                cmd: '/ship-export',
                desc: 'Export launch content for Twitter, Product Hunt, etc.',
                saves: null,
                features: ['8+ platforms', 'Custom templates', 'Launch schedule']
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`terminal-border p-6 backdrop-blur-sm hover:bg-terminal-dark/70 transition-all ${
                  feature.featured ? 'bg-terminal-green/10' : 'bg-terminal-dark/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <code className={`text-lg md:text-xl font-bold ${
                        feature.featured ? 'text-terminal-amber text-glow' : 'text-terminal-cyan'
                      }`}>
                        {feature.cmd}
                      </code>
                      {feature.saves && (
                        <span className="terminal-border bg-terminal-amber/20 text-terminal-amber px-3 py-1 text-sm">
                          ⏱ saves {feature.saves}
                        </span>
                      )}
                    </div>
                    <p className="text-terminal-green/80 mb-4">{feature.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.features.map((f, j) => (
                        <span
                          key={j}
                          className="text-xs text-terminal-green/60 terminal-border bg-terminal-dark/50 px-2 py-1"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="install" className="py-32 circuit-pattern relative">
        <div className="absolute inset-0 bg-gradient-to-b from-terminal-darkest via-transparent to-terminal-darkest" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-terminal-green mb-6 text-glow">
              Get Started in 60 Seconds
            </h2>
            <p className="text-xl text-terminal-green/70">
              Install once, ship forever
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="terminal-border bg-terminal-dark/80 p-8 backdrop-blur-sm">
              <p className="text-terminal-cyan mb-4 font-bold">1. Install the plugin</p>
              <div className="terminal-border bg-terminal-darkest/80 p-4 overflow-x-auto">
                <code className="text-terminal-green">
                  git clone https://github.com/renedeanda/ship-toolkit.git<br />
                  cd ship-toolkit<br />
                  npm install<br />
                  npm run build
                </code>
              </div>
            </div>

            <div className="terminal-border bg-terminal-dark/80 p-8 backdrop-blur-sm">
              <p className="text-terminal-cyan mb-4 font-bold">2. Configure for your project</p>
              <div className="terminal-border bg-terminal-darkest/80 p-4 overflow-x-auto">
                <pre className="text-terminal-green text-sm">
{`{
  "seo": {
    "siteName": "My Awesome App",
    "siteUrl": "https://myapp.com"
  },
  "deploy": {
    "platform": "vercel"
  }
}`}
                </pre>
              </div>
            </div>

            <div className="terminal-border bg-terminal-dark/80 p-8 backdrop-blur-sm">
              <p className="text-terminal-cyan mb-4 font-bold">3. Ship it!</p>
              <div className="terminal-border bg-terminal-darkest/80 p-4 overflow-x-auto">
                <code className="text-terminal-green terminal-prompt">
                  /ship-complete
                </code>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="https://github.com/renedeanda/ship-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block terminal-border bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green px-8 py-4 transition-all hover:text-glow"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-terminal-amber mb-6 text-glow">
              Supported Frameworks
            </h2>
            <p className="text-xl text-terminal-green/70">
              Works with your favorite tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              'Next.js (App Router)',
              'Next.js (Pages Router)',
              'Vite + React',
              'Vue.js',
              'SvelteKit',
              'Astro',
              'Create React App',
              'Static Sites',
              '+ More coming soon'
            ].map((framework, i) => (
              <div
                key={i}
                className="terminal-border bg-terminal-dark/50 p-4 text-center text-terminal-cyan hover:bg-terminal-dark/70 transition-all"
              >
                {framework}
              </div>
            ))}
          </div>

          <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="terminal-border bg-terminal-dark/50 p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-terminal-cyan mb-4">Deployment Platforms</h3>
              <ul className="space-y-2 text-terminal-green/80">
                <li className="terminal-prompt">Vercel</li>
                <li className="terminal-prompt">Netlify</li>
                <li className="terminal-prompt">Railway</li>
                <li className="terminal-prompt">Render</li>
                <li className="terminal-prompt">GitHub Pages</li>
              </ul>
            </div>

            <div className="terminal-border bg-terminal-dark/50 p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-terminal-cyan mb-4">Features</h3>
              <ul className="space-y-2 text-terminal-green/80">
                <li className="terminal-prompt">Auto-fix capabilities</li>
                <li className="terminal-prompt">Resumable workflows</li>
                <li className="terminal-prompt">CI/CD integration</li>
                <li className="terminal-prompt">HTML/JSON reports</li>
                <li className="terminal-prompt">TypeScript support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 dot-pattern relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-darkest/80 to-terminal-darkest" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-terminal-green mb-8 text-glow">
            Stop Configuring.<br />
            Start Shipping.
          </h2>
          <p className="text-xl text-terminal-green/70 mb-12">
            Join AI-native developers who ship 10x faster
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://github.com/renedeanda/ship-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-border bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green px-8 py-4 transition-all hover:text-glow text-lg"
            >
              Get Started on GitHub →
            </a>
            <a
              href="https://github.com/renedeanda/ship-toolkit/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-border bg-terminal-cyan/10 hover:bg-terminal-cyan/20 text-terminal-cyan px-8 py-4 transition-all hover:text-glow text-lg"
            >
              Request a Feature
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-terminal-green/20 py-12 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-terminal-green/60">
              <p className="font-mono text-sm">
                ship-toolkit v1.0.0
              </p>
              <p className="text-xs mt-2">
                MIT License · Built for Claude Code
              </p>
            </div>

            <div className="flex gap-6 text-terminal-green/60 text-sm">
              <a
                href="https://github.com/renedeanda/ship-toolkit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-green transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/renedeanda/ship-toolkit/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-green transition-colors"
              >
                Issues
              </a>
              <a
                href="https://github.com/renedeanda/ship-toolkit#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-green transition-colors"
              >
                Docs
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-terminal-green/60 text-sm">
            Made with 💚 by{' '}
            <a
              href="https://renedeanda.com?utm_source=ship-toolkit&utm_medium=landing&utm_campaign=footer"
              target="_blank"
              rel="dofollow"
              className="text-terminal-cyan hover:text-terminal-green transition-colors hover:text-glow-sm"
            >
              René DeAnda
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
