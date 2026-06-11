# Backend Analysis Guide - Scam Detection System

## Overview
The backend processes suspicious messages sent via the **POST /predict** endpoint and performs comprehensive multi-factor risk analysis. The backend server is hosted on **Render** at: `https://scam-backend-gx2w.onrender.com/predict`

---

## 6-Factor Risk Analysis

The backend analyzes each message across **six key dimensions**:

### 1. **URL Reputation** (0-100 score)
**What it does:**
- Extracts all URLs from the message
- Validates URL structure and legitimacy
- Checks against known phishing/malware databases
- Analyzes domain reputation and age
- Detects URL obfuscation techniques

**How it's done:**
- Domain blacklist/whitelist lookup
- URL pattern matching for suspicious indicators
- Integration with threat intelligence APIs
- Analysis of domain registration details
- Check for lookalike domains (typosquatting)

**Example:**
- Legitimate URL (bit.ly, known companies) → Low score
- Unknown/newly registered domain → Medium score
- Known phishing URL → High score

---

### 2. **Sender History** (0-100 score)
**What it does:**
- Tracks communication patterns from the sender
- Identifies repeat offenders
- Analyzes sender's message frequency
- Detects sender address spoofing
- Flags new or suspicious sender profiles

**How it's done:**
- Maintains database of sender addresses
- Tracks sender reputation over time
- Analyzes email headers for authenticity
- Detects sender address manipulation
- Checks against known fraudster lists

**Example:**
- Established sender with clean history → Low score
- New sender from unfamiliar domain → Medium score
- Sender previously flagged as scammer → High score

---

### 3. **Content Phishing Probability** (0-100 score)
**What it does:**
- Performs NLP (Natural Language Processing) analysis on message text
- Identifies phishing keywords and phrases
- Detects social engineering techniques
- Analyzes message language patterns
- Flags suspicious request patterns

**How it's done:**
- Machine Learning model trained on phishing/legitimate emails
- Keyword detection (e.g., "verify account", "confirm password", "urgent action")
- Sentiment analysis to detect urgency/fear tactics
- Grammar and structure analysis for copied/templated content
- Pattern matching for common phishing templates

**Phishing Keywords Detected:**
- Verify, confirm, validate, authenticate
- Urgent, immediate, action required
- Account suspended, compromised, locked
- Update payment, billing information
- Unusual activity, suspicious login
- Click here, confirm identity

**Example:**
- "Please confirm your account" → High score
- "Hi, how are you?" → Low score
- "ACT NOW: Your account will be closed in 24 hours" → Very High score

---

### 4. **Behavioral Anomalies** (0-100 score)
**What it does:**
- Detects unusual sender behavior patterns
- Identifies deviation from normal communication
- Flags timing anomalies
- Analyzes message formatting inconsistencies
- Detects mass messaging campaigns

**How it's done:**
- Establishes baseline for sender's typical behavior
- Statistical analysis of message frequency
- Time-of-day pattern analysis
- Message length and structure comparison
- Detection of batch/bulk message patterns

**Anomalies Detected:**
- Sudden increase in message volume
- Messages at unusual times (e.g., 3 AM)
- Drastic format/tone changes
- Multiple similar messages to different recipients
- Unusual recipient list distribution

**Example:**
- Sender usually emails 1-2 times/week, suddenly 50 emails → High score
- Message drastically shorter/longer than usual → Medium score
- Same message content to multiple recipients → High score

---

### 5. **Monetary Value Indicators** (0-100 score)
**What it does:**
- Identifies financial requests or transactions
- Detects money transfer requests
- Flags cryptocurrency/payment mentions
- Analyzes financial urgency
- Identifies investment/lottery scam patterns

**How it's done:**
- Keyword extraction for payment methods
- Amount detection (numerical patterns)
- Currency identification
- Payment platform recognition
- Investment/lottery terminology detection

**Indicators Detected:**
- "Transfer money", "wire funds", "send payment"
- Bank account details, routing numbers
- Cryptocurrency addresses
- Gift card codes, payment apps (Venmo, PayPal)
- "Prize", "winner", "claim reward"
- "Investment opportunity", "guaranteed return"

**Example:**
- "You've won a prize, send $50 to claim" → Very High score
- "Please send Bitcoin to..." → Very High score
- "Invoice for services rendered" → Low score

---

### 6. **Social Urgency** (0-100 score)
**What it does:**
- Detects artificial time pressure
- Identifies fear/panic inducing language
- Flags threats and coercion attempts
- Analyzes emotional manipulation techniques
- Detects action-forcing language

