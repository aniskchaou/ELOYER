const API_BASE = process.env.VUE_APP_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get('content-type') && response.headers.get('content-type').includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = payload && payload.error ? payload.error : `Request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  return payload;
}

export function getLawyerDashboard(lawyerId) {
  return request(`/lawyer/dashboard/${lawyerId}`);
}

export function getLawyerTemplates() {
  return request('/lawyer/templates');
}

export function getNavigationData() {
  return request('/navigation');
}

export function listLawyerCases(lawyerId) {
  return request(`/cases?lawyerId=${encodeURIComponent(lawyerId)}`);
}

export function listClients() {
  return request('/lawyer/clients');
}

export function createCase(payload) {
  return request('/cases', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCaseWorkspace(caseId) {
  return request(`/cases/${caseId}`);
}

export function updateCaseStatus(caseId, status) {
  return request(`/cases/${caseId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function addCaseNote(caseId, payload) {
  return request(`/cases/${caseId}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function addCaseEvidence(caseId, payload) {
  return request(`/cases/${caseId}/evidence`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function addCaseEvent(caseId, payload) {
  return request(`/cases/${caseId}/events`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function addCaseDocument(caseId, payload) {
  return request(`/cases/${caseId}/documents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createDocumentFromTemplate(caseId, payload) {
  return request(`/cases/${caseId}/documents/from-template`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveDocumentVersion(caseId, documentId, payload) {
  return request(`/cases/${caseId}/documents/${documentId}/versions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function compareDocumentVersions(caseId, documentId, fromVersion, toVersion) {
  return request(
    `/cases/${caseId}/documents/${documentId}/compare?from=${encodeURIComponent(fromVersion)}&to=${encodeURIComponent(toVersion)}`
  );
}

export function sendDocumentForESign(caseId, documentId, payload) {
  return request(`/cases/${caseId}/documents/${documentId}/esign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function summarizeDocument(caseId, payload) {
  return request(`/cases/${caseId}/documents/ai-summarize`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function addCaseHearing(caseId, payload) {
  return request(`/cases/${caseId}/hearings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function syncHearingCalendar(caseId, hearingId) {
  return request(`/cases/${caseId}/hearings/${hearingId}/sync-calendar`, {
    method: 'POST',
  });
}

export function getDeadlineAlerts(caseId) {
  return request(`/cases/${caseId}/deadline-alerts`);
}

export function addCourtDecision(caseId, payload) {
  return request(`/cases/${caseId}/court-decisions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logCaseTime(caseId, payload) {
  return request(`/cases/${caseId}/log-time`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function startCaseTimer(caseId, payload) {
  return request(`/cases/${caseId}/timer/start`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function stopCaseTimer(caseId, payload) {
  return request(`/cases/${caseId}/timer/stop`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getTimeSuggestions(caseId) {
  return request(`/cases/${caseId}/time-suggestions`);
}

export function addCaseTask(caseId, payload) {
  return request(`/cases/${caseId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTaskProgress(taskId, payload) {
  return request(`/tasks/${taskId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function scheduleCaseMeeting(caseId, payload) {
  return request(`/cases/${caseId}/meetings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function sendCaseMessage(caseId, payload) {
  return request(`/cases/${caseId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function requestClientDocuments(caseId, payload) {
  return request(`/cases/${caseId}/request-documents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function shareCaseUpdate(caseId, payload) {
  return request(`/cases/${caseId}/share-update`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createInvoiceFromTime(caseId, payload) {
  return request(`/cases/${caseId}/invoices/from-time`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function sendInvoice(invoiceId) {
  return request(`/invoices/${invoiceId}/send`, {
    method: 'POST',
  });
}

export function registerInvoicePayment(invoiceId, payload) {
  return request(`/invoices/${invoiceId}/payment`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function sendPaymentReminder(invoiceId) {
  return request(`/invoices/${invoiceId}/remind`, {
    method: 'POST',
  });
}

export function addRetainer(caseId, payload) {
  return request(`/cases/${caseId}/retainers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function searchCaseLaw(query) {
  return request(`/research/search?q=${encodeURIComponent(query)}`);
}

export function attachResearch(caseId, payload) {
  return request(`/cases/${caseId}/research`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getResearchAiSuggestions(caseId) {
  return request(`/cases/${caseId}/research-ai-suggestions`);
}

export function getLawyerPerformance(lawyerId) {
  return request(`/lawyer/performance/${lawyerId}`);
}

export function getCaseAiSuggestions(caseId) {
  return request(`/cases/${caseId}/ai-suggestions`);
}

export function getCaseAiAdvanced(caseId) {
  return request(`/cases/${caseId}/ai-advanced`);
}
