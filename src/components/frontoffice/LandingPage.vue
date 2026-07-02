<template>
  <div class="landing-page">
    <FrontOfficeNav />

    <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
    <section class="hero-section" style="min-height:100vh;background:linear-gradient(135deg,#0A1628 0%,#0d2244 60%,#162f55 100%);display:flex;align-items:center;position:relative;overflow:hidden">

      <!-- Decorative circles -->
      <div style="position:absolute;top:-100px;right:-100px;width:600px;height:600px;border-radius:50%;background:rgba(200,169,110,.06);pointer-events:none"></div>
      <div style="position:absolute;bottom:-150px;left:-100px;width:500px;height:500px;border-radius:50%;background:rgba(200,169,110,.04);pointer-events:none"></div>

      <v-container class="pt-16">
        <v-row align="center">
          <v-col cols="12" md="6" class="pr-md-12">
            <div class="overline mb-4" style="color:#C8A96E;letter-spacing:3px;font-size:11px;font-weight:700">
              ⚖️ LEGAL PRACTICE MANAGEMENT PLATFORM
            </div>
            <h1 class="hero-headline mb-6" style="color:white;font-size:clamp(2.2rem,4.5vw,3.6rem);font-weight:900;line-height:1.12;letter-spacing:-1px">
              Run Your Entire<br>
              <span style="background:linear-gradient(90deg,#C8A96E,#e8c97e);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Law Firm</span><br>
              From One Platform
            </h1>
            <p class="body-1 mb-8" style="color:rgba(255,255,255,.72);font-size:1.15rem;line-height:1.75;max-width:500px">
              Cases, clients, billing, AI-drafting and compliance — fully integrated, military-grade secure, and built specifically for legal professionals.
            </p>

            <div class="d-flex flex-wrap" style="gap:12px">
              <v-btn x-large rounded elevation="0" to="/contact"
                style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:800;font-size:1rem;padding:0 32px;height:56px;letter-spacing:.3px">
                <v-icon left>mdi-rocket-launch</v-icon>Start Free Trial
              </v-btn>
              <v-btn x-large rounded outlined to="/about"
                style="border-color:rgba(255,255,255,.3);color:white;font-weight:600;height:56px;padding:0 28px">
                <v-icon left small>mdi-play-circle</v-icon>Watch Demo
              </v-btn>
            </div>

            <div class="d-flex align-center mt-8 flex-wrap" style="gap:24px">
              <div v-for="trust in trustItems" :key="trust" class="d-flex align-center">
                <v-icon size="16" color="#C8A96E" class="mr-1">mdi-check-circle</v-icon>
                <span style="color:rgba(255,255,255,.6);font-size:13px">{{ trust }}</span>
              </div>
            </div>
          </v-col>

          <!-- Hero Dashboard Mockup -->
          <v-col cols="12" md="6" class="d-none d-md-block">
            <div class="dashboard-mockup" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:20px;backdrop-filter:blur(10px)">
              <!-- Mock header -->
              <div class="d-flex align-center mb-4 pa-3" style="background:rgba(255,255,255,.05);border-radius:12px">
                <v-avatar size="32" color="#C8A96E" class="mr-3"><span class="caption font-weight-bold white--text">AC</span></v-avatar>
                <div><div style="color:white;font-size:13px;font-weight:600">Cabinet Cherni & Associés</div><div style="color:rgba(255,255,255,.5);font-size:11px">Senior Partner Dashboard</div></div>
                <v-spacer></v-spacer>
                <v-icon color="#C8A96E" small>mdi-bell</v-icon>
              </div>
              <!-- Mock KPIs -->
              <v-row dense class="mb-4">
                <v-col v-for="kpi in mockKpis" :key="kpi.label" cols="6">
                  <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:16px">
                    <div style="color:#C8A96E;font-size:22px;font-weight:800">{{ kpi.value }}</div>
                    <div style="color:rgba(255,255,255,.5);font-size:11px">{{ kpi.label }}</div>
                    <div style="color:#4ade80;font-size:10px" class="mt-1">{{ kpi.trend }}</div>
                  </div>
                </v-col>
              </v-row>
              <!-- Mock tasks -->
              <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:16px">
                <div style="color:rgba(255,255,255,.5);font-size:10px;letter-spacing:1px;margin-bottom:12px">UPCOMING TASKS</div>
                <div v-for="task in mockTasks" :key="task.title" class="d-flex align-center mb-3">
                  <div :style="`background:${task.color};width:8px;height:8px;border-radius:50%;margin-right:12px;flex-shrink:0`"></div>
                  <div style="color:rgba(255,255,255,.75);font-size:12px;flex-grow:1">{{ task.title }}</div>
                  <div style="color:rgba(255,255,255,.35);font-size:10px">{{ task.date }}</div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Stats Bar -->
        <v-row class="mt-16 pt-8" style="border-top:1px solid rgba(255,255,255,.08)">
          <v-col v-for="stat in stats" :key="stat.label" cols="6" md="3" class="text-center">
            <div style="color:white;font-size:2.2rem;font-weight:900;line-height:1" class="mb-1">{{ stat.value }}</div>
            <div style="color:rgba(255,255,255,.5);font-size:13px">{{ stat.label }}</div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── TRUSTED BY ────────────────────────────────────────────────────────── -->
    <section style="background:#f8f9fc;border-bottom:1px solid #eee" class="py-8">
      <v-container>
        <p class="text-center caption mb-6" style="color:#94a3b8;letter-spacing:2px;font-weight:600">TRUSTED BY LEADING LAW FIRMS ACROSS THE REGION</p>
        <div class="d-flex justify-center align-center flex-wrap" style="gap:40px">
          <div v-for="firm in trustFirms" :key="firm" class="d-flex align-center" style="opacity:.5">
            <v-icon color="#0A1628" size="20" class="mr-2">mdi-briefcase</v-icon>
            <span style="font-size:14px;font-weight:700;color:#0A1628;letter-spacing:.5px">{{ firm }}</span>
          </div>
        </div>
      </v-container>
    </section>

    <!-- ── FEATURES ──────────────────────────────────────────────────────────── -->
    <section class="py-20" style="background:white">
      <v-container>
        <div class="text-center mb-16">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">EVERYTHING YOU NEED</div>
          <h2 style="font-size:clamp(1.8rem,3vw,2.8rem);font-weight:900;color:#0A1628;letter-spacing:-1px">Built for the Modern Legal Professional</h2>
          <p class="mt-4" style="color:#64748b;font-size:1.05rem;max-width:600px;margin:16px auto 0">From solo practitioners to enterprise law firms — ELoyer scales with your practice.</p>
        </div>

        <v-row>
          <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="4" class="mb-4">
            <v-card outlined class="feature-card pa-6 h-full" style="border-radius:20px;border:1.5px solid #f1f5f9;transition:all .25s ease;height:100%" @mouseenter="feature.hovered=true" @mouseleave="feature.hovered=false">
              <div class="mb-5" style="width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center" :style="`background:${feature.bg}`">
                <v-icon :color="feature.color" size="26">{{ feature.icon }}</v-icon>
              </div>
              <div class="subtitle-1 font-weight-bold mb-2" style="color:#0A1628">{{ feature.title }}</div>
              <p class="body-2" style="color:#64748b;line-height:1.7">{{ feature.desc }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── AI HIGHLIGHT ──────────────────────────────────────────────────────── -->
    <section style="background:linear-gradient(135deg,#0A1628 0%,#0d2244 100%)" class="py-20">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="5">
            <div class="overline mb-4" style="color:#C8A96E;letter-spacing:3px">PREMIUM AI FEATURES</div>
            <h2 style="color:white;font-size:clamp(1.8rem,3vw,2.6rem);font-weight:900;letter-spacing:-1px;line-height:1.2" class="mb-6">
              20 AI Tools.<br>One Legal Platform.
            </h2>
            <p style="color:rgba(255,255,255,.65);font-size:1.05rem;line-height:1.8" class="mb-8">
              From contract generation to litigation strategy — our AI has been trained on legal data and integrated directly into your workflow.
            </p>
            <v-btn rounded x-large elevation="0" to="/login" style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:700;height:52px">
              <v-icon left>mdi-robot-excited</v-icon>Explore AI Features
            </v-btn>
          </v-col>
          <v-col cols="12" md="7" class="pl-md-12">
            <v-row dense>
              <v-col v-for="ai in aiFeatures" :key="ai" cols="6" sm="6" class="mb-3">
                <div class="d-flex align-center" style="background:rgba(255,255,255,.05);border-radius:12px;padding:12px 16px">
                  <v-icon color="#C8A96E" small class="mr-2">mdi-check-circle</v-icon>
                  <span style="color:rgba(255,255,255,.8);font-size:13px">{{ ai }}</span>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── HOW IT WORKS ──────────────────────────────────────────────────────── -->
    <section class="py-20" style="background:#f8f9fc">
      <v-container>
        <div class="text-center mb-16">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">GET STARTED IN MINUTES</div>
          <h2 style="font-size:clamp(1.8rem,3vw,2.6rem);font-weight:900;color:#0A1628">How It Works</h2>
        </div>
        <v-row justify="center">
          <v-col v-for="(step, i) in steps" :key="step.title" cols="12" md="4" class="text-center px-6">
            <div class="mb-6 mx-auto" style="width:80px;height:80px;border-radius:24px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0A1628,#162f55)">
              <v-icon color="white" size="32">{{ step.icon }}</v-icon>
            </div>
            <div class="caption mb-2" style="color:#C8A96E;font-weight:700;letter-spacing:2px">STEP {{ i+1 }}</div>
            <div class="subtitle-1 font-weight-bold mb-3" style="color:#0A1628">{{ step.title }}</div>
            <p class="body-2" style="color:#64748b;line-height:1.8">{{ step.desc }}</p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── TESTIMONIALS ──────────────────────────────────────────────────────── -->
    <section class="py-20" style="background:white">
      <v-container>
        <div class="text-center mb-16">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">CLIENT STORIES</div>
          <h2 style="font-size:clamp(1.8rem,3vw,2.6rem);font-weight:900;color:#0A1628">Trusted by Legal Professionals</h2>
        </div>
        <v-row>
          <v-col v-for="t in testimonials" :key="t.name" cols="12" md="4" class="mb-4">
            <v-card elevation="0" class="pa-8 h-full" style="border-radius:24px;background:#f8f9fc;border:1.5px solid #f1f5f9;height:100%">
              <div class="d-flex mb-4">
                <v-icon v-for="n in 5" :key="n" color="#C8A96E" size="16" class="mr-1">mdi-star</v-icon>
              </div>
              <p class="body-2 mb-6" style="color:#334155;font-size:15px;line-height:1.85;font-style:italic">"{{ t.quote }}"</p>
              <div class="d-flex align-center">
                <v-avatar :color="t.color" size="44" class="mr-3">
                  <span class="white--text font-weight-bold subtitle-2">{{ t.initials }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-bold" style="color:#0A1628;font-size:14px">{{ t.name }}</div>
                  <div style="color:#94a3b8;font-size:12px">{{ t.role }}</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ── PRICING PREVIEW ───────────────────────────────────────────────────── -->
    <section style="background:linear-gradient(180deg,#f8f9fc 0%,white 100%)" class="py-20">
      <v-container>
        <div class="text-center mb-16">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">SIMPLE PRICING</div>
          <h2 style="font-size:clamp(1.8rem,3vw,2.6rem);font-weight:900;color:#0A1628">Plans for Every Firm Size</h2>
          <p class="mt-3" style="color:#64748b">No setup fees. No hidden costs. Cancel any time.</p>
        </div>
        <v-row justify="center">
          <v-col v-for="plan in plans" :key="plan.name" cols="12" md="4" class="mb-4">
            <v-card :elevation="plan.popular ? 8 : 0" class="pa-8 text-center h-full" :style="`border-radius:24px;position:relative;height:100%;border:${plan.popular?'2px solid #C8A96E':'1.5px solid #f1f5f9'}`">
              <div v-if="plan.popular" style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;padding:4px 20px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap">MOST POPULAR</div>
              <div class="overline mb-2" :style="`color:${plan.color};letter-spacing:2px`">{{ plan.name }}</div>
              <div class="mb-1">
                <span style="font-size:2.8rem;font-weight:900;color:#0A1628">{{ plan.price === 0 ? 'Custom' : '$'+plan.price }}</span>
                <span v-if="plan.price > 0" style="color:#94a3b8">/month</span>
              </div>
              <div style="color:#94a3b8;font-size:13px" class="mb-6">{{ plan.desc }}</div>
              <v-divider class="mb-6"></v-divider>
              <div v-for="f in plan.features" :key="f" class="d-flex align-center mb-3">
                <v-icon color="#C8A96E" small class="mr-2">mdi-check-circle</v-icon>
                <span style="font-size:14px;color:#334155">{{ f }}</span>
              </div>
              <v-btn block rounded large elevation="0" to="/contact" class="mt-6"
                :style="plan.popular ? 'background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:700' : 'border:1.5px solid #0A1628;color:#0A1628;font-weight:700'">
                {{ plan.cta }}
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
        <div class="text-center mt-8">
          <v-btn text to="/pricing" style="color:#C8A96E;font-weight:600">See full pricing comparison <v-icon right small>mdi-arrow-right</v-icon></v-btn>
        </div>
      </v-container>
    </section>

    <!-- ── FINAL CTA ─────────────────────────────────────────────────────────── -->
    <section style="background:linear-gradient(135deg,#0A1628 0%,#162f55 100%)" class="py-20">
      <v-container class="text-center">
        <div class="overline mb-4" style="color:#C8A96E;letter-spacing:3px">GET STARTED TODAY</div>
        <h2 style="color:white;font-size:clamp(1.8rem,3vw,2.8rem);font-weight:900;letter-spacing:-1px" class="mb-6">
          Ready to Transform Your Practice?
        </h2>
        <p style="color:rgba(255,255,255,.65);font-size:1.1rem;max-width:560px;margin:0 auto 40px">
          Join hundreds of law firms already using ELoyer to save time, reduce errors and serve more clients.
        </p>
        <div class="d-flex justify-center flex-wrap" style="gap:16px">
          <v-btn x-large rounded elevation="0" to="/contact"
            style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:800;height:56px;padding:0 40px;font-size:1rem">
            <v-icon left>mdi-rocket-launch</v-icon>Start Free Trial
          </v-btn>
          <v-btn x-large rounded outlined to="/contact"
            style="border-color:rgba(255,255,255,.3);color:white;height:56px;padding:0 32px;font-weight:600">
            <v-icon left small>mdi-calendar</v-icon>Book a Demo
          </v-btn>
        </div>
        <p class="caption mt-6" style="color:rgba(255,255,255,.4)">14-day free trial · No credit card required · Cancel any time</p>
      </v-container>
    </section>

    <FrontOfficeFooter />
  </div>
</template>

<script>
import FrontOfficeNav from './FrontOfficeNav.vue';
import FrontOfficeFooter from './FrontOfficeFooter.vue';

export default {
  name: 'LandingPage',
  components: { FrontOfficeNav, FrontOfficeFooter },
  data() {
    return {
      trustItems: ['No credit card required', '14-day free trial', 'Cancel any time'],
      stats: [
        { value: '500+', label: 'Law Firms' },
        { value: '12,000+', label: 'Cases Managed' },
        { value: '98.9%', label: 'Uptime SLA' },
        { value: '4.9/5', label: 'Client Rating' },
      ],
      mockKpis: [
        { value: '24', label: 'Active Cases', trend: '↑ 3 this week' },
        { value: '$8,200', label: 'Revenue (MTD)', trend: '↑ 12% vs last month' },
        { value: '5', label: 'Hearings This Week', trend: 'Next: Tomorrow 09:00' },
        { value: '12', label: 'Pending Tasks', trend: '3 high priority' },
      ],
      mockTasks: [
        { title: 'File motion – Ben Ali v. Delta', date: 'Today', color: '#ef4444' },
        { title: 'Client meeting – Sfax Industries', date: 'Tomorrow', color: '#C8A96E' },
        { title: 'Review NDA – Tech Partner', date: 'Jul 5', color: '#3b82f6' },
      ],
      trustFirms: ['Cabinet Cherni & Associés', 'Lex Solutions SARL', 'Ben Mrad Legal', 'Maison du Droit', 'Sfax Law Partners'],
      features: [
        { title: 'Case Management', desc: 'Centralise all case data — notes, evidence, hearings, timelines and documents — in one structured workspace.', icon: 'mdi-folder-open', color: '#0A1628', bg: '#e8f0fe', hovered: false },
        { title: 'AI Legal Assistant', desc: '20 AI tools including contract generation, legal research, risk analysis and deposition preparation.', icon: 'mdi-robot-excited', color: '#6366f1', bg: '#ede9fe', hovered: false },
        { title: 'Client Portal', desc: 'Secure portal for clients to view case progress, pay invoices, sign documents and message their lawyer.', icon: 'mdi-account-circle', color: '#0891b2', bg: '#e0f2fe', hovered: false },
        { title: 'Billing & Trust', desc: 'Automated invoicing, trust account ledger, billable hours tracking and multi-currency support.', icon: 'mdi-bank', color: '#059669', bg: '#d1fae5', hovered: false },
        { title: 'Compliance & Security', desc: 'GDPR tools, SSO, 2FA, AES-256 encryption, audit logs and SOC 2-oriented controls.', icon: 'mdi-shield-check', color: '#dc2626', bg: '#fee2e2', hovered: false },
        { title: 'Advanced Reporting', desc: 'Business intelligence dashboards, revenue analytics, KPI tracking and custom exportable reports.', icon: 'mdi-chart-areaspline', color: '#d97706', bg: '#fef3c7', hovered: false },
      ],
      aiFeatures: [
        'AI Legal Research', 'Contract Generation', 'Clause Suggestions', 'Document Summarisation',
        'Hearing Preparation', 'Deposition Prep', 'Evidence Analysis', 'Translation (AR/FR/EN)',
        'Risk Analysis', 'Conflict Detection', 'Email Drafting', 'Invoice Generation',
      ],
      steps: [
        { title: 'Set Up Your Firm', desc: 'Create your firm profile, invite staff, configure departments and set role permissions in under 10 minutes.', icon: 'mdi-office-building' },
        { title: 'Import Your Data', desc: 'Use our migration tool to import existing cases, clients and documents from your current system.', icon: 'mdi-database-import' },
        { title: 'Start Working Smarter', desc: 'Manage cases, serve clients, generate AI documents and automate billing — all from one screen.', icon: 'mdi-lightning-bolt' },
      ],
      testimonials: [
        { quote: "ELoyer completely transformed how we manage our caseload. The AI drafting tools alone save me 3+ hours every day. I wouldn't go back.", name: 'Ahmed Cherni', role: 'Partner — Cabinet Cherni & Associés, Tunis', initials: 'AC', color: '#0A1628' },
        { quote: "The client portal is outstanding. Our clients love being able to track their cases and sign documents from their phones. It's a massive differentiator.", name: 'Sonia Belhaj', role: 'Senior Lawyer — Lex Solutions, Tunis', initials: 'SB', color: '#C8A96E' },
        { quote: "The billing and trust accounting module is as good as any dedicated accounting software. And it integrates with everything else seamlessly.", name: 'Omar Sfar', role: 'Finance Director — Ben Mrad Legal, Sfax', initials: 'OS', color: '#162f55' },
      ],
      plans: [
        { name: 'STARTER', price: 49, color: '#64748b', desc: 'For solo practitioners', popular: false, cta: 'Start Free Trial',
          features: ['3 users', '30 active cases', '5 GB storage', 'Client portal', 'Basic billing', 'Email support'] },
        { name: 'PRO', price: 99, color: '#C8A96E', desc: 'For growing firms', popular: true, cta: 'Start Free Trial',
          features: ['10 users', '200 active cases', '20 GB storage', 'AI legal tools', 'Trust accounting', 'Priority support'] },
        { name: 'ENTERPRISE', price: 0, color: '#0A1628', desc: 'For large firms', popular: false, cta: 'Contact Sales',
          features: ['Unlimited users', 'Unlimited cases', '500 GB storage', 'SSO & 2FA', 'Custom workflows', 'Dedicated manager'] },
      ],
    };
  },
};
</script>

<style scoped>
.landing-page { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.feature-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,.1) !important; transform: translateY(-4px); border-color: #e2e8f0 !important; }
.py-20 { padding-top: 80px !important; padding-bottom: 80px !important; }
</style>