**How it's done:**
- Temporal keyword detection (today, now, immediately, deadline)
- Threat analysis (will lose, will be closed, will charge)
- Emotional keyword detection (urgent, emergency, crisis)
- Capitalization and punctuation anomaly detection
- Exclamation mark frequency analysis

**Urgency Phrases Detected:**
- "Act now!", "Immediate action required"
- "24 hours", "Limited time offer"
- "Your account will be closed"
- "Verify now or lose access"
- "URGENT: Response required"
- "Last chance", "Offer expires today"

**Example:**
- "Please review this document" → Low score
- "ACT NOW or your account will be closed!" → Very High score
- "Confirm within 24 hours or lose access" → Very High score

---

## Overall Risk Calculation

### Risk Score Aggregation
```
Overall Risk = Average(URL_Rep, Sender_History, Content_Phish, 
                       Behavioral_Anomalies, Monetary_Value, Social_Urgency)
```

### Risk Level Classification
| Score Range | Risk Level  | Meaning                              |
|-------------|-------------|--------------------------------------|
| 90-100      | **CRITICAL** | Extremely likely to be a scam       |
| 70-89       | **HIGH**     | Very likely to be a scam            |
| 40-69       | **MEDIUM**   | Possible scam, review carefully     |
| 20-39       | **LOW**      | Unlikely to be a scam               |
| 0-19        | **VERY LOW** | Very unlikely to be a scam          |

---

## Network Graph Generation

### Node Types
The backend creates a network graph with two types of nodes:

#### 1. **Message Node** (Single, central)
- Represents the suspicious message itself
- Color: White
- Size: Fixed
- Role: Central hub connecting all entities

#### 2. **Entity Nodes** (Multiple)
- **Senders** (email addresses, phone numbers)
- **URLs** (links extracted from message)
- **Keywords** (high-risk phishing keywords detected)
- **Patterns** (identified behavioral patterns)

- Color: Based on risk score (Red/Orange/Yellow/Green)
- Size: Proportional to individual risk score
- Connections: Links to message node if related

### Link Relationships
Edges represent associations:
- Message → Sender (who sent it)
- Message → URL (links in message)
- Message → Keyword (phishing terms found)
- Sender → Historical context (previous activity)

### Risk Profile for Each Entity
Each entity node includes a risk profile with the 6-factor breakdown:
```json
{
  "entity_id": "sender@example.com",
  "entity_type": "sender",
  "node_risk": 75,
  "risk_profile": {
    "url_reputation": 20,
    "sender_history": 95,
    "content_phish": 60,
    "behavioral_anomalies": 80,
    "monetary_value": 90,
    "social_urgency": 65
  }
}
```

---

## API Request/Response Format

### Request
```bash
POST https://scam-backend-gx2w.onrender.com/predict
Content-Type: application/json

{
  "message": "Suspicious message text here"
}
```

### Response
```json
{
  "prediction": "SCAM",
  "confidence": 0.92,
  "risk_level": "HIGH",
  "overall_score": 78,
  
  "graph_data": {
    "nodes": [
      {
        "id": "message_1",
        "type": "message",
        "label": "Suspicious Message"
      },
      {
        "id": "sender@phishing.com",
        "type": "sender",
        "node_risk": 85,
        "risk_profile": {
          "url_reputation": 40,
          "sender_history": 90,
          "content_phish": 75,
          "behavioral_anomalies": 85,
          "monetary_value": 95,
          "social_urgency": 80
        }
      },
      {
        "id": "http://malicious-url.com",
        "type": "url",
        "node_risk": 92,
        "risk_profile": { ... }
      }
    ],
    "links": [
      {
        "source": "message_1",
        "target": "sender@phishing.com",
        "relationship": "sent_by"
      },
      {
        "source": "message_1",
        "target": "http://malicious-url.com",
        "relationship": "contains"
      }
    ]
  },
  
  "graph_summary": "High-risk sender with history of phishing attempts is sending a message with urgent language and suspicious links.",
  
  "individual_scores": {
    "url_reputation": 65,
    "sender_history": 90,
    "content_phish": 80,
    "behavioral_anomalies": 70,
    "monetary_value": 85,
    "social_urgency": 75
  }
}
```

---

## Analysis Process Flow

