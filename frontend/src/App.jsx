import { useState, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import * as d3 from "d3-force";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const graphRef = useRef();
  const containerRef = useRef();
  const [graphWidth, setGraphWidth] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setGraphWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // whenever graph data changes, reapply colliding force and warm up simulation
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("collide",
        d3.forceCollide().radius((d) => getNodeRadius(d) + 4).strength(0.8)
      );
      graphRef.current.d3Force("link").distance((d) => {
        // ensure links are at least the sum of the two node radii plus padding
        return getNodeRadius(d.source) + getNodeRadius(d.target) + 20;
      });
      // nudge simulation to avoid stuck layouts
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphData]);

  const analyzeMessage = async () => {
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    setResult(data);

    if (data.graph_data?.nodes) {
      setGraphData(data.graph_data);
      
      // set default selected profile to highest-risk entity
      const nonMessageNodes = data.graph_data.nodes.filter(n => n.type !== "message");
      const highestRisk = nonMessageNodes.reduce((max, node) => 
        (node.node_risk || 0) > (max.node_risk || 0) ? node : max, 
        nonMessageNodes[0]
      );
      if (highestRisk && highestRisk.risk_profile) {
        setSelectedProfile(highestRisk.risk_profile);
      }
    }
  };

  // determine a color based on the risk score (0-100)

  // build bar data sorted descending by risk (exclude message node)
  const getBarData = () => {
    return [...graphData.nodes]
      .filter((n) => n.type !== "message")
      .sort((a, b) => (b.node_risk || 0) - (a.node_risk || 0));
  };
  const getRiskColor = (risk = 0) => {
    if (risk >= 90) return "#DC143C"; // crimson red
    if (risk >= 70) return "#FF8C00"; // dark orange
    if (risk >= 40) return "#FFBF00"; // amber
    if (risk >= 20) return "#FFFF00"; // yellow
    return "#52c41a"; // green very low
  };

  // convert a node's risk score into a drawable radius
  const getNodeRadius = (node) => {
    if (node.type === "message") return 14; // fixed for central message
    const risk = node.node_risk || 0;
    const base = 4; // minimum radius
    const maxExtra = 16; // additional size for high risk
    return base + (risk / 100) * maxExtra;
  };

  // selected entity profile for radar chart
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleNodeClick = (node) => {
    if (node.type === "message") return;
    setSelectedProfile(node.risk_profile || null);
  };

  // simple bar-chart component within same file
  const BarChart = ({ data, getColor }) => {
    const barData = data
      .filter((n) => n.type !== "message")
      .sort((a, b) => (b.node_risk || 0) - (a.node_risk || 0));
    const width = 300;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 80, left: 50 };

    const xScale = (i) =>
      margin.left +
      (i * (width - margin.left - margin.right)) /
        (barData.length || 1);
    const barWidth =
      (width - margin.left - margin.right) / (barData.length || 1) - 10;

    const yScale = (r) =>
      height - margin.bottom - ((r / 100) * (height - margin.top - margin.bottom));

    return (
      <div>
        <svg width={width} height={height}>
          {/* y-axis line */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#ccc" />
          {/* x-axis line */}
          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#ccc" />

          {/* y-axis label */}
          <text x={15} y={height / 2} fontSize="12" fill="#ccc" textAnchor="middle" transform={`rotate(-90 15 ${height / 2})`}>
            Risk Score
          </text>

          {/* y-axis lines and labels */}
          {[0, 20, 40, 60, 80, 100].map((val) => (
            <g key={val}>
              <line
                x1={margin.left - 5}
                x2={margin.left}
                y1={yScale(val)}
                y2={yScale(val)}
                stroke="#ccc"
              />
              <text
                x={margin.left - 10}
                y={yScale(val) + 4}
                fontSize="10"
                textAnchor="end"
                fill="#ccc"
              >
                {val}
              </text>
            </g>
          ))}

          {/* bars */}
          {barData.map((d, i) => (
            <g key={d.id}>
              <rect
                x={xScale(i)}
                y={yScale(d.node_risk || 0)}
                width={barWidth}
                height={height - margin.bottom - yScale(d.node_risk || 0)}
                fill={getColor(d.node_risk || 0)}
              />
              {/* risk score on top of bar */}
              <text
                x={xScale(i) + barWidth / 2}
                y={yScale(d.node_risk || 0) - 5}
                fontSize="10"
                textAnchor="middle"
                fill="#fff"
                fontWeight="bold"
              >
                {d.node_risk}
              </text>
            </g>
          ))}

          {/* x-axis label */}
          <text x={width / 2} y={height - 5} fontSize="11" fill="#ccc" textAnchor="middle" fontWeight="bold">
            Entity Label
          </text>

        </svg>
        <div style={{ textAlign: "center", fontSize: "12px", color: "#ccc", marginTop: "8px" }}>
          Figure 2: Risk Score Distribution by Entity Type
        </div>
      </div>
    );
  };

  // radar/spider chart component
  const RadarChart = ({ profile }) => {
    if (!profile) return null;
    const labels = [
      "url_reputation",
      "sender_history",
      "content_phish",
      "behavioral_anomalies",
      "monetary_value",
      "social_urgency",
    ];
    const names = [
      "URL Reputation",
      "Sender History",
      "Content Phish-Pr.",
      "Behavioral Anomalies",
      "Monetary Value",
      "Social Urgency",
    ];

    const maxVal = 100;
    const size = 300;
    const center = size / 2;
    const radius = center - 50;
    const angleStep = (2 * Math.PI) / labels.length;

    const points = labels
      .map((k, i) => {
        const value = profile[k] || 0;
        const angle = i * angleStep - Math.PI / 2;
        const r = (value / maxVal) * radius;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      })
      .join(" ");

    const overall =
      labels.reduce((sum, k) => sum + (profile[k] || 0), 0) / labels.length;

    return (
      <div>
        <svg width={size} height={size}>
          {/* background grid circles with radial labels */}
          {[1, 2, 3, 4, 5].map((n) => {
            const r = (n / 5) * radius;
            return (
              <g key={n}>
                <polygon
                  points={labels
                    .map((_, i) => {
                      const angle = i * angleStep - Math.PI / 2;
                      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#555"
                />
                {/* radial axis label (0-100 scale) */}
                <text
                  x={center}
                  y={center - r + 10}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#aaa"
                >
                  {Math.round((n / 5) * 100)}
                </text>
              </g>
            );
          })}

          {/* spokes */}
          {labels.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(angle)}
                y2={center + radius * Math.sin(angle)}
                stroke="#555"
              />
            );
          })}

          {/* labels at the end of spokes */}
          {labels.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + (radius + 25) * Math.cos(angle);
            const y = center + (radius + 25) * Math.sin(angle);
            const value = profile[labels[i]] || 0;
            return (
              <g key={i}>
                <text
                  x={x}
                  y={y - 8}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#ccc"
                  fontWeight="500"
                >
                  {names[i]}
                </text>
                <text
                  x={x}
                  y={y + 6}
                  fontSize="11"
                  textAnchor="middle"
                  fill="#FFBF00"
                  fontWeight="bold"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* threat footprint */}
          <polygon
            points={points}
            fill="rgba(255, 191, 0, 0.4)"
            stroke="#FFBF00"
            strokeWidth="2"
          />
        </svg>
        <div className="overall-score">
          Overall Risk: {overall.toFixed(1)}
        </div>
        <div style={{ textAlign: "center", fontSize: "11px", color: "#ccc", marginTop: "8px" }}>
          Figure 3: Multi-Factor Attack Risk Profile
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="card">
        <h1>AI Scam Network Detector</h1>

        <textarea
          placeholder="Enter suspicious message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={analyzeMessage}>Analyze Message</button>

        {result && (
          <>
            <div className="result-box">
              <h2>{result.prediction}</h2>
              <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
              <p className={`risk ${result.risk_level}`}>
                Risk Level: {result.risk_level}
              </p>
            </div>

            <div className="side-by-side">
              <div className="graph-container" ref={containerRef}>
                {/* legend overlay inside same container */}
                <div className="legend">
                <div className="size-legend">
                  <strong>Node Size (risk)</strong>
                  <div className="size-samples">
                    {[1, 50, 100].map((r) => (
                      <div key={r} className="size-item">
                        <span
                          className="dot"
                          style={{
                            width: getNodeRadius({ type: "entity", node_risk: r }) * 2,
                            height: getNodeRadius({ type: "entity", node_risk: r }) * 2,
                          }}
                        />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="color-legend">
                  <strong>Risk Status</strong>
                  <div className="color-item">
                    <span className="color-dot" style={{ background: getRiskColor(95) }} />
                    Critical
                  </div>
                  <div className="color-item">
                    <span className="color-dot" style={{ background: getRiskColor(75) }} />
                    High
                  </div>
                  <div className="color-item">
                    <span className="color-dot" style={{ background: getRiskColor(55) }} />
                    Medium
                  </div>
                  <div className="color-item">
                    <span className="color-dot" style={{ background: getRiskColor(30) }} />
                    Low
                  </div>
                  <div className="color-item">
                    <span className="color-dot" style={{ background: getRiskColor(10) }} />
                    Very Low
                  </div>
                </div>
              </div> {/* end legend */}

              <div style={{ flex: "0 0 500px", position: "relative" }}>
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  width={graphWidth}
                  height={500}
                  cooldownTicks={100}
                  linkDirectionalParticles={1}
                  linkDirectionalParticleWidth={1}
                  nodeRelSize={4}
                  onEngineStop={() => graphRef.current.zoomToFit(400)}
                  onNodeClick={handleNodeClick}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    const radius = getNodeRadius(node);
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    const color =
                      node.type === "message"
                        ? "#ffffff"
                        : getRiskColor(node.node_risk || 0);

                    if (node.type === "message") {
                      ctx.shadowBlur = 20;
                      ctx.shadowColor = "#ffffff";
                    } else {
                      ctx.shadowBlur = node.node_risk > 80 ? 10 : 0;
                      ctx.shadowColor = node.node_risk > 80 ? "#ff4d4f" : "transparent";
                    }

                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                    ctx.fill();

                    ctx.shadowBlur = 0;

                    ctx.fillStyle = "black";
                    // draw label just outside radius to avoid overlap
                    ctx.fillText(node.id, node.x + radius + 4, node.y + 3);
                  }}
                />
              </div>
              <div style={{ textAlign: "center", fontSize: "12px", color: "#ccc", padding: "12px", background: "rgba(0,0,0,0.3)" }}>
                Figure 1: Risk-Weighted Network Map
              </div>
            </div> {/* end graph-container */}

            <div className="meaning-box">
              <h3>Graph Meaning</h3>
              <p>{result.graph_summary}</p>
            </div>

            <div className="charts-row">
              <div className="chart-wrapper">
                <BarChart data={graphData.nodes} getColor={getRiskColor} />
              </div>
              <div className="chart-wrapper">
                <RadarChart profile={selectedProfile} />
              </div>
            </div>
            </div> {/* end side-by-side */}

            <div className="interpretation-box">
              <h3>Graph Interpretations and Risk Analysis</h3>
              <p>This dashboard provides a multi-view analysis of the message network in Figure 1.</p>
              <p>
                Figure 1: Weighted Network Map. Node size and color represent entity risk, posing significant threat.
              </p>
              <p>
                Figure 2: Risk Score Distribution. The bar chart explicitly ranks the entities
                by score. The highest-risk element is clearly visible. The overall risk remains
                {" "}
                {result.risk_level.toLowerCase()} due to the single-cluster, low-volume communication pattern.
              </p>
              <p>
                Figure 3: Multi-Factor Attack Profile. The radar chart details why the overall risk is
                {" "}
                {result.risk_level.toLowerCase()} despite some high-risk elements. It highlights significant risk
                from phish-probability and urgency, but counterbalanced by low sender volume and relatively low
                behavioral anomalies.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;