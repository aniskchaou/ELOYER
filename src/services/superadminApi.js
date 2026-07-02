const API_BASE = (process.env.VUE_APP_API_BASE_URL || '/api') + '/superadmin';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const isJson = response.headers.get('content-type') && response.headers.get('content-type').includes('application/json');
  const payload = isJson ? await response.json() : null;
  if (!response.ok) {
    throw new Error((payload && payload.error) || `Request failed (${response.status})`);
  }
  return payload;
}

export const saGetAnalytics       = ()          => request('/analytics');
export const saGetHealth          = ()          => request('/health');

export const saGetTenants         = ()          => request('/tenants');
export const saGetTenant          = (id)        => request(`/tenants/${id}`);
export const saCreateTenant       = (body)      => request('/tenants', { method: 'POST', body: JSON.stringify(body) });
export const saUpdateTenant       = (id, body)  => request(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const saSuspendTenant      = (id)        => request(`/tenants/${id}/suspend`, { method: 'POST' });
export const saActivateTenant     = (id)        => request(`/tenants/${id}/activate`, { method: 'POST' });
export const saDeleteTenant       = (id)        => request(`/tenants/${id}`, { method: 'DELETE' });

export const saGetPlans           = ()          => request('/plans');
export const saCreatePlan         = (body)      => request('/plans', { method: 'POST', body: JSON.stringify(body) });
export const saUpdatePlan         = (id, body)  => request(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const saGetFeatureFlags    = ()          => request('/feature-flags');
export const saUpdateFeatureFlag  = (key, body) => request(`/feature-flags/${key}`, { method: 'PATCH', body: JSON.stringify(body) });

export const saGetAuditLogs       = (params)    => request(`/audit-logs?${new URLSearchParams(params || {})}`);

export const saGetSettings        = ()          => request('/settings');
export const saUpdateSettings     = (body)      => request('/settings', { method: 'PATCH', body: JSON.stringify(body) });

export const saGetApiKeys         = (tenantId)  => request(`/api-keys${tenantId ? `?tenant_id=${tenantId}` : ''}`);
export const saCreateApiKey       = (body)      => request('/api-keys', { method: 'POST', body: JSON.stringify(body) });
export const saRevokeApiKey       = (id)        => request(`/api-keys/${id}`, { method: 'DELETE' });

export const saGetUsers           = ()          => request('/users');
export const saImpersonate        = (body)      => request('/impersonate', { method: 'POST', body: JSON.stringify(body) });

export const saGetEmailSms        = ()          => request('/email-sms');
export const saUpdateEmailSms     = (id, body)  => request(`/email-sms/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const saCreateEmailSms     = (body)      => request('/email-sms', { method: 'POST', body: JSON.stringify(body) });

export const saGetStorage         = ()          => request('/storage');
export const saUpdateStorage      = (body)      => request('/storage', { method: 'PATCH', body: JSON.stringify(body) });

export const saGetAiUsage         = ()          => request('/ai-usage');
export const saGetBilling         = ()          => request('/billing');
export const saGetSecurity        = ()          => request('/security');
