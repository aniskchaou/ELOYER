const express = require('express');
const pool = require('../db');
const router = express.Router();

function toInt(v, fb = null) { const n = parseInt(v, 10); return isNaN(n) ? fb : n; }

// ── Generic AI engine (simulated responses) ───────────────────────────────────
function aiResponse(type, input) {
  const responses = {
    legal_research: `**AI Legal Research Results**\n\nQuery: "${input.query}"\n\n**Relevant Statutes:**\n• Code des Obligations et Contrats (COC) – Art. 275: Liability for breach of contractual obligations.\n• Code du Travail – Art. 14: Provisions governing employee termination and notice periods.\n• Loi n° 2016-61: Data protection provisions applicable to legal entities.\n\n**Key Precedents:**\n1. CA Tunis 2021-0887 – Courts upheld strict liability for failure to deliver contracted goods.\n2. TPI Sousse 2020-1134 – Reaffirmed burden of proof standards in commercial disputes.\n3. Cour de Cassation 2019-442 – Landmark ruling on adverse possession requirements.\n\n**Summary:** Based on the query, the strongest legal basis lies under COC Art. 275 with supporting precedent from CA Tunis 2021-0887. Recommend filing within 3-year prescription window.`,

    contract_generation: `**AI-Generated Contract Draft**\n\n# ${input.contract_type || 'SERVICE AGREEMENT'}\n\nBetween: **${input.party_a || '[PARTY A]'}** ("Provider")\nAnd: **${input.party_b || '[PARTY B]'}** ("Client")\n\n## Article 1 – Object\n${input.description || 'The Provider agrees to deliver the services described herein to the Client under the terms and conditions set forth in this Agreement.'}\n\n## Article 2 – Duration\nThis Agreement takes effect upon signature for a period of ${input.duration || '12 (twelve) months'}, renewable by mutual written consent.\n\n## Article 3 – Remuneration\nThe Client agrees to pay the Provider **${input.amount || '[AMOUNT]'} TND** in accordance with the payment schedule in Annex A.\n\n## Article 4 – Confidentiality\nEach party undertakes to maintain strict confidentiality regarding all information exchanged under this Agreement.\n\n## Article 5 – Governing Law\nThis Agreement shall be governed by Tunisian law. Any dispute shall be submitted to the competent courts of Tunis.\n\n_Signed in Tunis, on [DATE]_\n\n**[PARTY A]** _______________      **[PARTY B]** _______________`,

    clause_suggestions: [
      { title: 'Force Majeure', text: 'Neither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control, including natural disasters, strikes, or government actions.', risk: 'low' },
      { title: 'Limitation of Liability', text: 'In no event shall either party be liable for indirect, incidental, special, or consequential damages, even if advised of the possibility of such damages.', risk: 'medium' },
      { title: 'Dispute Resolution', text: 'Any dispute arising from or in connection with this Agreement shall first be subject to mediation. If unresolved within 30 days, the parties may submit to arbitration under IORT rules.', risk: 'low' },
      { title: 'Intellectual Property', text: 'All work product created by the Provider under this Agreement shall be the exclusive property of the Client upon full payment of fees.', risk: 'high' },
      { title: 'Non-Solicitation', text: 'During the term and for 24 months thereafter, neither party shall solicit or hire the other party\'s employees or key contractors.', risk: 'medium' },
    ],

    document_summary: `**AI Document Summary**\n\n**Document:** ${input.title || 'Legal Document'}\n**Type:** ${input.doc_type || 'Contract'}\n**Length:** ${Math.floor(Math.random() * 20) + 5} pages\n\n**Key Points:**\n1. Agreement establishes a service relationship between the parties for a defined period.\n2. Payment terms require monthly invoicing with 30-day net payment.\n3. Confidentiality obligations survive termination for 5 years.\n4. Governing law is Tunisian; disputes resolved in Tunis courts.\n\n**Risks Identified:**\n⚠️ No force majeure clause — recommend adding.\n⚠️ IP ownership clause is ambiguous — clarification needed.\n✅ Termination notice period (30 days) is standard.\n\n**Recommended Actions:**\n• Request clarification on IP ownership in Article 7.\n• Add a force majeure clause before signing.\n• Ensure notarisation if property rights are involved.`,

    citation_generation: `**AI Legal Citations**\n\nContext: "${input.context}"\n\n**Primary Citations:**\n1. Code des Obligations et Contrats, Art. 275 (COC-275): *Responsabilité contractuelle – obligation de résultat*\n2. Tribunal de Première Instance de Tunis, Jugement n° 2022-1087, 15 mars 2022\n3. Cour d'Appel de Tunis, Arrêt n° CA-2021-0334, 28 juin 2021\n\n**Secondary Citations:**\n4. Ben Mrad, R. (2020). *Droit des Obligations en Tunisie*, 3e édition, LGDJ Tunisie, p. 142-156.\n5. Journal Officiel de la République Tunisienne, 2016-61, Art. 12.\n\n**Citation Format (Bluebook):**\n> Code des Obligations et Contrats art. 275 (Tunis. 1906) (amended 2021).\n> CA Tunis, 28 juin 2021, n° CA-2021-0334.`,

    hearing_preparation: `**AI Hearing Preparation Brief**\n\n**Case:** ${input.case_title || 'Current Case'}\n**Hearing Date:** ${input.hearing_date || 'Scheduled'}\n**Court:** ${input.court || 'Tribunal de Première Instance'}\n\n**Opening Statement (Suggested):**\n"Your Honour, Counsel. This case concerns [key issue]. The evidence will show that our client [core argument]. We respectfully ask the Court to [relief sought]."\n\n**Key Arguments:**\n1. **Primary Argument:** Establish breach of contractual obligation under COC Art. 275.\n2. **Supporting Argument:** Present documentary evidence showing non-performance.\n3. **Rebuttal:** Anticipate opposing counsel's force majeure defence — counter with evidence of prior notice.\n\n**Evidence Checklist:**\n☐ Original signed contract\n☐ Correspondence chain (emails/letters)\n☐ Expert report (if applicable)\n☐ Witness statements\n☐ Financial records showing damages\n\n**Likely Questions from Judge:**\n• "What is the precise value of the claimed damages?"\n• "Was there any attempt at amicable settlement?"\n• "What notice was given before initiating proceedings?"`,

    deposition_prep: `**AI Deposition Preparation**\n\n**Witness:** ${input.witness_name || 'Witness'}\n**Role:** ${input.witness_role || 'Fact Witness'}\n\n**Suggested Questions (Direct Examination):**\n1. Please state your name, title, and length of service with the company.\n2. Were you present when the contract was signed on [date]?\n3. In your own words, describe your understanding of the delivery obligation.\n4. Did you raise any concerns about the timeline before the deadline passed?\n5. Please describe what actions were taken after the missed deadline.\n\n**Cross-Examination Preparation (Anticipated Attacks):**\n• Q: "Did you personally verify the delivery schedule?" → A: "I relied on written confirmations from the supplier."\n• Q: "Is it possible there was a miscommunication?" → A: "No, the contract terms were explicitly set out in writing."\n\n**Coaching Notes:**\n✅ Answer only what is asked — do not volunteer extra information.\n✅ Request clarification if a question is unclear.\n✅ Refer to documents rather than relying on memory.\n✅ Remain calm and composed — do not argue with opposing counsel.`,

    evidence_summary: `**AI Evidence Summary**\n\n**Case:** ${input.case_title || 'Current Case'}\n**Evidence Items Analysed:** ${input.evidence_count || 3}\n\n**Documentary Evidence:**\n• Exhibit A – Original Contract (signed, 2024-11-01): Confirms delivery obligation and timeline.\n• Exhibit B – Email Chain (15 Nov – 3 Dec 2024): Shows buyer's repeated requests for delivery status.\n• Exhibit C – Invoice #2024-189: Confirms payment was made in full prior to deadline.\n\n**Physical Evidence:**\n• No physical evidence submitted.\n\n**Witness Evidence:**\n• W1 – Logistics Manager: Can testify to internal communications.\n• W2 – Finance Director: Can confirm payment records.\n\n**Evidence Strength Assessment:**\n🟢 Strong: Signed contract + full payment = clear breach.\n🟡 Moderate: Email chain shows awareness but timing is debatable.\n🔴 Weak: No delivery confirmation receipt obtained.\n\n**Recommendation:** Obtain shipping/warehouse records to strengthen the non-delivery proof.`,

    transcription: `**AI Meeting Transcription**\n\n**Meeting:** ${input.title || 'Client Meeting'}\n**Date:** ${new Date().toLocaleDateString()}\n**Duration:** ${input.duration || '45 minutes'}\n**Participants:** ${input.participants || 'Lawyer, Client'}\n\n---\n\n**[00:00]** Lawyer: Good morning. Thank you for coming in today. Let's start with a brief overview of where we stand.\n\n**[00:45]** Client: Thank you. I wanted to understand the latest on the hearing scheduled for next month.\n\n**[01:20]** Lawyer: We've filed the motion and the court has confirmed the date. Our main argument will focus on the delivery clause in the original contract.\n\n**[03:15]** Client: And what are our chances? I'm worried about the costs if this drags on.\n\n**[04:00]** Lawyer: Based on the evidence we have, I'm confident. The signed contract and payment confirmation are strong. We should have a decision within 60-90 days.\n\n**[05:30]** Client: Understood. What do I need to prepare?\n\n**[06:10]** Lawyer: Please gather all correspondence from November and December 2024, and the original delivery schedule document if you have it.\n\n**[07:45]** Client: I'll send those over by end of week.\n\n**[08:15]** Lawyer: Perfect. We'll meet again two weeks before the hearing to review.\n\n---\n\n**Action Items:**\n1. Client to provide correspondence (by Friday)\n2. Lawyer to review delivery schedule once received\n3. Follow-up meeting scheduled 2 weeks before hearing`,

    translation: `**AI Legal Translation**\n\n**Source Language:** ${input.from_lang || 'French'}\n**Target Language:** ${input.to_lang || 'English'}\n\n**Original Text:**\n${input.text || 'Le contrat prend effet à compter de la date de signature pour une durée d\'un an, renouvelable par accord mutuel des parties.'}\n\n**Translation:**\n${input.to_lang === 'Arabic' || input.to_lang === 'ar'
    ? 'يسري العقد اعتباراً من تاريخ التوقيع لمدة سنة واحدة، قابلة للتجديد باتفاق مشترك بين الطرفين.'
    : 'The contract takes effect from the date of signature for a period of one year, renewable by mutual agreement of the parties.'}\n\n**Legal Terminology Notes:**\n• "Accord mutuel" → "mutual agreement" (preferred over "common consent" in commercial contexts)\n• "Date de signature" → "date of signature/execution" (both acceptable)\n\n**Certification Note:** This is an AI-assisted translation. For official/court submissions, a certified human translator is required.`,

    client_intake: `**AI Client Intake Assessment**\n\n**Client:** ${input.client_name || 'New Client'}\n**Matter Type:** ${input.matter_type || 'Civil Dispute'}\n\n**Intake Summary:**\nBased on the information provided, this matter involves a ${input.matter_type || 'contractual dispute'} with an estimated claim value of ${input.claim_value || 'TBD'}.\n\n**Recommended Practice Area:** ${input.matter_type || 'Commercial Litigation'}\n**Suggested Lawyer:** Senior Associate with commercial dispute experience\n**Priority Level:** ${Math.random() > 0.5 ? 'High' : 'Normal'}\n\n**Initial Questions to Ask Client:**\n1. When did the issue first arise and what triggered the dispute?\n2. Have you made any attempts at settlement or mediation?\n3. Are there signed agreements or written commitments?\n4. What is the desired outcome — monetary compensation or specific performance?\n5. Are there any time constraints (upcoming deadlines, prescription periods)?\n\n**Risk Flags:**\n⚠️ Check prescription period — if matter is older than 3 years, urgency is critical.\n⚠️ Verify no conflict of interest with existing clients.\n✅ Proposed fee structure: Hourly rate or hybrid arrangement recommended.\n\n**Estimated Timeline:** 6-18 months depending on court schedule.`,

    risk_analysis: `**AI Legal Risk Analysis**\n\n**Document/Situation:** ${input.title || 'Contract Review'}\n**Risk Score:** ${Math.floor(Math.random() * 30) + 40}/100\n**Overall Risk Level:** ${Math.random() > 0.5 ? 'MEDIUM' : 'HIGH'}\n\n**Risk Breakdown:**\n\n| Risk Category | Level | Description |\n|---|---|---|\n| Contractual | HIGH | Missing force majeure and liability cap clauses |\n| Regulatory | MEDIUM | GDPR/data protection obligations not addressed |\n| Financial | MEDIUM | No payment penalty clauses for late payment |\n| Litigation | LOW | Dispute resolution mechanism is clearly defined |\n| Reputation | LOW | No non-disparagement clause |\n\n**Top 3 Risks:**\n1. **Unlimited Liability Exposure** — No cap on damages could expose client to disproportionate claims.\n2. **Data Protection Gap** — Processing of personal data without explicit consent clause.\n3. **IP Ownership Ambiguity** — Deliverables ownership is not explicitly assigned.\n\n**Mitigation Recommendations:**\n✅ Add liability limitation clause (cap at contract value).\n✅ Include GDPR-compliant data processing addendum.\n✅ Clarify IP assignment in Article 7.\n✅ Add force majeure clause covering epidemics, war, and regulatory changes.`,

    invoice_generation: `**AI-Generated Invoice**\n\n---\n**INVOICE**\n\n**From:** Cabinet Cherni & Associés\n12 Rue de la République, Tunis\nBAR-TN-2005-042\n\n**To:** ${input.client_name || 'Client Name'}\n${input.client_address || 'Client Address'}\n\n**Invoice #:** INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}\n**Date:** ${new Date().toLocaleDateString()}\n**Due Date:** ${new Date(Date.now() + 30*86400000).toLocaleDateString()}\n\n---\n\n| Description | Hours | Rate (TND) | Amount (TND) |\n|---|---|---|---|\n| Legal Consultation – ${input.matter || 'Case Review'} | ${input.hours || '3.0'} | 150 | ${(parseFloat(input.hours || 3) * 150).toFixed(2)} |\n| Document Drafting | ${input.draft_hours || '2.0'} | 100 | ${(parseFloat(input.draft_hours || 2) * 100).toFixed(2)} |\n| Court Filing Fees | – | – | 75.00 |\n\n---\n\n**Subtotal:** ${((parseFloat(input.hours||3)*150)+(parseFloat(input.draft_hours||2)*100)+75).toFixed(2)} TND\n**TVA (19%):** ${(((parseFloat(input.hours||3)*150)+(parseFloat(input.draft_hours||2)*100)+75)*0.19).toFixed(2)} TND\n**Total Due:** ${(((parseFloat(input.hours||3)*150)+(parseFloat(input.draft_hours||2)*100)+75)*1.19).toFixed(2)} TND\n\n**Payment:** Bank Transfer to BNA Account 01-234-5678\n**Reference:** INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,

    email_draft: `**AI Email Draft**\n\n**To:** ${input.recipient || '[Recipient]'}\n**Subject:** ${input.subject || 'Legal Matter Update'}\n\n---\n\nDear ${input.recipient_name || 'Counsel'},\n\nI trust this message finds you well.\n\nI write further to our recent correspondence regarding ${input.matter || 'the above-captioned matter'}.\n\n${input.body_context || 'We have reviewed the documents you submitted and would like to schedule a meeting to discuss the next steps. Please confirm your availability during the week of [DATE].'}\n\nKindly confirm receipt of this communication and your availability at your earliest convenience. Should you have any queries, please do not hesitate to contact our office.\n\nYours faithfully,\n\n**Ahmed Cherni**\nPartner — Cabinet Cherni & Associés\n12 Rue de la République, Tunis\nTel: +216 71 100 200\nemail: contact@cherni-law.tn`,

    task_recommendations: [
      { title: 'File preliminary motion', priority: 'high', due_days: 3, reason: 'Hearing deadline approaching in 10 days — motion must be filed 7 days prior.' },
      { title: 'Request evidence disclosure from opposing party', priority: 'high', due_days: 5, reason: 'Standard discovery practice; supports evidence preparation for hearing.' },
      { title: 'Schedule client briefing', priority: 'normal', due_days: 7, reason: 'Client has not been updated for 14 days — maintain communication protocol.' },
      { title: 'Review and update case strategy notes', priority: 'normal', due_days: 10, reason: 'New court ruling CA-2026-0112 may impact litigation approach.' },
      { title: 'Send invoice for Q2 services', priority: 'low', due_days: 14, reason: 'Outstanding billable hours from April–June not yet invoiced.' },
    ],

    deadline_prediction: [
      { event: 'Response to Counterclaim', predicted_date: new Date(Date.now() + 14*86400000).toLocaleDateString(), confidence: 92, basis: 'Standard 15-day response window under procedural rules.' },
      { event: 'Expert Report Submission', predicted_date: new Date(Date.now() + 28*86400000).toLocaleDateString(), confidence: 78, basis: 'Typical 30-day window; expert has requested extension based on evidence volume.' },
      { event: 'Hearing Date', predicted_date: new Date(Date.now() + 60*86400000).toLocaleDateString(), confidence: 85, basis: 'Court calendar patterns suggest 60-90 day scheduling window.' },
      { event: 'Judgment Expected', predicted_date: new Date(Date.now() + 120*86400000).toLocaleDateString(), confidence: 65, basis: 'Based on case complexity; simple matters average 90 days, complex 150+ days.' },
      { event: 'Appeal Window Closes', predicted_date: new Date(Date.now() + 150*86400000).toLocaleDateString(), confidence: 95, basis: '30-day appeal window from date of judgment under civil procedure rules.' },
    ],

    conflict_detection: `**AI Conflict-of-Interest Check**\n\n**New Client/Matter:** ${input.client_name || 'New Client'}\n**Matter Type:** ${input.matter_type || 'Commercial Dispute'}\n**Opposing Party:** ${input.opposing_party || 'Unknown'}\n\n**Screening Results:**\n\n${Math.random() > 0.7
    ? '🔴 **POTENTIAL CONFLICT DETECTED**\n\nThe opposing party "' + (input.opposing_party || 'Delta SARL') + '" appears in our client database:\n• Client ID: C-042 — Represented in "Supply Contract Dispute" (2023, closed)\n• Same principal shareholder as existing client "Société Gamma"\n\n**Required Action:** Partner review required before accepting this matter. Ethical wall may need to be established. Do NOT discuss case details until cleared.'
    : '🟢 **NO CONFLICT DETECTED**\n\nNo existing or former clients match the opposing party "' + (input.opposing_party || 'Unknown') + '".\n\n**Secondary Check:**\n✅ No family member connections found.\n✅ No shared directorship in corporate records.\n✅ No prior adverse representation.\n\n**Recommendation:** Matter may proceed. Document this clearance in the client file.'}\n\n**Cleared by:** AI Pre-screening\n**Date:** ${new Date().toLocaleString()}\n**Action Required:** Senior partner final sign-off.`,

    litigation_strategy: `**AI Litigation Strategy Analysis**\n\n**Case:** ${input.case_title || 'Current Case'}\n**Type:** ${input.case_type || 'Commercial'}\n**Stage:** ${input.stage || 'Pre-Trial'}\n\n**Strategic Options:**\n\n**Option 1 — Aggressive Litigation (Recommended)**\n• Approach: Full trial with expert witnesses and documentary evidence.\n• Strengths: Strong paper trail; signed contract and payment proof.\n• Weaknesses: Court delays; opposing party may have procedural defence.\n• Win Probability: **72%**\n• Estimated Cost: 8,000–15,000 TND\n• Timeline: 12-18 months\n\n**Option 2 — Early Settlement**\n• Approach: Propose mediation within 30 days; seek 70% of claimed amount.\n• Strengths: Fast resolution; avoids court costs; preserves relationship.\n• Win Probability: **85%** (of recovering partial amount)\n• Estimated Cost: 2,000–4,000 TND\n• Timeline: 1-3 months\n\n**Option 3 — Arbitration**\n• Approach: Submit to IORT arbitration (if contractual clause permits).\n• Timeline: 6-9 months\n• Win Probability: **68%**\n\n**AI Recommendation:** Pursue Option 2 (settlement) with Option 1 as fallback if settlement fails within 45 days. Evidence is strong but court delays pose the greatest risk.`,

    document_comparison: `**AI Document Comparison**\n\n**Document A:** ${input.doc_a || 'Original Contract (v1)'}\n**Document B:** ${input.doc_b || 'Revised Contract (v2)'}\n\n**Summary:** 12 differences found — 3 material, 6 minor, 3 formatting.\n\n**Material Changes:**\n| # | Clause | Document A | Document B | Risk |\n|---|---|---|---|---|\n| 1 | Liability Cap | No cap | Capped at contract value | 🔴 HIGH — limits recovery |\n| 2 | Payment Terms | Net 30 days | Net 60 days | 🟡 MEDIUM — cash flow impact |\n| 3 | Governing Law | Tunis | Arbitration (IORT) | 🟡 MEDIUM — process change |\n\n**Minor Changes:**\n• "Shall" → "Will" (6 occurrences) — stylistic, no legal impact.\n• Company address updated in preamble.\n• Signature block format changed.\n\n**Recommendation:**\n⚠️ Do NOT sign Document B without addressing the liability cap change in Clause 8.\n⚠️ The payment terms change to Net 60 could create cash flow issues — negotiate back to Net 30.\n✅ Arbitration clause is acceptable if IORT rules are preferred.`,

    knowledge_search: `**AI Knowledge Base Search**\n\n**Query:** "${input.query || 'termination clause labour law'}"\n**Sources Searched:** Internal case database, precedent library, statute index\n\n**Top Results:**\n\n1. **[INTERNAL] Labour Dispute – Ben Said v. Delta SARL (2026)**\n   Relevance: 94%\n   Summary: Wrongful termination case; COC Art. 14 cited; interim order obtained.\n   Status: In Progress\n\n2. **[PRECEDENT] CA Tunis 2021-0887**\n   Relevance: 88%\n   Summary: Termination without cause; employee reinstated + 6 months compensation awarded.\n   \n3. **[STATUTE] Code du Travail, Articles 14-22**\n   Relevance: 95%\n   Summary: Statutory framework for lawful termination — notice periods, compensation formulas.\n\n4. **[TEMPLATE] Standard Termination Letter Template**\n   Relevance: 75%\n   Summary: Firm template for formal termination notices; last updated 2025.\n\n5. **[ARTICLE] "Wrongful Dismissal in Tunisian Labour Law" (2024)**\n   Relevance: 71%\n   Source: Revue Juridique Tunisienne, Vol. 42\n\n**AI Insight:** For termination cases, the strongest argument combines COC Art. 14 with the CA Tunis 2021-0887 precedent, particularly where written notice was not provided.`,
  };
  return responses[type] || `AI response for ${type} generated successfully.`;
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.post('/legal-research', (req, res) => {
  const { query, area } = req.body;
  if (!query) return res.status(400).json({ error: 'query required.' });
  setTimeout(() => res.json({ result: aiResponse('legal_research', { query, area }), tokens: 842 }), 1200);
});

router.post('/contract-generation', (req, res) => {
  const body = req.body;
  if (!body.contract_type) return res.status(400).json({ error: 'contract_type required.' });
  setTimeout(() => res.json({ result: aiResponse('contract_generation', body), tokens: 1240 }), 1500);
});

router.post('/clause-suggestions', (req, res) => {
  const { text, contract_type } = req.body;
  setTimeout(() => res.json({ clauses: aiResponse('clause_suggestions', { text, contract_type }), tokens: 420 }), 900);
});

router.post('/document-summary', (req, res) => {
  const { text, title, doc_type } = req.body;
  if (!text && !title) return res.status(400).json({ error: 'text or title required.' });
  setTimeout(() => res.json({ result: aiResponse('document_summary', { text, title, doc_type }), tokens: 680 }), 1100);
});

router.post('/citation-generation', (req, res) => {
  const { context, area } = req.body;
  if (!context) return res.status(400).json({ error: 'context required.' });
  setTimeout(() => res.json({ result: aiResponse('citation_generation', { context, area }), tokens: 560 }), 1000);
});

router.post('/hearing-preparation', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ result: aiResponse('hearing_preparation', body), tokens: 920 }), 1300);
});

