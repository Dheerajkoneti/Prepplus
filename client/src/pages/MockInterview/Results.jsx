import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function Results() {
  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/mock-interview/${id}/result`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    setResult({
        score: res.data.score,
        totalQuestions:
            res.data.totalQuestions,
        attemptedQuestions:
            res.data.attemptedQuestions,
    });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
        }}
      >
        Loading Results...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
      }}
    >
      <h1>Interview Results</h1>

      {result ? (
        <>
          <h3>Score: {result.score}</h3>
          <p>Total Questions: {result.totalQuestions}</p>
          <p>Correct Answers: {result.correctAnswers}</p>

          <Link
            to={`/mock-interview/report/${id}`}
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            View Detailed Report →
          </Link>
        </>
      ) : (
        <p>No result found.</p>
      )}
    </div>
  );
}

export default Results;