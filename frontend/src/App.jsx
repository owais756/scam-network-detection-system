import { useState, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
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

  const analyzeMessage = async () => {
    const response = await ffetch(`${import.meta.env.VITE_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({text: message }),
    });

    const data = await response.json();
    setResult(data);

    if (data.graph_data?.nodes) {
      setGraphData(data.graph_data);
    }
  };

  const getClusterColor = (cluster) => {
    const colors = ["#69c0ff", "#95de64", "#ffd666", "#ff85c0"];
    return colors[cluster % colors.length];
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

            <div className="graph-container" ref={containerRef}>
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                width={graphWidth}
                height={500}
                cooldownTicks={100}
                onEngineStop={() => graphRef.current.zoomToFit(400)}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const radius = node.type === "message" ? 14 : 7;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;

                  const color =
                    node.type === "message"
                      ? "#ffffff"
                      : getClusterColor(node.cluster);

                  ctx.shadowBlur =
                    node.centrality_score > 0.3 ? 20 : 0;
                  ctx.shadowColor =
                    node.centrality_score > 0.3 ? "#ff4d4f" : "transparent";

                  ctx.fillStyle = color;

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                  ctx.fill();

                  ctx.shadowBlur = 0;

                  ctx.fillStyle = "black";
                  ctx.fillText(node.id, node.x + 8, node.y + 3);
                }}
              />
            </div>

            <div className="meaning-box">
              <h3>Graph Meaning</h3>
              <p>{result.graph_summary}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;