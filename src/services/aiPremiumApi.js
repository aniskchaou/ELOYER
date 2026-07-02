const AI_BASE = (process.env.VUE_APP_API_BASE_URL || '/api') + '/ai';

async function aiPost(path, body) {
  const res = await fetch(`${AI_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `AI request failed (${res.status})`);
  return payload;
}

export const aiLegalResearch       = (b) => aiPost('/legal-research', b);
export const aiContractGeneration  = (b) => aiPost('/contract-generation', b);
export const aiClauseSuggestions   = (b) => aiPost('/clause-suggestions', b);
export const aiDocumentSummary     = (b) => aiPost('/document-summary', b);
export const aiCitationGeneration  = (b) => aiPost('/citation-generation', b);
export const aiHearingPrep         = (b) => aiPost('/hearing-preparation', b);
export const aiDepositionPrep      = (b) => aiPost('/deposition-preparation', b);
export const aiEvidenceSummary     = (b) => aiPost('/evidence-summary', b);
export const aiTranscription       = (b) => aiPost('/transcription', b);
export const aiTranslation         = (b) => aiPost('/translation', b);
export const aiClientIntake        = (b) => aiPost('/client-intake', b);
export const aiRiskAnalysis        = (b) => aiPost('/risk-analysis', b);
export const aiInvoiceGeneration   = (b) => aiPost('/invoice-generation', b);
export const aiEmailDraft          = (b) => aiPost('/email-draft', b);
export const aiTaskRecommendations = (b) => aiPost('/task-recommendations', b);
export const aiDeadlinePrediction  = (b) => aiPost('/deadline-prediction', b);
export const aiConflictDetection   = (b) => aiPost('/conflict-detection', b);
export const aiLitigationStrategy  = (b) => aiPost('/litigation-strategy', b);
export const aiDocumentComparison  = (b) => aiPost('/document-comparison', b);
export const aiKnowledgeSearch     = (b) => aiPost('/knowledge-search', b);
export const aiUsage               = () => fetch(`${AI_BASE}/usage`).then(r => r.json());
