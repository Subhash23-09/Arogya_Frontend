import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL } from "../config.js";

function WellnessPage({ userId, onLogout }) {
  const [symptoms, setSymptoms] = useState("");
  const [report, setReport] = useState("");
  const [status, setStatus] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState("");
  const [tableMarkdown, setTableMarkdown] = useState("");

  const [followUp, setFollowUp] = useState("");
  const [followUpStatus, setFollowUpStatus] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  const [showAgents, setShowAgents] = useState(false);
  const [symptomAnalysis, setSymptomAnalysis] = useState("");
  const [lifestyleNotes, setLifestyleNotes] = useState("");
  const [dietNotes, setDietNotes] = useState("");
  const [fitnessNotes, setFitnessNotes] = useState("");

  const [showTable, setShowTable] = useState(false);

  const [historyItems, setHistoryItems] = useState([]);
  const [historyStatus, setHistoryStatus] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setStatus("Please enter symptoms.");
      return;
    }
    setStatus("Processing your request...");
    setRecommendations([]);
    setSummary("");
    setTableMarkdown("");
    setFollowUp("");
    setFollowUpAnswer("");
    setFollowUpStatus("");
    setShowAgents(false);
    setSymptomAnalysis("");
    setLifestyleNotes("");
    setDietNotes("");
    setFitnessNotes("");
    setShowTable(false);

    try {
      const res = await axios.post(`${API_BASE_URL}/health-assist`, {
        symptoms,
        medical_report: report,
        user_id: userId,
      });

      const data = res.data;

      setSymptomAnalysis(data.symptom_analysis || "");
      setLifestyleNotes(data.lifestyle || "");
      setDietNotes(data.diet || "");
      setFitnessNotes(data.fitness || "");

      setRecommendations(data.recommendations || []);
      setSummary(data.synthesized_guidance || data.final_summary || "");
      setTableMarkdown(data.table_markdown || "");

      setStatus("Guidance generated.");
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUp.trim()) {
      setFollowUpStatus("Please enter a follow-up question.");
      return;
    }
    setFollowUpStatus("Thinking...");
    setFollowUpAnswer("");

    try {
      const res = await axios.post(`${API_BASE_URL}/follow-up`, {
        user_id: userId,
        question: followUp,
      });
      setFollowUpAnswer(res.data.answer || "");
      setFollowUpStatus("Answer generated.");
    } catch (err) {
      setFollowUpStatus(
        `Error: ${err.response?.data?.error || err.message}`
      );
    }
  };

  const handleLoadHistory = async () => {
    setHistoryStatus("Loading history...");
    setShowHistory(false);
    setHistoryItems([]);

    try {
      const res = await axios.get(`${API_BASE_URL}/history/${userId}`);
      const data = res.data;
      const list = data.history || [];
      setHistoryItems(list);
      setShowHistory(true);
      setHistoryStatus(list.length === 0 ? "No past sessions found." : "");
    } catch (err) {
      setHistoryStatus(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="page">
      <header className="top-bar">
        <div>
          <h2>Arogya Wellness Assistant</h2>
          <p className="subtitle">
            Logged in as <strong>{userId}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="secondary-btn" onClick={handleLoadHistory}>
            View History
          </button>
          <button className="secondary-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="layout">
        <div className="card">
          <h3>Your Current Health Concern</h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Symptoms</label>
              <textarea
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe what you are feeling... e.g. mild chest pain after climbing stairs"
              />
            </div>
            <div className="field">
              <label>Medical Report (optional)</label>
              <textarea
                rows={4}
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="Paste any lab report or doctor's note to give more context."
              />
            </div>
            {status && <p className="status-text">{status}</p>}
            <button type="submit" className="primary-btn">
              Generate Guidance
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Your Personalized Guidance</h3>

          {recommendations.length > 0 && (
            <div className="block">
              <h4>Key Recommendations</h4>
              <ul>
                {recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {summary && (
            <div className="block">
              <h4>Detailed Summary</h4>
              <div className="summary-pre">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          )}

          {tableMarkdown && (
            <div className="block">
              <button
                type="button"
                className="link-toggle"
                onClick={() => setShowTable(!showTable)}
              >
                {showTable
                  ? "▼ Hide agent‑to‑agent communication details"
                  : "▶ See agent‑to‑agent communication details"}
              </button>

              {showTable && (
                <div className="table-markdown" style={{ marginTop: "0.5rem" }}>
                  <ReactMarkdown>{tableMarkdown}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {!summary && recommendations.length === 0 && !tableMarkdown && (
            <p className="subtitle">
              Submit your symptoms to see a tailored wellness plan here.
            </p>
          )}

          {showAgents && (
            <div className="block">
              <h4>Agent Communication</h4>

              <div className="block">
                <h5>Symptom Agent</h5>
                <div className="summary-pre">
                  <ReactMarkdown>{symptomAnalysis}</ReactMarkdown>
                </div>
              </div>

              <div className="block">
                <h5>Lifestyle Agent</h5>
                <div className="summary-pre">
                  <ReactMarkdown>{lifestyleNotes}</ReactMarkdown>
                </div>
              </div>

              <div className="block">
                <h5>Diet Agent</h5>
                <div className="summary-pre">
                  <ReactMarkdown>{dietNotes}</ReactMarkdown>
                </div>
              </div>

              <div className="block">
                <h5>Fitness Agent</h5>
                <div className="summary-pre">
                  <ReactMarkdown>{fitnessNotes}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>Your Previous Sessions</h3>
          {historyStatus && <p className="status-text">{historyStatus}</p>}
          {historyItems.length > 0 && (
            <div className="block">
              <ul>
                {historyItems.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: "0.75rem" }}>
                    <strong>Query:</strong> {item.query}
                    {item.synthesized_guidance && (
                      <div
                        className="summary-pre"
                        style={{ marginTop: "0.25rem" }}
                      >
                        <ReactMarkdown>
                          {item.synthesized_guidance.length > 400
                            ? item.synthesized_guidance.slice(0, 400) + "…"
                            : item.synthesized_guidance}
                        </ReactMarkdown>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(summary || recommendations.length > 0) && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>Ask a Follow‑Up Question</h3>
          <form onSubmit={handleFollowUp}>
            <div className="field">
              <label>Your question about this plan</label>
              <textarea
                rows={3}
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="e.g. Can I go to work tomorrow if my cough is mild?"
              />
            </div>
            {followUpStatus && (
              <p className="status-text">{followUpStatus}</p>
            )}
            <button type="submit" className="primary-btn">
              Ask
            </button>
          </form>

          {followUpAnswer && (
            <div className="block" style={{ marginTop: "0.75rem" }}>
              <h4>Follow‑Up Answer</h4>
              <div className="summary-pre">
                <ReactMarkdown>{followUpAnswer}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WellnessPage;
