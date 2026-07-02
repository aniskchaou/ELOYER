const ENT = (process.env.VUE_APP_API_BASE_URL || '/api') + '/enterprise';

async function r(path, opts = {}) {
  const res = await fetch(`${ENT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error((payload && payload.error) || `Request failed (${res.status})`);
  return payload;
}

export const entGetDashboard     = ()          => r('/dashboard');
export const entGetWebhooks      = ()          => r('/webhooks');
export const entCreateWebhook    = (b)         => r('/webhooks', { method: 'POST', body: JSON.stringify(b) });
export const entUpdateWebhook    = (id, b)     => r(`/webhooks/${id}`, { method: 'PATCH', body: JSON.stringify(b) });
export const entDeleteWebhook    = (id)        => r(`/webhooks/${id}`, { method: 'DELETE' });
export const entTestWebhook      = (id)        => r(`/webhooks/${id}/test`, { method: 'POST' });
export const entGetDeliveries    = (id)        => r(`/webhooks/${id}/deliveries`);
export const entGetAutomation    = ()          => r('/automation');
export const entCreateAutomation = (b)         => r('/automation', { method: 'POST', body: JSON.stringify(b) });
export const entUpdateAutomation = (id, b)     => r(`/automation/${id}`, { method: 'PATCH', body: JSON.stringify(b) });
export const entDeleteAutomation = (id)        => r(`/automation/${id}`, { method: 'DELETE' });
export const entGetRetention     = ()          => r('/retention');
export const entCreateRetention  = (b)         => r('/retention', { method: 'POST', body: JSON.stringify(b) });
export const entUpdateRetention  = (id, b)     => r(`/retention/${id}`, { method: 'PATCH', body: JSON.stringify(b) });
export const entGetExports       = ()          => r('/data-exports');
export const entCreateExport     = (b)         => r('/data-exports', { method: 'POST', body: JSON.stringify(b) });
export const entGetCRM           = ()          => r('/crm');
export const entCreateCRM        = (b)         => r('/crm', { method: 'POST', body: JSON.stringify(b) });
export const entToggleCRM        = (id)        => r(`/crm/${id}/toggle`, { method: 'PATCH' });
export const entSyncCRM          = (id)        => r(`/crm/${id}/sync`, { method: 'POST' });
export const entGetDomains       = ()          => r('/domains');
export const entAddDomain        = (b)         => r('/domains', { method: 'POST', body: JSON.stringify(b) });
export const entVerifyDomain     = (id)        => r(`/domains/${id}/verify`, { method: 'POST' });
export const entDeleteDomain     = (id)        => r(`/domains/${id}`, { method: 'DELETE' });
export const entGetSSO           = ()          => r('/sso');
export const entSaveSSO          = (b)         => r('/sso', { method: 'POST', body: JSON.stringify(b) });
export const entToggleSSO        = ()          => r('/sso/toggle', { method: 'PATCH' });
export const entGetBI            = ()          => r('/bi');
export const entGetBIReports     = ()          => r('/bi/reports');
export const entCreateBIReport   = (b)         => r('/bi/reports', { method: 'POST', body: JSON.stringify(b) });
export const entGetDR            = ()          => r('/disaster-recovery');
export const entTriggerBackup    = ()          => r('/disaster-recovery/backup', { method: 'POST' });
export const entGetAuditLogs     = (p)         => r(`/audit-logs?${new URLSearchParams(p || {})}`);
export const entGetCompliance    = ()          => r('/compliance');
