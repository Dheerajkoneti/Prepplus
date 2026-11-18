import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const CertificateVerification = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    verify();
  }, [certificateId]);

  const verify = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `/certificates/verify/${certificateId}`
      );

      setCertificate(
        response.data?.certificate ||
          response.data
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Certificate could not be verified."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-page">
      <style>{styles}</style>

      <div className="verification-glow" />

      <header className="verification-header">

        <div className="verification-brand">
          <div>PP</div>

          <span>
            PrepPulse
          </span>
        </div>

        <button
          onClick={() =>
            navigate("/courses")
          }
        >
          Learning Hub
        </button>

      </header>

      <main className="verification-main">

        <div className="verification-label">
          <span />
          DIGITAL CREDENTIAL VERIFICATION
        </div>

        <h1>
          Certificate
          <span> verified.</span>
        </h1>

        <p className="verification-intro">
          Verify the authenticity of a PrepPulse
          learning certificate using its unique
          certificate ID.
        </p>

        {loading && (
          <div className="verification-card loading-card">

            <div className="spinner" />

            <p>
              Checking certificate authenticity...
            </p>

          </div>
        )}

        {!loading && error && (
          <div className="verification-card invalid">

            <div className="status-icon">
              ×
            </div>

            <span>
              VERIFICATION FAILED
            </span>

            <h2>
              Certificate not found
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                navigate("/courses")
              }
            >
              Return to PrepPulse
            </button>

          </div>
        )}

        {!loading &&
          !error &&
          certificate && (
            <div className="verification-card">

              <div className="verified-header">

                <div className="status-icon verified">
                  ✓
                </div>

                <div>
                  <span>
                    AUTHENTIC CERTIFICATE
                  </span>

                  <h2>
                    Verified successfully
                  </h2>
                </div>

              </div>

              <div className="credential">

                <div>
                  <span>
                    RECIPIENT
                  </span>

                  <strong>
                    {certificate.studentName}
                  </strong>
                </div>

                <div>
                  <span>
                    COURSE
                  </span>

                  <strong>
                    {certificate.courseName}
                  </strong>
                </div>

                <div>
                  <span>
                    FINAL SCORE
                  </span>

                  <strong>
                    {certificate.score}%
                  </strong>
                </div>

                <div>
                  <span>
                    CERTIFICATE ID
                  </span>

                  <strong>
                    {certificate.certificateId}
                  </strong>
                </div>

                <div>
                  <span>
                    ISSUED
                  </span>

                  <strong>
                    {certificate.issuedAt
                      ? new Date(
                          certificate.issuedAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </strong>
                </div>

              </div>

              <div className="verification-footer">

                <div>
                  <span>
                    STATUS
                  </span>

                  <strong>
                    ✓ Valid & Authentic
                  </strong>
                </div>

                <div>
                  <span>
                    ISSUER
                  </span>

                  <strong>
                    PrepPulse Learning
                  </strong>
                </div>

              </div>

            </div>
          )}

        <div className="verification-note">

          <span>
            🔐
          </span>

          <p>
            This credential can be independently
            verified using the unique certificate
            ID displayed on the certificate.
          </p>

        </div>

      </main>
    </div>
  );
};

const styles = `
* {
  box-sizing: border-box;
}

.verification-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%,rgba(16,185,129,.08),transparent 30%),
    #020617;
  color: #f8fafc;
}

.verification-glow {
  position: fixed;
  width: 500px;
  height: 500px;
  top: -300px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: #6366f1;
  filter: blur(150px);
  opacity: .12;
}

.verification-header {
  position: relative;
  z-index: 2;
  width: min(1100px,92%);
  height: 80px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.verification-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.verification-brand div {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: linear-gradient(135deg,#6366f1,#7c3aed);
  font-size: 9px;
  font-weight: 900;
}

.verification-brand span {
  font-size: 12px;
  font-weight: 700;
}

.verification-header button {
  padding: 9px 13px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 9px;
}

.verification-main {
  position: relative;
  z-index: 2;
  width: min(700px,90%);
  margin: auto;
  padding: 85px 0;
}

.verification-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #818cf8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
}

.verification-label span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 10px #818cf8;
}

.verification-main > h1 {
  margin: 18px 0 10px;
  font-size: 48px;
  letter-spacing: -2px;
}

.verification-main > h1 span {
  color: #818cf8;
}

.verification-intro {
  max-width: 550px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.7;
}

.verification-card {
  margin-top: 40px;
  padding: 28px;
  border: 1px solid rgba(129,140,248,.15);
  border-radius: 17px;
  background: rgba(8,15,36,.75);
  box-shadow: 0 25px 70px rgba(0,0,0,.2);
}

.loading-card {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-card p {
  color: #475569;
  font-size: 9px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255,255,255,.08);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.verified-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.status-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(248,113,113,.1);
  color: #f87171;
  font-size: 25px;
}

.status-icon.verified {
  background: rgba(16,185,129,.1);
  color: #34d399;
}

.verified-header span,
.verification-card > span {
  color: #34d399;
  font-size: 7px;
  letter-spacing: 2px;
}

.verified-header h2 {
  margin: 7px 0 0;
  font-size: 17px;
}

.credential {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.credential > div {
  padding: 18px 5px;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.credential span,
.verification-footer span {
  display: block;
  color: #475569;
  font-size: 7px;
  letter-spacing: 1px;
}

.credential strong,
.verification-footer strong {
  display: block;
  margin-top: 6px;
  color: #cbd5e1;
  font-size: 10px;
  word-break: break-word;
}

.verification-footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 20px;
}

.verification-footer strong {
  color: #34d399;
}

.invalid {
  text-align: center;
}

.invalid .status-icon {
  margin: auto;
}

.invalid h2 {
  margin: 15px 0 5px;
}

.invalid p {
  color: #64748b;
  font-size: 9px;
}

.invalid button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  cursor: pointer;
  font-size: 9px;
}

.verification-note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 11px;
  background: rgba(255,255,255,.02);
}

.verification-note span {
  font-size: 16px;
}

.verification-note p {
  margin: 0;
  color: #475569;
  font-size: 8px;
  line-height: 1.6;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media(max-width:600px) {
  .verification-main {
    padding-top: 60px;
  }

  .verification-main > h1 {
    font-size: 38px;
  }

  .credential {
    grid-template-columns: 1fr;
  }

  .verification-footer {
    flex-direction: column;
  }
}
`;

export default CertificateVerification;