import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function ReportPage() {
  const { id } = useParams();

  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/mock-interview/${id}/report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReport(res.data.report);
    } catch (err) {
      console.log(err);
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950 text-white">
        Loading Report...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        AI Interview Report
      </h1>

      <div className="grid md:grid-cols-3 gap-5">

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Overall Score</h2>
          <p className="text-5xl font-bold text-green-400">
            {report.score}%
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Confidence</h2>
          <p className="text-5xl font-bold text-blue-400">
            {report.confidence}%
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Communication</h2>
          <p className="text-5xl font-bold text-purple-400">
            {report.communication}%
          </p>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-8">

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2 className="text-green-400 font-bold mb-3">
            Strengths
          </h2>

          {report.strengths?.map((item, index) => (
            <p key={index}>✅ {item}</p>
          ))}
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2 className="text-red-400 font-bold mb-3">
            Improvements
          </h2>

          {report.improvements?.map((item, index) => (
            <p key={index}>⚠️ {item}</p>
          ))}
        </div>

      </div>
    </div>
  );
}