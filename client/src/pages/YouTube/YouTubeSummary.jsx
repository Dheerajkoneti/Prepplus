import { useState, useEffect } from "react";
import axios from "axios";
import {
  Brain,
  Youtube,
  Download,
  Trash2,
  Loader2,
  History,
} from "lucide-react";

const MindMapGenerator = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [mindMap, setMindMap] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/youtube/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateMindMap = async () => {
    if (!youtubeUrl.trim()) {
      alert("Please enter YouTube URL");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/youtube/generate",
        {
          videoUrl: youtubeUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMindMap(res.data.data.mindMap);

      fetchHistory();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to generate mind map"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteMindMap = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/youtube/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const downloadMindMap = (content) => {
    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "MindMap.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#020b2d,#102244,#020b2d)",
        color: "white",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background:
                "rgba(59,130,246,0.15)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 20px",
            }}
          >
            <Youtube size={40} />
          </div>

          <h1
            style={{
              fontSize: "50px",
              marginBottom: "10px",
            }}
          >
            🧠 YouTube Mind Map Generator
          </h1>

          <p
            style={{
              color: "#cbd5e1",
            }}
          >
            Convert YouTube Videos into
            AI Powered Study Mind Maps
          </p>
        </div>

        {/* INPUT */}

        <div
          style={{
            background:
              "rgba(255,255,255,0.05)",
            padding: "25px",
            borderRadius: "20px",
            border:
              "1px solid rgba(255,255,255,0.1)",
            marginBottom: "30px",
          }}
        >
          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={youtubeUrl}
            onChange={(e) =>
              setYoutubeUrl(e.target.value)
            }
            style={{
              width: "100%",
              padding: "18px",
              borderRadius: "12px",
              border:
                "1px solid rgba(255,255,255,0.2)",
              background: "#08142d",
              color: "white",
              marginBottom: "20px",
            }}
          />

          <button
            onClick={generateMindMap}
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              color: "white",
              background:
                "linear-gradient(90deg,#2563eb,#3b82f6)",
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />{" "}
                Generating...
              </>
            ) : (
              "Generate Mind Map"
            )}
          </button>
        </div>

        {/* GENERATED RESULT */}

        {mindMap && (
          <div
            style={{
              background:
                "rgba(255,255,255,0.05)",
              padding: "25px",
              borderRadius: "20px",
              marginBottom: "40px",
              border:
                "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "20px",
              }}
            >
              <h2>
                <Brain size={24} /> Generated
                Mind Map
              </h2>

              <button
                onClick={() =>
                  downloadMindMap(mindMap)
                }
                style={{
                  padding: "10px 18px",
                  background: "#2563eb",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <Download size={18} />
                Download
              </button>
            </div>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
                background: "#08142d",
                padding: "20px",
                borderRadius: "12px",
                overflowX: "auto",
              }}
            >
              {mindMap}
            </pre>
          </div>
        )}

        {/* HISTORY */}

        <h2
          style={{
            marginBottom: "20px",
          }}
        >
          <History size={24} /> Saved Mind Maps
        </h2>

        {history.length === 0 ? (
          <div
            style={{
              background:
                "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "15px",
            }}
          >
            No Saved Mind Maps Found
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              style={{
                background:
                  "rgba(255,255,255,0.05)",
                padding: "20px",
                borderRadius: "15px",
                marginBottom: "15px",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p>
                <strong>
                  YouTube URL:
                </strong>
              </p>

              <a
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#60a5fa",
                }}
              >
                {item.videoUrl}
              </a>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  marginTop: "15px",
                  background: "#08142d",
                  padding: "15px",
                  borderRadius: "10px",
                  overflowX: "auto",
                }}
              >
                {item.mindMap}
              </pre>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  onClick={() =>
                    downloadMindMap(
                      item.mindMap
                    )
                  }
                  style={{
                    background:
                      "#2563eb",
                    border: "none",
                    padding:
                      "10px 15px",
                    borderRadius:
                      "8px",
                    color: "white",
                    cursor:
                      "pointer",
                  }}
                >
                  <Download
                    size={16}
                  />
                </button>

                <button
                  onClick={() =>
                    deleteMindMap(
                      item._id
                    )
                  }
                  style={{
                    background:
                      "#ef4444",
                    border: "none",
                    padding:
                      "10px 15px",
                    borderRadius:
                      "8px",
                    color: "white",
                    cursor:
                      "pointer",
                  }}
                >
                  <Trash2
                    size={16}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MindMapGenerator;