```
INPUT MESSAGE
    ↓
[1] TEXT PREPROCESSING
    - Tokenization
    - Normalization
    - Entity extraction (URLs, emails, phone numbers)
    ↓
[2] PARALLEL ANALYSIS (6 Factors)
    ├─→ URL Reputation Analysis
    │   - Extract & validate URLs
    │   - Check against threat databases
    │   - Score each URL
    │
    ├─→ Sender History Analysis
    │   - Look up sender in database
    │   - Check historical flags
    │   - Calculate sender risk
    │
    ├─→ Content Phishing Analysis
    │   - NLP keyword detection
    │   - ML model prediction
    │   - Sentiment analysis
    │
    ├─→ Behavioral Anomalies Analysis
    │   - Compare with sender baseline
    │   - Frequency analysis
    │   - Pattern matching
    │
    ├─→ Monetary Value Analysis
    │   - Detect payment keywords
    │   - Extract amounts/currency
    │   - Identify financial methods
    │
    └─→ Social Urgency Analysis
        - Time pressure detection
        - Fear language detection
        - Threat analysis
    ↓
[3] AGGREGATION
    - Combine 6 factor scores
    - Calculate overall risk
    - Generate confidence score
    ↓
[4] NETWORK GRAPH CONSTRUCTION
    - Create nodes for entities
    - Build relationships/links
    - Assign risk profiles
    ↓
[5] RESPONSE GENERATION
    - Format JSON response
    - Include graph data
    - Add interpretations
    ↓
OUTPUT RESPONSE
```

---

## Machine Learning Models Used

### 1. **Phishing Detection Model**
- Type: Text Classification (NLP)
- Training Data: Thousands of phishing vs. legitimate emails
- Algorithm: Could be using:
  - Naive Bayes
  - SVM (Support Vector Machine)
  - Neural Networks (LSTM/Transformer)
  - Ensemble methods (Random Forest)
- Features: Keywords, message length, sender reputation, URL presence

### 2. **Behavioral Anomaly Detection**
- Type: Outlier/Anomaly Detection
- Algorithm: Could be using:
  - Isolation Forest
  - Local Outlier Factor (LOF)
  - Statistical methods (Z-score)
- Features: Message frequency, time patterns, formatting consistency

### 3. **Risk Scoring Engine**
- Type: Regression/Weighted Scoring
- Combines all 6 factors with weights
- Weights may be dynamic based on context

---

## Data Sources & Integrations

The backend likely uses:

1. **Threat Intelligence APIs**
   - VirusTotal, URLhaus, Phishing DB
   - Domain reputation services
   - Email security databases

2. **Internal Databases**
   - Sender reputation database
   - Historical scam/phishing records
   - Behavioral patterns database

3. **Machine Learning Models**
   - Pre-trained NLP models
   - Custom anomaly detection models
   - Ensemble prediction models

4. **Real-time Data**
   - Current domain reputation
   - Recent threat indicators
   - Active phishing campaigns

---

## Performance Considerations

- **Processing Time**: ~1-3 seconds per message
- **Parallel Processing**: All 6 factors analyzed simultaneously
- **Caching**: Common URLs/senders cached for faster lookup
- **Rate Limiting**: May be limited by backend infrastructure
- **Accuracy**: Likely 85-95% based on ML model performance

---

## Example Analysis Walkthrough

### Input Message
```
Subject: Urgent: Verify Your Account
Body: 
"Hello,

We've detected unusual activity on your account. 
VERIFY IMMEDIATELY to avoid suspension.

Click here to confirm: http://bit.ly/verify-bank-login

Do not delay - you have 24 hours!"
```

### Analysis Breakdown

| Factor | Analysis | Score |
|--------|----------|-------|
| **URL Reputation** | bit.ly URL redirects to unknown domain, phishing indicators | 75 |
| **Sender History** | New/spoofed domain, not from actual bank | 85 |
| **Content Phishing** | Keywords: "VERIFY", "unusual activity", "suspension", "IMMEDIATELY" | 85 |
| **Behavioral Anomalies** | Urgent tone, action-forcing language unusual for bank | 70 |
| **Monetary Value** | Account/banking context implied | 60 |
| **Social Urgency** | "24 hours", "IMMEDIATELY", threat of suspension | 90 |

### Overall Result
```
Average Score = (75+85+85+70+60+90) / 6 = 77.5

Risk Level: HIGH (≥70)
Prediction: SCAM (90%+ confidence)
Recommendation: DO NOT CLICK LINKS
```

---

## Key Takeaways

1. **Multi-factor approach** ensures comprehensive analysis
2. **Machine learning** provides intelligent detection beyond simple rules
3. **Network graph visualization** helps users understand relationships
4. **Risk profiles** show which factors contributed most to the score
5. **Real-time processing** enables instant feedback
6. **Confidence scores** indicate prediction reliability

