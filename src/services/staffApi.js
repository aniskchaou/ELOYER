const API_BASE = (process.env.VUE_APP_API_BASE_URL || '/api') + '/staff';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const isJson = response.headers.get('content-type') && response.headers.get('content-type').includes('application/json');
  const payload = isJson ? await response.json() : null;
  if (!response.ok) throw new Error((payload && payload.error) || `Request failed (${response.status})`);
  return payload;
}

// Appointments
export const stGetAppointments    = (userId)   => request(`/appointments${userId ? `?user_id=${userId}` : ''}`);
export const stCreateAppointment  = (body)     => request('/appointments', { method: 'POST', body: JSON.stringify(body) });
export const stUpdateAppointment  = (id, body) => request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const stDeleteAppointment  = (id)       => request(`/appointments/${id}`, { method: 'DELETE' });

// Visitors
export const stGetVisitors        = (date)     => request(`/visitors${date ? `?date=${date}` : ''}`);
export const stCheckIn            = (body)     => request('/visitors', { method: 'POST', body: JSON.stringify(body) });
export const stCheckOut           = (id)       => request(`/visitors/${id}/checkout`, { method: 'PATCH' });

// Intake Forms
export const stGetIntakeForms     = ()         => request('/intake-forms');
export const stSubmitIntakeForm   = (body)     => request('/intake-forms', { method: 'POST', body: JSON.stringify(body) });

// Queue
export const stGetQueue           = ()         => request('/queue');
export const stAddToQueue         = (body)     => request('/queue', { method: 'POST', body: JSON.stringify(body) });
export const stCallQueue          = (id)       => request(`/queue/${id}/call`, { method: 'PATCH' });
export const stServeQueue         = (id)       => request(`/queue/${id}/serve`, { method: 'PATCH' });

// Filing Checklists
export const stGetChecklists      = (caseId)   => request(`/checklists${caseId ? `?case_id=${caseId}` : ''}`);
export const stCreateChecklist    = (body)     => request('/checklists', { method: 'POST', body: JSON.stringify(body) });
export const stUpdateChecklistItem = (id, body) => request(`/checklists/items/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

// Email Templates
export const stGetEmailTemplates  = ()         => request('/email-templates');
export const stCreateEmailTemplate = (body)    => request('/email-templates', { method: 'POST', body: JSON.stringify(body) });
export const stUpdateEmailTemplate = (id, body) => request(`/email-templates/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const stDeleteEmailTemplate = (id)      => request(`/email-templates/${id}`, { method: 'DELETE' });

// SMS Reminders
export const stGetSmsReminders    = (status)   => request(`/sms-reminders${status ? `?status=${status}` : ''}`);
export const stCreateSmsReminder  = (body)     => request('/sms-reminders', { method: 'POST', body: JSON.stringify(body) });
export const stCancelSmsReminder  = (id)       => request(`/sms-reminders/${id}/cancel`, { method: 'PATCH' });

// Contacts
export const stGetContacts        = (search)   => request(`/contacts${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const stCreateContact      = (body)     => request('/contacts', { method: 'POST', body: JSON.stringify(body) });
export const stUpdateContact      = (id, body) => request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const stDeleteContact      = (id)       => request(`/contacts/${id}`, { method: 'DELETE' });

// Research Notes
export const stGetResearchNotes   = (userId)   => request(`/research-notes${userId ? `?user_id=${userId}` : ''}`);
export const stCreateResearchNote = (body)     => request('/research-notes', { method: 'POST', body: JSON.stringify(body) });
export const stUpdateResearchNote = (id, body) => request(`/research-notes/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

// Finance
export const stGetTrustAccounts   = ()         => request('/trust-accounts');
export const stAddTrustTransaction = (body)    => request('/trust-transactions', { method: 'POST', body: JSON.stringify(body) });
export const stGetPayroll         = ()         => request('/payroll');
export const stCreatePayroll      = (body)     => request('/payroll', { method: 'POST', body: JSON.stringify(body) });
export const stPayPayroll         = (id)       => request(`/payroll/${id}/pay`, { method: 'PATCH' });
export const stGetFinanceSummary  = ()         => request('/finance-summary');
