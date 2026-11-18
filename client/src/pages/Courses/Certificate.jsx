import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadCertificate();
  }, [courseId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);

      const response =
        await API.get("/certificates/my");

      const certificates =
        response.data?.certificates || [];

      const found = certificates.find(
        (item) =>
          String(
            item.courseId?._id ||
              item.courseId
          ) === String(courseId)
      );

      if (!found) {
        setError(
          "Certificate is not available yet."
        );
        return;
      }

      setCertificate(found);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load certificate."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="certificate-page">
        <style>{styles}</style>

        <div className="certificate-loading">
          <div className="spinner" />
          <h2>Preparing your certificate...</h2>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="certificate-page">
        <style>{styles}</style>

        <div className="certificate-loading">

          <div className="empty-seal">
            🎓
          </div>

          <h2>
            Certificate unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                `/courses/${courseId}`
              )
            }
          >
            Back to Course
          </button>

        </div>
      </div>
    );
  }

  const issuedDate =
    certificate.issuedAt
      ? new Date(
          certificate.issuedAt
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <div className="certificate-page">
      <style>{styles}</style>

      <header className="certificate-nav">

        <button
          onClick={() =>
            navigate(
              `/courses/${courseId}/completed`
            )
          }
        >
          ← Back
        </button>

        <strong>
          PREPPULSE
        </strong>

        <button
          onClick={() =>
            window.print()
          }
        >
          Print Certificate
        </button>

      </header>

      <main className="certificate-wrapper">

        <div className="certificate-card">

          <div className="certificate-inner">

            <div className="certificate-top">

              <div className="certificate-brand">
                PREPPULSE
              </div>

              <div className="verified-mark">
                ✓ VERIFIED
              </div>

            </div>

            <div className="certificate-heading">

              <span>
                CERTIFICATE
              </span>

              <h1>
                OF COMPLETION
              </h1>

              <p>
                This certificate is proudly
                presented to
              </p>

            </div>

            <h2 className="student-name">
              {certificate.studentName}
            </h2>

            <div className="gold-line" />

            <p className="completion-copy">
              for successfully completing the
              structured learning program
            </p>

            <h3 className="course-name">
              {certificate.courseName}
            </h3>

            <p className="completion-copy">
              and demonstrating the required
              knowledge and skills through the
              PrepPulse assessment system.
            </p>

            <div className="certificate-data">

              <div>
                <span>FINAL SCORE</span>
                <strong>
                  {certificate.score}%
                </strong>
              </div>

              <div>
                <span>ISSUED</span>
                <strong>
                  {issuedDate}
                </strong>
              </div>

              <div>
                <span>CERTIFICATE ID</span>
                <strong>
                  {certificate.certificateId}
                </strong>
              </div>

            </div>

            <div className="certificate-bottom">

              <div>
                <div className="signature">
                  PrepPulse
                </div>

                <div className="signature-line" />

                <span>
                  PrepPulse Learning
                </span>
              </div>

              <div className="seal">
                <div>
                  ✓
                  <small>
                    VERIFIED
                  </small>
                </div>
              </div>

              <div className="verify-signature">

                <div className="signature">
                  Digital
                </div>

                <div className="signature-line" />

                <span>
                  Certificate Authority
                </span>

              </div>

            </div>

          </div>

        </div>

        <div className="certificate-actions">

          <button
            className="verify"
            onClick={() =>
              navigate(
                `/courses/certificate/verify/${certificate.certificateId}`
              )
            }
          >
            🔐 Verify Certificate
          </button>

          <button
            onClick={() =>
              window.print()
            }
          >
            🖨 Print
          </button>

        </div>

      </main>
    </div>
  );
};

