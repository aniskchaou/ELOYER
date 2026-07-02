<template>
  <div>
    <FrontOfficeNav />

    <!-- Hero -->
    <section style="background:linear-gradient(135deg,#0A1628,#162f55);padding:140px 0 80px">
      <v-container class="text-center">
        <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">PRICING</div>
        <h1 style="color:white;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;letter-spacing:-1px" class="mb-4">Simple, Transparent Pricing</h1>
        <p style="color:rgba(255,255,255,.65);font-size:1.1rem;max-width:520px;margin:0 auto 32px">No setup fees. No hidden costs. Scale up or down at any time.</p>
        <div class="d-flex justify-center align-center" style="gap:12px">
          <span :style="`color:${!yearly?'white':'rgba(255,255,255,.5)'};font-weight:${!yearly?700:400};font-size:15px`">Monthly</span>
          <v-switch v-model="yearly" inset dense hide-details color="#C8A96E" style="flex:none"></v-switch>
          <span :style="`color:${yearly?'white':'rgba(255,255,255,.5)'};font-weight:${yearly?700:400};font-size:15px`">Yearly <v-chip x-small dark style="background:#C8A96E;font-weight:700;margin-left:4px">SAVE 20%</v-chip></span>
        </div>
      </v-container>
    </section>

    <!-- Plans -->
    <section class="py-20" style="background:#f8f9fc;margin-top:-1px">
      <v-container>
        <v-row justify="center">
          <v-col v-for="plan in plans" :key="plan.name" cols="12" md="4" class="mb-6">
            <v-card :elevation="plan.popular ? 12 : 0" class="pa-8" :style="`border-radius:24px;position:relative;border:${plan.popular?'2px solid #C8A96E':'1.5px solid #e2e8f0'};background:${plan.popular?'white':'white'}`">
              <div v-if="plan.popular" style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;padding:4px 24px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap">MOST POPULAR</div>

              <div class="mb-2">
                <div class="overline font-weight-bold mb-1" :style="`color:${plan.color};letter-spacing:2px`">{{ plan.name }}</div>
                <div style="display:flex;align-items:baseline;gap:4px">
                  <span style="font-size:3rem;font-weight:900;color:#0A1628;line-height:1">{{ plan.price === 0 ? 'Custom' : '$' + (yearly ? plan.yearlyPrice : plan.price) }}</span>
                  <span v-if="plan.price > 0" style="color:#94a3b8;font-size:14px">/month</span>
                </div>
                <div style="color:#94a3b8;font-size:13px" class="mb-1">{{ plan.users }} · {{ plan.cases }}</div>
                <p style="color:#64748b;font-size:14px;line-height:1.6">{{ plan.desc }}</p>
              </div>

              <v-btn block rounded large elevation="0" to="/contact" class="mb-6 mt-4"
                :style="plan.popular ? 'background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:700;height:50px' : 'border:1.5px solid #0A1628;color:#0A1628;font-weight:700;height:50px'">
                {{ plan.cta }}
              </v-btn>

              <v-divider class="mb-5"></v-divider>

              <div class="caption font-weight-bold mb-4" style="color:#94a3b8;letter-spacing:1px">WHAT'S INCLUDED</div>
              <div v-for="f in plan.features" :key="f.label" class="d-flex align-start mb-3">
                <v-icon :color="f.included ? '#C8A96E' : '#cbd5e1'" size="16" class="mr-2 mt-1" style="flex-shrink:0">{{ f.included ? 'mdi-check-circle' : 'mdi-minus-circle-outline' }}</v-icon>
                <span style="font-size:13.5px" :style="`color:${f.included?'#334155':'#94a3b8'}`">{{ f.label }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Comparison note -->
        <div class="text-center mt-8">
          <p style="color:#94a3b8;font-size:14px">All prices in USD. Tunisian firms may pay in TND at current exchange rate.</p>
        </div>
      </v-container>
    </section>

    <!-- Feature Comparison Table -->
    <section class="py-20" style="background:white">
      <v-container>
        <div class="text-center mb-12">
          <h2 style="font-size:2rem;font-weight:900;color:#0A1628">Full Feature Comparison</h2>
        </div>
        <v-simple-table style="border-radius:20px;overflow:hidden;border:1.5px solid #f1f5f9">
          <template v-slot:default>
            <thead>
              <tr style="background:#0A1628">
                <th style="color:white;font-size:14px;padding:16px 20px;width:40%">Feature</th>
                <th v-for="h in tableHeaders" :key="h" class="text-center" style="color:white;font-size:13px;padding:16px">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in comparisonGroups">
                <tr :key="group.title" style="background:#f8f9fc">
                  <td colspan="4" style="padding:12px 20px;font-weight:700;color:#0A1628;font-size:13px;letter-spacing:.5px">{{ group.title }}</td>
                </tr>
                <tr v-for="row in group.rows" :key="row.feature" style="border-bottom:1px solid #f1f5f9">
                  <td style="padding:12px 20px;font-size:13.5px;color:#334155">{{ row.feature }}</td>
                  <td v-for="(val, i) in row.values" :key="i" class="text-center" style="padding:12px">
                    <v-icon v-if="val === true" color="#C8A96E" size="18">mdi-check-circle</v-icon>
                    <v-icon v-else-if="val === false" color="#e2e8f0" size="18">mdi-minus-circle</v-icon>
                    <span v-else style="font-size:12px;color:#334155;font-weight:600">{{ val }}</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </template>
        </v-simple-table>
      </v-container>
    </section>

    <!-- FAQ -->
    <section class="py-20" style="background:#f8f9fc">
      <v-container style="max-width:760px">
        <div class="text-center mb-12">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">FAQ</div>
          <h2 style="font-size:2rem;font-weight:900;color:#0A1628">Frequently Asked Questions</h2>
        </div>
        <v-expansion-panels flat>
          <v-expansion-panel v-for="faq in faqs" :key="faq.q" style="background:white;border-radius:16px;margin-bottom:8px;border:1.5px solid #f1f5f9">
            <v-expansion-panel-header style="font-weight:700;color:#0A1628;font-size:15px">{{ faq.q }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <p style="color:#64748b;line-height:1.8;font-size:14px;margin-top:8px">{{ faq.a }}</p>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-container>
    </section>

    <!-- CTA -->
    <section style="background:linear-gradient(135deg,#0A1628,#162f55)" class="py-16 text-center">
      <v-container>
        <h2 style="color:white;font-size:2rem;font-weight:900" class="mb-4">Start your 14-day free trial today</h2>
        <p style="color:rgba(255,255,255,.65)" class="mb-8">No credit card required. Full access. Cancel any time.</p>
        <v-btn x-large rounded elevation="0" to="/contact" style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:800;height:54px;padding:0 40px">
          Get Started Free
        </v-btn>
      </v-container>
    </section>

    <FrontOfficeFooter />
  </div>
</template>

<script>
import FrontOfficeNav from './FrontOfficeNav.vue';
import FrontOfficeFooter from './FrontOfficeFooter.vue';

export default {
  name: 'PricingPage',
  components: { FrontOfficeNav, FrontOfficeFooter },
  data() {
    return {
      yearly: false,
      tableHeaders: ['Starter', 'Pro', 'Enterprise'],
      plans: [
        { name: 'STARTER', price: 49, yearlyPrice: 39, color: '#64748b', desc: 'For solo practitioners and small firms just getting started.', popular: false, cta: 'Start Free Trial', users: 'Up to 3 users', cases: '30 active cases',
          features: [
            { label: '3 user accounts', included: true }, { label: '30 active cases', included: true },
            { label: '5 GB file storage', included: true }, { label: 'Client portal', included: true },
            { label: 'Basic invoicing', included: true }, { label: 'Calendar & hearings', included: true },
            { label: 'AI legal tools', included: false }, { label: 'Trust accounting', included: false },
            { label: 'API access', included: false }, { label: 'SSO / 2FA', included: false },
          ]},
        { name: 'PRO', price: 99, yearlyPrice: 79, color: '#C8A96E', desc: 'For growing firms that need AI power and advanced features.', popular: true, cta: 'Start Free Trial', users: 'Up to 10 users', cases: '200 active cases',
          features: [
            { label: '10 user accounts', included: true }, { label: '200 active cases', included: true },
            { label: '20 GB file storage', included: true }, { label: 'Client portal', included: true },
            { label: 'Full billing + trust', included: true }, { label: 'AI legal tools (20)', included: true },
            { label: 'Advanced reporting', included: true }, { label: 'Webhooks', included: true },
            { label: 'API access', included: true }, { label: 'SSO / 2FA', included: false },
          ]},
        { name: 'ENTERPRISE', price: 0, yearlyPrice: 0, color: '#0A1628', desc: 'Custom solutions for large firms with complex requirements.', popular: false, cta: 'Contact Sales', users: 'Unlimited users', cases: 'Unlimited cases',
          features: [
            { label: 'Unlimited users', included: true }, { label: 'Unlimited cases', included: true },
            { label: '500 GB+ file storage', included: true }, { label: 'White-label branding', included: true },
            { label: 'Custom workflows', included: true }, { label: 'All AI tools', included: true },
            { label: 'SSO & 2FA', included: true }, { label: 'Dedicated manager', included: true },
            { label: 'SLA 99.9%', included: true }, { label: 'On-premise option', included: true },
          ]},
      ],
      comparisonGroups: [
        { title: 'CORE FEATURES', rows: [
          { feature: 'Active Cases', values: ['30', '200', 'Unlimited'] },
          { feature: 'User Accounts', values: ['3', '10', 'Unlimited'] },
          { feature: 'File Storage', values: ['5 GB', '20 GB', '500 GB+'] },
          { feature: 'Client Portal', values: [true, true, true] },
          { feature: 'Calendar & Hearings', values: [true, true, true] },
        ]},
        { title: 'BILLING & FINANCE', rows: [
          { feature: 'Invoicing', values: [true, true, true] },
          { feature: 'Trust Accounting', values: [false, true, true] },
          { feature: 'Billable Hours', values: [false, true, true] },
          { feature: 'Payroll Management', values: [false, true, true] },
        ]},
        { title: 'AI FEATURES', rows: [
          { feature: 'AI Legal Research', values: [false, true, true] },
          { feature: 'AI Contract Generation', values: [false, true, true] },
          { feature: 'AI Risk Analysis', values: [false, true, true] },
          { feature: 'AI Conflict Detection', values: [false, true, true] },
          { feature: 'All 20 AI Tools', values: [false, true, true] },
        ]},
        { title: 'ENTERPRISE & SECURITY', rows: [
          { feature: 'SSO / SAML', values: [false, false, true] },
          { feature: 'Two-Factor Auth (2FA)', values: [false, true, true] },
          { feature: 'Audit Logs', values: [false, true, true] },
          { feature: 'API Access', values: [false, true, true] },
          { feature: 'Webhooks', values: [false, true, true] },
          { feature: 'White-label Branding', values: [false, false, true] },
          { feature: 'Custom Domains', values: [false, false, true] },
          { feature: 'Dedicated Support Manager', values: [false, false, true] },
        ]},
      ],
      faqs: [
        { q: 'Is there a free trial?', a: 'Yes. Every plan starts with a 14-day free trial with full access — no credit card required. You can upgrade, downgrade or cancel at any time.' },
        { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. When upgrading, you are charged the prorated difference immediately. When downgrading, the change takes effect at the next billing cycle.' },
        { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards (Visa, Mastercard), bank transfer (for annual plans) and PayPal. Tunisian firms can pay in TND via bank transfer.' },
        { q: 'Is my data secure?', a: 'Yes. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We perform daily backups with offsite storage. Our infrastructure is SOC 2-oriented and GDPR compliant.' },
        { q: 'Does the price include all AI features?', a: 'The Pro and Enterprise plans include all 20 premium AI tools. The Starter plan has limited AI access. Check the comparison table above for details.' },
        { q: 'Is there a discount for NGOs or academic institutions?', a: 'Yes — we offer up to 50% discount for eligible non-profit legal aid organisations and law schools. Contact our sales team for details.' },
      ],
    };
  },
};
</script>
<style scoped>
.py-20 { padding-top:80px !important; padding-bottom:80px !important; }
</style>
