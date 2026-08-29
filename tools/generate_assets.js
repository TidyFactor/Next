const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(repoRoot, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. HTML Template for GitHub Social Preview (1280x640)
const socialPreviewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TidyFactor Next.js - Social Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 640px;
      background: #080B11;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient Glowing Gradients */
    .glow-1 {
      position: absolute;
      top: -150px;
      left: -100px;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(8, 11, 17, 0) 70%);
      filter: blur(40px);
      pointer-events: none;
    }
    .glow-2 {
      position: absolute;
      bottom: -150px;
      right: -100px;
      width: 750px;
      height: 750px;
      background: radial-gradient(circle, rgba(62, 207, 142, 0.25) 0%, rgba(8, 11, 17, 0) 70%);
      filter: blur(50px);
      pointer-events: none;
    }
    .glow-3 {
      position: absolute;
      top: 40%;
      right: 25%;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(8, 11, 17, 0) 70%);
      filter: blur(60px);
      pointer-events: none;
    }

    /* Grid overlay */
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at 50% 50%, black 50%, transparent 95%);
      pointer-events: none;
    }

    .container {
      width: 1160px;
      height: 520px;
      display: grid;
      grid-template-columns: 1.18fr 0.82fr;
      gap: 36px;
      position: relative;
      z-index: 10;
    }

    /* Left Column */
    .left-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .top-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #9CA3AF;
      text-transform: uppercase;
    }

    .brand-dot {
      width: 8px;
      height: 8px;
      background: #3ECF8E;
      border-radius: 50%;
      box-shadow: 0 0 10px #3ECF8E;
    }

    .version-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      background: rgba(62, 207, 142, 0.15);
      border: 1px solid rgba(62, 207, 142, 0.35);
      color: #3ECF8E;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
    }

    .title-group {
      margin-top: 14px;
    }

    .main-title {
      font-size: 52px;
      font-weight: 800;
      letter-spacing: -1.5px;
      line-height: 1.08;
      color: #FFFFFF;
    }

    .main-title span {
      background: linear-gradient(135deg, #38BDF8 0%, #3ECF8E 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tagline {
      margin-top: 12px;
      font-size: 18px;
      line-height: 1.45;
      color: #94A3B8;
      font-weight: 500;
      max-width: 580px;
    }

    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }

    .feature-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #E2E8F0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .feature-tag svg {
      width: 16px;
      height: 16px;
      color: #3ECF8E;
    }

    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .agents-group {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .agent-pill {
      color: #CBD5E1;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Right Column (Code & Visual Card) */
    .right-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .card-stack {
      position: relative;
      width: 100%;
    }

    .code-card {
      background: rgba(11, 15, 25, 0.9);
      border: 1px solid rgba(62, 207, 142, 0.3);
      border-radius: 14px;
      box-shadow: 
        0 20px 40px -15px rgba(0, 0, 0, 0.7),
        0 0 30px rgba(62, 207, 142, 0.12);
      backdrop-filter: blur(16px);
      overflow: hidden;
    }

    .card-header {
      padding: 12px 18px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .dots {
      display: flex;
      gap: 6px;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.red { background: #EF4444; }
    .dot.yellow { background: #F59E0B; }
    .dot.green { background: #10B981; }

    .card-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #94A3B8;
      font-weight: 500;
    }

    .shield-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      color: #3ECF8E;
      background: rgba(62, 207, 142, 0.12);
      border: 1px solid rgba(62, 207, 142, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .code-body {
      padding: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #E2E8F0;
    }

    .kwd { color: #F472B6; font-weight: 600; }
    .sql-kwd { color: #38BDF8; font-weight: 600; }
    .fn { color: #A78BFA; }
    .str { color: #3ECF8E; }
    .comment { color: #64748B; font-style: italic; }

    .terminal-card {
      margin-top: 14px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }

    .cmd-text {
      color: #38BDF8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cmd-text span { color: #E2E8F0; }
    .cmd-prompt { color: #3ECF8E; font-weight: 700; }

    .badge-15 {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(62, 207, 142, 0.25));
      border: 1px solid rgba(62, 207, 142, 0.4);
      color: #F8FAFC;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="glow-3"></div>
  <div class="grid-bg"></div>

  <div class="container">
    <div class="left-col">
      <div>
        <div class="top-meta">
          <div class="brand-pill">
            <span class="brand-dot"></span>
            TidyFactor Ecosystem
          </div>
          <span class="version-badge">v1.3.0 RELEASE</span>
        </div>

        <div class="title-group">
          <h1 class="main-title">TidyFactor <span>Next.js</span></h1>
          <p class="tagline">Production-grade Multi-Tenant SaaS architecture, locked Postgres RLS data isolation &amp; dual performance engine for AI coding agents.</p>
        </div>

        <div class="features-list">
          <div class="feature-tag">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Locked Postgres RLS
          </div>
          <div class="feature-tag">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Next.js 16 &amp; React 19
          </div>
          <div class="feature-tag">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Fail-Closed Edge Auth
          </div>
          <div class="feature-tag">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Dual Perf Engine (8-Tier + 6 Models)
          </div>
        </div>
      </div>

      <div class="footer-bar">
        <div class="agents-group">
          <span>AI Agents:</span>
          <span class="agent-pill">Antigravity</span>
          <span class="agent-pill">Claude Code</span>
          <span class="agent-pill">Cursor</span>
          <span class="agent-pill">Codex</span>
        </div>
        <div class="badge-15">15 SLASH COMMANDS</div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="right-col">
      <div class="card-stack">
        <div class="code-card">
          <div class="card-header">
            <div class="dots">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
            </div>
            <div class="card-title">tenant-isolation-policy.sql</div>
            <div class="shield-badge">🔒 RLS ENFORCED</div>
          </div>
          <div class="code-body">
            <span class="comment">-- Strict fail-closed tenant boundary</span><br/>
            <span class="sql-kwd">ALTER TABLE</span> organizations <span class="sql-kwd">ENABLE ROW LEVEL SECURITY</span>;<br/><br/>
            <span class="sql-kwd">CREATE POLICY</span> <span class="str">"org_tenant_isolation"</span><br/>
            &nbsp;&nbsp;<span class="sql-kwd">ON</span> organizations <span class="sql-kwd">FOR ALL</span><br/>
            &nbsp;&nbsp;<span class="sql-kwd">USING</span> (tenant_id = (<span class="fn">auth.jwt</span>() -&gt;&gt; <span class="str">'tenant_id'</span>)::<span class="kwd">uuid</span>)<br/>
            &nbsp;&nbsp;<span class="sql-kwd">WITH CHECK</span> (tenant_id = (<span class="fn">auth.jwt</span>() -&gt;&gt; <span class="str">'tenant_id'</span>)::<span class="kwd">uuid</span>);
          </div>
        </div>

        <div class="terminal-card">
          <div class="cmd-text">
            <span class="cmd-prompt">$</span>
            <span>npx @tidyfactor/cli-next add-skill</span>
          </div>
          <div class="shield-badge">⚡ INSTANT INJECT</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 2. HTML Template for Demo Hero Showcase (1440x900)
const demoHeroDarkHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TidyFactor Next.js - Demo Hero</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1440px;
      height: 900px;
      background: #080B11;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 48px;
      position: relative;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient Glows */
    .ambient-glow-top {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 950px;
      height: 450px;
      background: radial-gradient(ellipse, rgba(56, 189, 248, 0.18) 0%, rgba(62, 207, 142, 0.14) 40%, rgba(8, 11, 17, 0) 70%);
      filter: blur(50px);
      pointer-events: none;
    }

    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(circle at 50% 35%, black 55%, transparent 95%);
      pointer-events: none;
    }

    .hero-container {
      width: 100%;
      max-width: 1220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 10;
    }

    /* Header Pill */
    .top-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 6px 20px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      color: #94A3B8;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      margin-bottom: 20px;
    }
    .top-pill .dot {
      width: 8px;
      height: 8px;
      background: #3ECF8E;
      border-radius: 50%;
      box-shadow: 0 0 10px #3ECF8E;
    }
    .top-pill b {
      color: #F8FAFC;
    }

    /* Main Headline */
    .headline {
      font-size: 54px;
      font-weight: 800;
      letter-spacing: -2px;
      line-height: 1.12;
      max-width: 1080px;
      margin-bottom: 14px;
    }
    .headline .gradient-text {
      background: linear-gradient(135deg, #38BDF8 0%, #3ECF8E 60%, #A78BFA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    .description {
      font-size: 17px;
      line-height: 1.5;
      color: #94A3B8;
      max-width: 860px;
      margin-bottom: 26px;
    }

    /* Action Buttons */
    .button-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
    }
    .btn-primary {
      background: #F8FAFC;
      color: #080B11;
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: #F1F5F9;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    /* Terminal Quick Install */
    .terminal-box {
      width: 100%;
      max-width: 820px;
      background: rgba(11, 15, 25, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      margin-bottom: 24px;
    }
    .terminal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .term-dots { display: flex; gap: 6px; }
    .term-dot { width: 10px; height: 10px; border-radius: 50%; }
    .term-dot.r { background: #EF4444; }
    .term-dot.y { background: #F59E0B; }
    .term-dot.g { background: #10B981; }
    .term-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748B;
    }
    .terminal-content {
      padding: 14px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }
    .term-cmd {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .term-prompt { color: #3ECF8E; font-weight: 700; }
    .term-code { color: #38BDF8; font-weight: 600; }
    .copy-btn {
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 5px;
      color: #E2E8F0;
      font-size: 11px;
      font-weight: 600;
    }

    /* 15 Slash Commands Showcase */
    .commands-card {
      width: 100%;
      max-width: 1120px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 20px 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(12px);
    }
    .commands-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .commands-title {
      font-size: 13px;
      font-weight: 700;
      color: #CBD5E1;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .commands-title span { color: #38BDF8; }
    .commands-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #3ECF8E;
      background: rgba(62, 207, 142, 0.12);
      border: 1px solid rgba(62, 207, 142, 0.25);
      padding: 3px 8px;
      border-radius: 5px;
      font-weight: 700;
    }
    .commands-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .cmd-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: rgba(11, 15, 25, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 7px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #E2E8F0;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    .cmd-pill .name {
      color: #F8FAFC;
      font-weight: 600;
    }
    .cmd-pill .prefix {
      color: #38BDF8;
      font-weight: 700;
    }
    .cmd-pill .icon {
      color: #64748B;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="ambient-glow-top"></div>
  <div class="grid-pattern"></div>

  <div class="hero-container">
    <div class="top-pill">
      <span class="dot"></span>
      <span>MULTI-TENANT SAAS • <b>ARCHITECTURE ENGINE FOR AI AGENTS</b> • NEXT.JS 16 + REACT 19</span>
    </div>

    <h1 class="headline">
      TidyFactor Next.js<br/>
      <span class="gradient-text">An Engineering System for Multi-Tenant SaaS</span>
    </h1>

    <p class="description">
      With bulletproof Postgres RLS data isolation, fail-closed edge tenant resolution, and an evidence-based dual performance engine for AI coding agents.
    </p>

    <div class="button-group">
      <div class="btn btn-primary">Architectural Guide →</div>
      <div class="btn btn-secondary">Download .skill Package</div>
      <div class="btn btn-secondary">GitHub Repository ↗</div>
      <div class="btn btn-secondary">NPM Package ↗</div>
    </div>

    <div class="terminal-box">
      <div class="terminal-header">
        <div class="term-dots">
          <div class="term-dot r"></div>
          <div class="term-dot y"></div>
          <div class="term-dot g"></div>
        </div>
        <div class="term-title">bash — AI Agent Quick-Install Command</div>
        <div></div>
      </div>
      <div class="terminal-content">
        <div class="term-cmd">
          <span class="term-prompt">$</span>
          <span class="term-code">npx @tidyfactor/cli-next add-skill</span>
        </div>
        <div class="copy-btn">Copy</div>
      </div>
    </div>

    <div class="commands-card">
      <div class="commands-header">
        <div class="commands-title">
          <span>&gt;_</span> Agent Slash Commands &amp; Fast-Track Execution
        </div>
        <div class="commands-count">15 Operational Commands</div>
      </div>

      <div class="commands-grid">
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">brief</span><span class="icon">0. Discovery</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">init</span><span class="icon">1. Scaffold</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">tenant</span><span class="icon">1. Edge</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">rls</span><span class="icon">2. Security</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">auth</span><span class="icon">2. JWT</span></div>

        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">data</span><span class="icon">3. Schema</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">storage</span><span class="icon">3. Buckets</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">api</span><span class="icon">4. Routes</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">app</span><span class="icon">4. React 19</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">test</span><span class="icon">5. QA</span></div>

        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">observe</span><span class="icon">5. Logs</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">deploy</span><span class="icon">6. CI/CD</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">perf</span><span class="icon">6. Perf</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">incident</span><span class="icon">7. Runbook</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">audit</span><span class="icon">7. Compliance</span></div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 3. HTML Template for Light Mode Demo Hero (Elevating user's Image 1)
const demoHeroLightHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TidyFactor Next.js - Light Demo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1440px;
      height: 900px;
      background: #FAFAFA;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 48px;
      position: relative;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    .ambient-glow-light {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 850px;
      height: 400px;
      background: radial-gradient(ellipse, rgba(14, 165, 233, 0.12) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
    }

    .grid-pattern-light {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at 50% 35%, black 55%, transparent 95%);
      pointer-events: none;
    }

    .hero-container {
      width: 100%;
      max-width: 1220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 10;
    }

    .top-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 18px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      color: #64748B;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      margin-bottom: 20px;
    }
    .top-pill .dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
    }
    .top-pill b {
      color: #0F172A;
    }

    .headline {
      font-size: 54px;
      font-weight: 800;
      letter-spacing: -2px;
      line-height: 1.12;
      max-width: 1080px;
      margin-bottom: 14px;
      color: #0F172A;
    }
    .headline .gradient-text {
      background: linear-gradient(135deg, #0284C7 0%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    .description {
      font-size: 17px;
      line-height: 1.5;
      color: #475569;
      max-width: 860px;
      margin-bottom: 26px;
    }

    .button-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary {
      background: #0F172A;
      color: #FFFFFF;
      border: 1px solid #0F172A;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
    }
    .btn-secondary {
      background: #FFFFFF;
      color: #0F172A;
      border: 1px solid #CBD5E1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    }

    .terminal-box {
      width: 100%;
      max-width: 820px;
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 12px;
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.15);
      overflow: hidden;
      margin-bottom: 24px;
    }
    .terminal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: #1E293B;
    }
    .term-dots { display: flex; gap: 6px; }
    .term-dot { width: 10px; height: 10px; border-radius: 50%; }
    .term-dot.r { background: #EF4444; }
    .term-dot.y { background: #F59E0B; }
    .term-dot.g { background: #10B981; }
    .term-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94A3B8;
    }
    .terminal-content {
      padding: 14px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }
    .term-cmd { display: flex; align-items: center; gap: 12px; }
    .term-prompt { color: #34D399; font-weight: 700; }
    .term-code { color: #38BDF8; font-weight: 600; }
    .copy-btn {
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 5px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 600;
    }

    .commands-card {
      width: 100%;
      max-width: 1120px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 20px 24px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }
    .commands-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .commands-title {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .commands-title span { color: #0284C7; }
    .commands-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #059669;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      padding: 3px 8px;
      border-radius: 5px;
      font-weight: 700;
    }
    .commands-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .cmd-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 7px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #0F172A;
    }
    .cmd-pill .name { color: #0F172A; font-weight: 600; }
    .cmd-pill .prefix { color: #0284C7; font-weight: 700; }
    .cmd-pill .icon { color: #94A3B8; font-size: 10px; }
  </style>
</head>
<body>
  <div class="ambient-glow-light"></div>
  <div class="grid-pattern-light"></div>

  <div class="hero-container">
    <div class="top-pill">
      <span class="dot"></span>
      <span>MULTI-TENANT SAAS • <b>ARCHITECTURE ENGINE FOR AI AGENTS</b> • NEXT.JS 16 + REACT 19</span>
    </div>

    <h1 class="headline">
      TidyFactor Next.js<br/>
      <span class="gradient-text">An Engineering System for Multi-Tenant SaaS</span>
    </h1>

    <p class="description">
      With bulletproof Postgres RLS data isolation, fail-closed edge tenant resolution, and an evidence-based dual performance engine for AI coding agents.
    </p>

    <div class="button-group">
      <div class="btn btn-primary">Architectural Guide →</div>
      <div class="btn btn-secondary">Download .skill Package</div>
      <div class="btn btn-secondary">GitHub Repository ↗</div>
      <div class="btn btn-secondary">NPM Package ↗</div>
    </div>

    <div class="terminal-box">
      <div class="terminal-header">
        <div class="term-dots">
          <div class="term-dot r"></div>
          <div class="term-dot y"></div>
          <div class="term-dot g"></div>
        </div>
        <div class="term-title">bash — AI Agent Quick-Install Command</div>
        <div></div>
      </div>
      <div class="terminal-content">
        <div class="term-cmd">
          <span class="term-prompt">$</span>
          <span class="term-code">npx @tidyfactor/cli-next add-skill</span>
        </div>
        <div class="copy-btn">Copy</div>
      </div>
    </div>

    <div class="commands-card">
      <div class="commands-header">
        <div class="commands-title">
          <span>&gt;_</span> Agent Slash Commands &amp; Fast-Track Execution
        </div>
        <div class="commands-count">15 Operational Commands</div>
      </div>

      <div class="commands-grid">
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">brief</span><span class="icon">0. Discovery</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">init</span><span class="icon">1. Scaffold</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">tenant</span><span class="icon">1. Edge</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">rls</span><span class="icon">2. Security</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">auth</span><span class="icon">2. JWT</span></div>

        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">data</span><span class="icon">3. Schema</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">storage</span><span class="icon">3. Buckets</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">api</span><span class="icon">4. Routes</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">app</span><span class="icon">4. React 19</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">test</span><span class="icon">5. QA</span></div>

        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">observe</span><span class="icon">5. Logs</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">deploy</span><span class="icon">6. CI/CD</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">perf</span><span class="icon">6. Perf</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">incident</span><span class="icon">7. Runbook</span></div>
        <div class="cmd-pill"><span class="prefix">$/</span><span class="name">audit</span><span class="icon">7. Compliance</span></div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 4. HTML Template for Architecture Pipeline Diagram (1280x640)
const demoArchitectureHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TidyFactor Next.js - Architecture Pipeline</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 640px;
      background: #080B11;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      position: relative;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    .ambient-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 900px;
      height: 400px;
      background: radial-gradient(ellipse, rgba(56, 189, 248, 0.12) 0%, rgba(62, 207, 142, 0.12) 50%, transparent 75%);
      filter: blur(50px);
      pointer-events: none;
    }

    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    .container {
      width: 100%;
      max-width: 1180px;
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header {
      text-align: center;
      margin-bottom: 36px;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(62, 207, 142, 0.12);
      border: 1px solid rgba(62, 207, 142, 0.3);
      border-radius: 999px;
      color: #3ECF8E;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .header-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
      color: #FFFFFF;
    }

    .pipeline-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      width: 100%;
    }

    .step-card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 18px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .step-card.highlight {
      border-color: rgba(62, 207, 142, 0.4);
      background: rgba(11, 25, 20, 0.85);
      box-shadow: 0 0 25px rgba(62, 207, 142, 0.15);
    }

    .step-num {
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94A3B8;
      margin-bottom: 12px;
    }

    .step-card.highlight .step-num {
      background: #3ECF8E;
      color: #080B11;
    }

    .step-icon {
      font-size: 28px;
      margin-bottom: 10px;
    }

    .step-title {
      font-size: 14px;
      font-weight: 700;
      color: #F8FAFC;
      margin-bottom: 6px;
    }

    .step-desc {
      font-size: 11px;
      color: #94A3B8;
      line-height: 1.4;
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="grid-bg"></div>

  <div class="container">
    <div class="header">
      <div class="header-badge">🔒 Zero Data Leak Guarantee</div>
      <h2 class="header-title">Fail-Closed Tenant Isolation Pipeline</h2>
    </div>

    <div class="pipeline-grid">
      <div class="step-card">
        <div class="step-num">1</div>
        <div class="step-icon">🌐</div>
        <div class="step-title">Incoming Request</div>
        <div class="step-desc">Subdomain / Custom Domain / Auth Header</div>
      </div>

      <div class="step-card">
        <div class="step-num">2</div>
        <div class="step-icon">🛡️</div>
        <div class="step-title">Edge Middleware</div>
        <div class="step-desc">Fail-closed resolution (404/403 on error)</div>
      </div>

      <div class="step-card">
        <div class="step-num">3</div>
        <div class="step-icon">📦</div>
        <div class="step-title">Tenant Context</div>
        <div class="step-desc">Verified tenant_id &amp; role in JWT claims</div>
      </div>

      <div class="step-card">
        <div class="step-num">4</div>
        <div class="step-icon">⚡</div>
        <div class="step-title">App Router</div>
        <div class="step-desc">React 19 RSC &amp; Server Actions</div>
      </div>

      <div class="step-card highlight">
        <div class="step-num">5</div>
        <div class="step-icon">🔒</div>
        <div class="step-title">Postgres RLS</div>
        <div class="step-desc">Hard DB boundary via auth.jwt()</div>
      </div>

      <div class="step-card highlight">
        <div class="step-num">6</div>
        <div class="step-icon">✅</div>
        <div class="step-title">Isolated Data</div>
        <div class="step-desc">Zero cross-tenant contamination</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Write HTML templates
fs.writeFileSync(path.join(assetsDir, 'github-social-preview.html'), socialPreviewHtml, 'utf8');
fs.writeFileSync(path.join(assetsDir, 'demo-hero-dark.html'), demoHeroDarkHtml, 'utf8');
fs.writeFileSync(path.join(assetsDir, 'demo-hero-light.html'), demoHeroLightHtml, 'utf8');
fs.writeFileSync(path.join(assetsDir, 'demo-architecture.html'), demoArchitectureHtml, 'utf8');

console.log('[generate_assets] HTML templates written to assets/');

// Find Chrome or Edge executable
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

let browserExe = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);

if (browserExe) {
  console.log(`[generate_assets] Using browser executable: ${browserExe}`);

  const render = (htmlFile, outFile, width, height) => {
    const fileUrl = 'file:///' + path.join(assetsDir, htmlFile).replace(/\\\\/g, '/');
    const outPath = path.join(assetsDir, outFile);
    const cmd = `"${browserExe}" --headless --disable-gpu --screenshot="${outPath}" --window-size=${width},${height} --default-background-color=00000000 --hide-scrollbars "${fileUrl}"`;
    console.log(`[generate_assets] Rendering ${outFile} (${width}x${height})...`);
    execSync(cmd, { stdio: 'inherit' });
  };

  try {
    // Render GitHub social preview (1280x640)
    render('github-social-preview.html', 'github-social-preview.png', 1280, 640);
    fs.copyFileSync(path.join(assetsDir, 'github-social-preview.png'), path.join(assetsDir, 'og-default.png'));

    // Render Dark Demo Hero (1440x900)
    render('demo-hero-dark.html', 'demo-hero-dark.png', 1440, 900);

    // Render Light Demo Hero (1440x900)
    render('demo-hero-light.html', 'demo-hero-light.png', 1440, 900);

    // Render Architecture Pipeline (1280x640)
    render('demo-architecture.html', 'demo-architecture.png', 1280, 640);

    console.log('[generate_assets] ✓ All PNG assets successfully rendered and saved to assets/!');
  } catch (err) {
    console.error('[generate_assets] Error rendering with browser:', err.message);
  }
}
