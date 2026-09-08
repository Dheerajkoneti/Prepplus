import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #08142d, #102040)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 0 30px rgba(0,255,255,0.15)",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <div
          style={{
            fontSize: "70px",
            marginBottom: "20px",
          }}
        >
          🚀
        </div>

        <h1
          style={{
            color: "#00D9FF",
            marginBottom: "10px",
          }}
        >
          Welcome to PrepPulse
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#d1d5db",
            marginBottom: "30px",
          }}
        >
          Google Authentication Successful
        </p>

        <div
          style={{
            width: "70px",
            height: "70px",
            border:
              "6px solid rgba(255,255,255,0.15)",
            borderTop:
              "6px solid #00D9FF",
            borderRadius: "50%",
            margin: "0 auto",
            animation: "spin 1s linear infinite",
          }}
        />

        <p
          style={{
            marginTop: "25px",
            color: "#9CA3AF",
          }}
        >
          Preparing your AI learning dashboard...
        </p>

        <div
          style={{
            marginTop: "20px",
            background: "#1e293b",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "8px",
              background:
                "linear-gradient(90deg,#00D9FF,#4CAF50)",
              animation:
                "loading 3s linear forwards",
            }}
          />
        </div>

        <p
          style={{
            marginTop: "15px",
            color: "#4CAF50",
            fontWeight: "bold",
          }}
        >
          Redirecting to Dashboard...
        </p>

        <style>
          {`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }

            @keyframes loading {
              0% {
                width: 0%;
              }
              100% {
                width: 100%;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default GoogleSuccess;