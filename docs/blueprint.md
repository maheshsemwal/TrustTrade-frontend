# **App Name**: TrustTrade UI

## Core Features:

- Role-Based Dashboard: Role-based dashboard views (Buyer, Seller, Arbitrator) displaying relevant disputes, tokens, and actions.
- AI Case Summary: Display a GPT-generated summary of the dispute case within the voting system, including options to regenerate, rate, and flag for bias. The LLM uses the available information as a tool to decide what to include in its output. 
- Dispute Timeline: A visual timeline component showcasing the dispute stages (Filed, Evidence, Summary, Voting, Resolved), each linking to on-chain transaction hashes.

## Style Guidelines:

- Primary color: Dark blue (#0A192F) for a professional and trustworthy feel.
- Secondary color: White (#FFFFFF) for contrast and readability.
- Accent: Teal (#00FFFF) for interactive elements and highlights.
- Responsive layout using Tailwind CSS grid and flexbox for optimal viewing on all devices.
- Use modern and consistent icons from Lucide or Heroicons.
- Subtle animations using Framer Motion for smooth transitions and user feedback.

## Original User Request:
Design a responsive, modern frontend UI for a Web3 platform called TrustTrade, which enables decentralized B2B dispute resolution using blockchain, AI, and community arbitration. The platform should follow a dark blue/white minimal theme, use Tailwind CSS and React with modern, accessible components. The UI must be designed for three main user roles: Buyers, Sellers, and Arbitrators.

🌐 Landing Page
Hero section with a tagline: “Fast, Fair, Decentralized B2B Dispute Resolution”

Explanation cards for:

Smart Contract Escrow

Community Arbitration (Voting)

AI-Powered Case Summaries

Tokenized Rewards

Call-to-actions: “Connect Wallet”, “File a Dispute”, “Become Arbitrator”

Footer with social links, privacy, and terms of service

🧭 Dashboard (Context-Aware by Role)
Role-based UI views:

Buyer View: disputes filed, tokens held, recent decisions

Seller View: open cases, feedback, reputation status

Arbitrator View: vote opportunities, reward summary, performance stats

Components:

Token balance and reputation badges

Active disputes with status indicators (Pending, In Review, Resolved)

Quick Actions: File New Dispute, View Assigned Cases, Join Voting

💬 Chat Section
Secure 1-on-1 chat for buyer & seller during disputes

Real-time messaging with timestamps

Optional evidence/file attachment

Evidence viewer for images, PDFs, and audio

🗳️ Voting System (Polls)
GPT-Generated Dispute Summary Panel

Show “Vote” button with “Support Buyer” / “Support Seller”

Hide vote results until the user votes

After voting, show result breakdown and voter’s public choice

Voter comment input (optional) to justify vote

Smart contract integration for signing votes

🔐 Web3 Wallet & On-Chain Interaction
Wallet connect options (MetaMask, WalletConnect)

Show connected wallet address and balance

View past transaction history (on-chain links)

All actions (filing disputes, votes, rewards) are signed txs

📊 Dispute Timeline Component
Visual timeline: Filed → Evidence → Summary → Voting → Resolved

Each milestone links to respective on-chain transaction hash

⭐ Reputation & Rewards
Star-based trust score + badges (Trusted Vendor, Top Voter)

Token reward tracking & claim interface

Leaderboard of top arbitrators, buyers, and sellers

🔔 Notifications System
Realtime alerts (toast or bell icon dropdown):

New voting invite

Dispute updates

Rewards earned

WebSocket or polling based live update system

🧠 AI Case Summary Sidebar
Display GPT-generated summary of case

Options to: Regenerate, Rate, Flag for bias

Optional voice-over for accessibility

🌐 Multilingual + Accessibility
English + Hindi support

Voice-over of summaries for low-literacy users

Full screen-reader and keyboard navigation support

🌓 Dark Mode Toggle
Smooth switch between dark and light themes

Save theme preference in local storage or connected wallet

🏆 Community Leaderboard
Public view of:

Top voters (by accuracy & honesty)

Most trusted vendors

Most active buyers

Includes reputation scores and earned badges

🎨 UI Guidelines
Use Tailwind CSS with utility-first components

Use Shadcn UI or Aceternity-style design system

Add animations using Framer Motion

Icons from Lucide or Heroicons

Responsive layout for desktop + mobile
  