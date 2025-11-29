# NFTFlow — Somnia Hackathon Submission

## 🎯 Elevator Pitch

**NFTFlow** — a Netflix-style NFT rental marketplace that uses **Somnia Data Streams** to publish real-time rental lifecycle events (`rental_started`, per-second `rental_tick`, `pricing_suggestion`) so frontends and AI agents react instantly with sub-second UX.

---

## 📖 What NFTFlow Does

NFTFlow enables NFT owners to rent out assets in time-limited micro-rentals. When a rental starts, the smart contract and backend publish structured events to Somnia Data Streams. Frontend subscribers (and autonomous AI agents) receive these events in real-time to:

- ✅ Update UI instantly
- ✅ Show per-second streaming payments
- ✅ Surface AI pricing suggestions
- ✅ Enable arbitrage detection

All without polling or slow indexers.

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| **Live Demo** | Navigate to `/demo` in the app |
| **GitHub Repo** | [Your repo URL] |
| **Demo Video** | [Your video URL] |

---

## 🚀 Quick Start for Judges

```bash
# 1. Clone and install
git clone [repo-url]
cd nftflow
npm ci

# 2. Run the demo
npm run dev

# 3. Open in browser
# Navigate to: http://localhost:5173/demo

# 4. Click "Start" and "Add Rental" to see real-time streaming
```

---

## 📊 How Somnia Data Streams is Used

We publish these event schemas via Somnia Data Streams:

| Schema | Purpose | Update Frequency |
|--------|---------|------------------|
| `rental_started_v1` | New rental initiated | On rental creation |
| `rental_tick_v1` | Per-second payment tick | Every second |
| `pricing_suggestion_v1` | AI pricing recommendation | Every 5 seconds |
| `agent_action_v1` | Autonomous agent action | Every 8 seconds |

**Publisher:** Server wallet (server signs & publishes streams)
**Subscribers:** Frontend + AI Agents (read-only)

Schema IDs are in `src/demo/SCHEMA_IDS.json`

---

## 🎬 Demo Video Timecodes

| Time | Content |
|------|---------|
| 0:00–0:10 | Title: "NFTFlow — Somnia Data Streams Demo" |
| 0:10–0:35 | Problem statement + elevator pitch |
| 0:35–1:20 | Show schema IDs and publisher/subscriber architecture |
| 1:20–2:10 | Demo: Start rental → see ticks → pricing suggestion |
| 2:10–2:40 | Event Inspector: raw JSON, txHash, schemaId |
| 2:40–3:10 | Show replay feature and local run instructions |
| 3:10–3:30 | Call-to-action and GitHub link |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   NFT Owner     │────▶│  Smart Contract      │────▶│  Somnia Data    │
│   (Lister)      │     │  (Rental Logic)      │     │  Streams        │
└─────────────────┘     └──────────────────────┘     └────────┬────────┘
                                                              │
                        ┌─────────────────────────────────────┼─────────┐
                        │                                     │         │
                        ▼                                     ▼         ▼
                ┌───────────────┐                     ┌───────────┐  ┌─────────┐
                │  Frontend UI  │                     │ AI Agents │  │ Indexer │
                │  (React)      │                     │ (Pricing) │  │ (Future)│
                └───────────────┘                     └───────────┘  └─────────┘
```

---

## 📁 Key Files

| File | Description |
|------|-------------|
| `src/demo/mockSomnia.ts` | Mock Somnia Data Streams client |
| `src/demo/somniaAdapter.ts` | Unified adapter (mock/real toggle) |
| `src/demo/sampleSchemas.ts` | Schema definitions and sample payloads |
| `src/pages/DemoPage.tsx` | Interactive demo page |
| `src/demo/SCHEMA_IDS.json` | Computed schema IDs for reference |

---

## 🔄 Switching to Real Somnia SDK

1. Set `VITE_USE_MOCK_SOMNIA=0` in `.env`
2. Configure `VITE_SOMNIA_RPC_URL` with testnet/mainnet URL
3. Update `src/demo/somniaAdapter.ts` with real SDK implementation

---

## ✅ Judging Checklist

- [x] Real-time event streaming demonstrated
- [x] Schema IDs visible in UI
- [x] Per-second tick updates shown
- [x] AI pricing suggestions displayed
- [x] Event inspector with raw JSON + txHash
- [x] Easy local setup (<2 minutes)
- [x] Clear documentation

---

## 👥 Team

[Your team info]

---

## 📜 License

MIT

---

**Built with ❤️ for the Somnia Hackathon**
