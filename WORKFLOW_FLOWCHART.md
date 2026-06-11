# Scam Network Detection System - Workflow Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCAM DETECTION WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌───────────────────────┐
                    │   User Interface      │
                    │  (React + Vite App)   │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Enter Suspicious     │
                    │      Message          │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Click "Analyze"      │
                    │      Button           │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────────────────┐
                    │  Send Message to Backend API      │
                    │  POST /predict                    │
                    │  (Render Backend Server)          │
                    └───────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │        BACKEND ANALYSIS ENGINE                │
        │  (Multi-Factor Risk Assessment)               │
        └───────────────────────────────────────────────┘
        │
        ├─► Analyze URL Reputation
        │   (Check links for phishing/malware)
        │
        ├─► Analyze Sender History
        │   (Track sender's previous activities)
        │
        ├─► Detect Content Phishing Probability
        │   (NLP/ML model for phishing keywords)
        │
        ├─► Identify Behavioral Anomalies
        │   (Unusual patterns, timing, frequency)
        │
        ├─► Flag Monetary Value Indicators
        │   (Financial demands, payments)
        │
        └─► Detect Social Urgency
            (Time pressure, artificial urgency)
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Calculate Risk Score │
                    │  for Each Entity      │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Generate Network     │
                    │  Graph Data           │
                    │  (Nodes & Links)      │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Determine Overall    │
                    │  Risk Classification: │
                    │  • Critical (≥90)     │
                    │  • High (≥70)         │
                    │  • Medium (≥40)       │
                    │  • Low (≥20)          │
                    │  • Very Low (<20)     │
                    └───────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────┐
        │   Return JSON Response with:           │
        │   • prediction (Scam/Not Scam)        │
        │   • confidence (%)                     │
        │   • risk_level                         │
        │   • graph_data (nodes + links)        │
        │   • graph_summary                      │
        │   • risk_profile (6 factors)           │
        └───────────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │     FRONTEND VISUALIZATION ENGINE          │
        │      (React Components)                    │
        └───────────────────────────────────────────┘
                                │
        ┌───────────────┬───────┴────────┬──────────────┐
        │               │                │              │
        ▼               ▼                ▼              ▼
    ┌─────────┐   ┌──────────┐    ┌──────────┐   ┌──────────┐
    │ Result  │   │ Figure 1 │    │ Figure 2 │   │ Figure 3 │
    │  Box    │   │ Network  │    │   Bar    │   │  Radar   │
    │         │   │  Map     │    │  Chart   │   │  Chart   │
    │─────────│   │──────────│    │──────────│   │──────────│
    │Predic.  │   │Force-    │    │Risk Score│   │6-Factor  │
    │Conf.%   │   │directed  │    │Distrib.  │   │Profile   │
    │Risk Lvl │   │graph     │    │by Entity │   │Radar     │
    └─────────┘   │Colored   │    │          │   │          │
                  │by Risk   │    └──────────┘   └──────────┘
                  │Sized     │
                  │by Score  │
                  │Clickable │
                  │nodes     │
                  └──────────┘
                                │
        ┌───────────────────────┴──────────────────────┐
        │                                              │
        ▼                                              ▼
    ┌──────────────┐                          ┌──────────────┐
    │ Meaning Box  │                          │Interpretation│
    │              │                          │   & Analysis  │
    │Graph Summary │                          │   Box        │
    └──────────────┘                          └──────────────┘
                │                                      │
                └──────────────┬───────────────────────┘
                               │
                               ▼
                    ┌───────────────────────┐
                    │  Interactive Analysis │
                    │                       │
                    │ • Click nodes to      │
                    │   update profiles     │
                    │ • View entity details │
                    │ • Analyze patterns    │
                    └───────────────────────┘
                               │
                               ▼
                    ┌───────────────────────┐
                    │   User Decision       │
                    │                       │
                    │ • Report as Scam?     │
                    │ • Block Sender?       │
                    │ • Further Analysis?   │
                    └───────────────────────┘
                               │
                               ▼
                              END

```

## Data Flow Summary

```
USER INPUT → API REQUEST → BACKEND ANALYSIS → RISK SCORING → RESPONSE
                                                      ↓
                                        NETWORK GRAPH GENERATION
                                                      ↓
VISUALIZATION COMPONENTS ← DATA PROCESSING ← GRAPH DATA STRUCTURE

```

## Risk Color Coding

| Risk Score | Color   | Level      |
|------------|---------|-----------|
| ≥ 90       | 🔴 Red  | Critical  |
| ≥ 70       | 🟠 Orange | High    |
| ≥ 40       | 🟡 Yellow | Medium  |
| ≥ 20       | 💛 Light Yellow | Low |
| < 20       | 🟢 Green | Very Low  |

## System Components

### Frontend
- React + Vite Application
- Force-Graph 2D Visualization
- D3-Force Physics Engine
- Interactive Canvas Rendering

### Backend
- Hosted on Render
- Multi-factor Risk Analysis
- NLP/ML Model for Detection
- Graph Data Generation

### Data Structure
- **Nodes**: Messages, Entities (Senders, URLs, etc.)
- **Links**: Relationships between entities
- **Risk Profiles**: 6-factor analysis per entity