router.post('/deposition-preparation', (req, res) => {
  const body = req.body;
  if (!body.witness_name) return res.status(400).json({ error: 'witness_name required.' });
  setTimeout(() => res.json({ result: aiResponse('deposition_prep', body), tokens: 740 }), 1200);
});

router.post('/evidence-summary', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ result: aiResponse('evidence_summary', body), tokens: 610 }), 1000);
});

router.post('/transcription', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ result: aiResponse('transcription', body), tokens: 1100 }), 1400);
});

router.post('/translation', (req, res) => {
  const { text, from_lang, to_lang } = req.body;
  if (!text) return res.status(400).json({ error: 'text required.' });
  setTimeout(() => res.json({ result: aiResponse('translation', { text, from_lang, to_lang }), tokens: 480 }), 1000);
});

router.post('/client-intake', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ result: aiResponse('client_intake', body), tokens: 780 }), 1100);
});

router.post('/risk-analysis', (req, res) => {
  const body = req.body;
  if (!body.title && !body.text) return res.status(400).json({ error: 'title or text required.' });
  setTimeout(() => res.json({ result: aiResponse('risk_analysis', body), tokens: 860 }), 1300);
});

router.post('/invoice-generation', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ result: aiResponse('invoice_generation', body), tokens: 520 }), 900);
});

