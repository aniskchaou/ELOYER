const HR_BASE = (process.env.VUE_APP_API_BASE_URL || '/api') + '/hr';

async function hrReq(path, options = {}) {
  const res = await fetch(`${HR_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error((payload && payload.error) || `Request failed (${res.status})`);
  return payload;
}

export const hrGetDashboard         = ()          => hrReq('/dashboard');
export const hrGetEmployees         = ()          => hrReq('/employees');
export const hrUpsertEmployee       = (body)      => hrReq('/employees', { method: 'POST', body: JSON.stringify(body) });
export const hrGetLeave             = (status)    => hrReq(`/leave${status ? `?status=${status}` : ''}`);
export const hrCreateLeave          = (body)      => hrReq('/leave', { method: 'POST', body: JSON.stringify(body) });
export const hrReviewLeave          = (id, body)  => hrReq(`/leave/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) });
export const hrGetAttendance        = (date)      => hrReq(`/attendance${date ? `?date=${date}` : ''}`);
export const hrCheckIn              = (body)      => hrReq('/attendance/checkin', { method: 'POST', body: JSON.stringify(body) });
export const hrCheckOut             = (body)      => hrReq('/attendance/checkout', { method: 'POST', body: JSON.stringify(body) });
export const hrGetRecruitment       = ()          => hrReq('/recruitment');
export const hrCreatePosting        = (body)      => hrReq('/recruitment/postings', { method: 'POST', body: JSON.stringify(body) });
export const hrUpdatePosting        = (id, body)  => hrReq(`/recruitment/postings/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const hrCreateApplication    = (body)      => hrReq('/recruitment/applications', { method: 'POST', body: JSON.stringify(body) });
export const hrUpdateApplication    = (id, body)  => hrReq(`/recruitment/applications/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const hrGetPerformance       = ()          => hrReq('/performance');
export const hrCreatePerformance    = (body)      => hrReq('/performance', { method: 'POST', body: JSON.stringify(body) });