const styles = `
* {
  box-sizing: border-box;
}

.certificate-page {
  min-height: 100vh;
  padding-bottom: 80px;
  background:
    radial-gradient(circle at 50% 0%,rgba(99,102,241,.18),transparent 35%),
    #020617;
  color: #f8fafc;
}

.certificate-nav {
  width: min(1100px,92%);
  height: 78px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.certificate-nav button {
  padding: 9px 13px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 9px;
}

.certificate-nav strong {
  color: #a5b4fc;
  font-size: 12px;
  letter-spacing: 4px;
}

.certificate-wrapper {
  width: min(1050px,92%);
  margin: 45px auto;
}

.certificate-card {
  padding: 8px;
  border-radius: 15px;
  background:
    linear-gradient(
      135deg,
      #c4b5fd,
      #6366f1,
      #7c3aed,
      #c4b5fd
    );
  box-shadow: 0 40px 100px rgba(0,0,0,.4);
}

.certificate-inner {
  min-height: 650px;
  padding: 55px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 20%,rgba(99,102,241,.15),transparent 40%),
    #071022;
  border: 1px solid rgba(196,181,253,.2);
}

.certificate-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.certificate-brand {
  color: #c4b5fd;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 5px;
}

.verified-mark {
  padding: 6px 8px;
  border-radius: 5px;
  background: rgba(16,185,129,.08);
  color: #34d399;
  font-size: 7px;
  letter-spacing: 1px;
}

.certificate-heading {
  margin-top: 65px;
}

.certificate-heading span {
  color: #64748b;
  font-size: 9px;
  letter-spacing: 4px;
}

.certificate-heading h1 {
  margin: 7px 0 25px;
  font-family: Georgia,serif;
  font-size: 42px;
  letter-spacing: 1px;
}

.certificate-heading p,
.completion-copy {
  color: #64748b;
  font-size: 10px;
  line-height: 1.7;
}

.student-name {
  margin: 25px 0 10px;
  font-family: Georgia,serif;
  font-size: 42px;
  color: #f8fafc;
}

.gold-line {
  width: 260px;
  height: 1px;
  margin: auto;
  background: linear-gradient(90deg,transparent,#c4b5fd,transparent);
}

.course-name {
  margin: 5px 0 0;
  color: #c4b5fd;
  font-size: 27px;
}

.certificate-data {
  margin-top: 45px;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  border-top: 1px solid rgba(255,255,255,.07);
  border-bottom: 1px solid rgba(255,255,255,.07);
}

.certificate-data div {
  padding: 17px;
  border-right: 1px solid rgba(255,255,255,.05);
}

.certificate-data div:last-child {
  border-right: 0;
}

.certificate-data span {
  display: block;
  color: #475569;
  font-size: 7px;
  letter-spacing: 1px;
}

.certificate-data strong {
  display: block;
  margin-top: 7px;
  color: #cbd5e1;
  font-size: 10px;
  word-break: break-word;
}

.certificate-bottom {
  margin-top: 50px;
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  align-items: end;
  gap: 30px;
}

.certificate-bottom > div:first-child {
  text-align: left;
}

.verify-signature {
  text-align: right;
}

.signature {
  color: #a5b4fc;
  font-family: cursive;
  font-size: 21px;
}

.signature-line {
  height: 1px;
  margin: 5px 0;
  background: rgba(255,255,255,.15);
}

.certificate-bottom span {
  color: #475569;
  font-size: 7px;
}

.seal {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  border: 2px solid #818cf8;
  border-radius: 50%;
  color: #a5b4fc;
  font-size: 25px;
}

.seal small {
  display: block;
  margin-top: -2px;
  font-size: 5px;
  letter-spacing: 1px;
}

.certificate-actions {
  display: flex;
  justify-content: center;
  gap: 9px;
  margin-top: 20px;
}

.certificate-actions button {
  padding: 11px 16px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 9px;
}

.certificate-actions .verify {
  border: none;
  background: linear-gradient(110deg,#6366f1,#7c3aed);
  color: white;
}

.certificate-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.certificate-loading p {
  color: #475569;
  font-size: 9px;
}

.certificate-loading button {
  margin-top: 15px;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  cursor: pointer;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255,255,255,.08);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.empty-seal {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(99,102,241,.08);
  font-size: 30px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media(max-width:650px) {
  .certificate-inner {
    padding: 35px 20px;
  }

  .certificate-heading {
    margin-top: 40px;
  }

  .certificate-heading h1 {
    font-size: 32px;
  }

  .student-name {
    font-size: 31px;
  }

  .course-name {
    font-size: 22px;
  }

  .certificate-data {
    grid-template-columns: 1fr;
  }

  .certificate-data div {
    border-right: 0;
    border-bottom: 1px solid rgba(255,255,255,.05);
  }

  .certificate-bottom {
    grid-template-columns: 1fr;
  }

  .certificate-bottom > div,
  .verify-signature {
    text-align: center !important;
  }

  .certificate-actions {
    flex-direction: column;
  }

  .certificate-actions button {
    width: 100%;
  }
}

@media print {
  .certificate-nav,
  .certificate-actions {
    display: none;
  }

  .certificate-page {
    padding: 0;
    background: white;
  }

  .certificate-wrapper {
    width: 100%;
    margin: 0;
  }
}
`;

export default Certificate;