router.post('/email-draft', (req, res) => {
  const body = req.body;
  if (!body.subject && !body.matter) return res.status(400).json({ error: 'subject or matter required.' });
  setTimeout(() => res.json({ result: aiResponse('email_draft', body), tokens: 640 }), 1000);
});

router.post('/task-recommendations', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ tasks: aiResponse('task_recommendations', body), tokens: 380 }), 800);
});

router.post('/deadline-prediction', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ deadlines: aiResponse('deadline_prediction', body), tokens: 420 }), 900);
});

router.post('/conflict-detection', (req, res) => {
  const body = req.body;
  if (!body.client_name) return res.status(400).json({ error: 'client_name required.' });
  setTimeout(() => res.json({ result: aiResponse('conflict_detection', body), tokens: 340 }), 1100);
});

router.post('/litigation-strategy', (req, res) => {
  const body = req.body;
  setTimeout(() => res.json({ result: aiResponse('litigation_strategy', body), tokens: 980 }), 1400);
});

router.post('/document-comparison', (req, res) => {
  const { doc_a, doc_b } = req.body;
  if (!doc_a && !doc_b) return res.status(400).json({ error: 'doc_a and doc_b required.' });
  setTimeout(() => res.json({ result: aiResponse('document_comparison', { doc_a, doc_b }), tokens: 1060 }), 1500);
});

router.post('/knowledge-search', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'query required.' });
  setTimeout(() => res.json({ result: aiResponse('knowledge_search', { query }), tokens: 620 }), 1200);
});

// Usage stats
router.get('/usage', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT COUNT(*) AS total FROM activity_logs WHERE activity_type LIKE 'ai_%'`);
    return res.json({
      total_requests: Number(rows[0].total) + 284,
      tokens_used: 284500,
      features_used: 20,
      top_feature: 'contract_generation',
      avg_response_ms: 1150,
    });
  } catch { return res.json({ total_requests: 284, tokens_used: 284500, features_used: 20 }); }
});

module.exports = router;
