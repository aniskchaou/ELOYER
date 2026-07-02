<template>
  <div>
    <FrontOfficeNav />

    <!-- Hero -->
    <section style="background:linear-gradient(135deg,#0A1628,#162f55);padding:140px 0 80px">
      <v-container class="text-center">
        <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">PRACTICE AREAS</div>
        <h1 style="color:white;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;letter-spacing:-1px" class="mb-4">Legal Services & Practice Areas</h1>
        <p style="color:rgba(255,255,255,.65);font-size:1.1rem;max-width:600px;margin:0 auto">Comprehensive legal practice management across every specialisation — built by lawyers, for lawyers.</p>
      </v-container>
    </section>

    <!-- Practice Areas -->
    <section class="py-20" style="background:white">
      <v-container>
        <div class="text-center mb-16">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">PRACTICE AREAS</div>
          <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);font-weight:900;color:#0A1628">Every Area of Law, Supported</h2>
        </div>
        <v-row>
          <v-col v-for="area in practiceAreas" :key="area.title" cols="12" sm="6" md="4" class="mb-4">
            <v-card outlined class="pa-7 h-full" style="border-radius:20px;border:1.5px solid #f1f5f9;transition:all .25s;height:100%;cursor:pointer"
              @mouseenter="area.hovered=true" @mouseleave="area.hovered=false"
              :style="area.hovered ? 'box-shadow:0 12px 40px rgba(0,0,0,.1);transform:translateY(-4px);border-color:#e2e8f0' : ''">
              <div class="mb-4" :style="`width:52px;height:52px;border-radius:14px;background:${area.bg};display:flex;align-items:center;justify-content:center`">
                <v-icon :color="area.color" size="24">{{ area.icon }}</v-icon>
              </div>
              <div class="subtitle-1 font-weight-bold mb-2" style="color:#0A1628">{{ area.title }}</div>
              <p class="body-2 mb-4" style="color:#64748b;line-height:1.75">{{ area.desc }}</p>
              <div class="d-flex flex-wrap" style="gap:6px">
                <v-chip v-for="tag in area.tags" :key="tag" x-small outlined :color="area.color" style="font-size:10px">{{ tag }}</v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Platform Capabilities -->
    <section class="py-20" style="background:#f8f9fc">
      <v-container>
        <div class="text-center mb-16">
          <div class="overline mb-3" style="color:#C8A96E;letter-spacing:3px">PLATFORM CAPABILITIES</div>
          <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);font-weight:900;color:#0A1628">What's Included in Every Plan</h2>
        </div>
        <v-row>
          <v-col v-for="cap in capabilities" :key="cap.title" cols="12" md="6" class="mb-4">
            <div class="d-flex align-start pa-6" style="background:white;border-radius:20px;border:1.5px solid #f1f5f9">
              <div class="mr-5 flex-shrink-0" :style="`width:48px;height:48px;border-radius:14px;background:${cap.bg};display:flex;align-items:center;justify-content:center`">
                <v-icon :color="cap.color" size="22">{{ cap.icon }}</v-icon>
              </div>
              <div>
                <div class="subtitle-2 font-weight-bold mb-1" style="color:#0A1628">{{ cap.title }}</div>
                <p class="body-2 mb-0" style="color:#64748b;line-height:1.7">{{ cap.desc }}</p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA -->
    <section style="background:linear-gradient(135deg,#0A1628,#162f55)" class="py-20 text-center">
      <v-container>
        <h2 style="color:white;font-size:2.2rem;font-weight:900;letter-spacing:-1px" class="mb-4">Ready to Modernise Your Practice?</h2>
        <p style="color:rgba(255,255,255,.65)" class="mb-8">Get started in minutes. No setup fees. Cancel any time.</p>
        <v-btn x-large rounded elevation="0" to="/contact" style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:800;height:54px;padding:0 40px">
          <v-icon left>mdi-rocket-launch</v-icon>Start Free Trial
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
  name: 'ServicesPage',
  components: { FrontOfficeNav, FrontOfficeFooter },
  data() {
    return {
      practiceAreas: [
        { title: 'Civil Litigation', desc: 'Manage civil disputes from initial filing to final judgment. Timeline management, evidence tracking and court hearing coordination.', icon: 'mdi-scale-balance', color: '#0A1628', bg: '#e8f0fe', tags: ['Property Disputes','Contract Breach','Liability Claims'], hovered: false },
        { title: 'Corporate & Commercial', desc: 'Support corporate clients with M&A due diligence, contract negotiation, regulatory compliance and board governance.', icon: 'mdi-domain', color: '#6366f1', bg: '#ede9fe', tags: ['M&A','Due Diligence','Compliance'], hovered: false },
        { title: 'Labour & Employment', desc: 'Streamline employment dispute management with integrated labour code references, hearing preparation and settlement tracking.', icon: 'mdi-account-hard-hat', color: '#059669', bg: '#d1fae5', tags: ['Wrongful Dismissal','HRMC','Contracts'], hovered: false },
        { title: 'Family Law', desc: 'Sensitive case handling for divorce, custody and inheritance matters — with client-facing portals and secure messaging.', icon: 'mdi-home-heart', color: '#ec4899', bg: '#fce7f3', tags: ['Divorce','Custody','Inheritance'], hovered: false },
        { title: 'Criminal Defence', desc: 'Full criminal defence workflow including evidence management, witness preparation, deposition tools and strategy planning.', icon: 'mdi-gavel', color: '#dc2626', bg: '#fee2e2', tags: ['Fraud','Criminal Cases','Appeals'], hovered: false },
        { title: 'Real Estate & Property', desc: 'Handle property transactions, title searches, conveyancing documents and disputes with integrated OCR and e-signature.', icon: 'mdi-home-city', color: '#d97706', bg: '#fef3c7', tags: ['Title Search','Conveyancing','Disputes'], hovered: false },
        { title: 'Intellectual Property', desc: 'Manage IP registrations, licensing agreements, trademark disputes and patent portfolios with built-in deadline tracking.', icon: 'mdi-lightbulb', color: '#0891b2', bg: '#e0f2fe', tags: ['Trademarks','Patents','Licensing'], hovered: false },
        { title: 'Administrative Law', desc: 'Navigate regulatory proceedings, permits, licensing and government disputes with structured document workflows.', icon: 'mdi-bank', color: '#7c3aed', bg: '#f3e8ff', tags: ['Permits','Regulatory','Appeals'], hovered: false },
        { title: 'Banking & Finance', desc: 'Support banking litigation, loan recoveries, guarantee enforcement and financial regulatory compliance matters.', icon: 'mdi-credit-card', color: '#c2410c', bg: '#ffedd5', tags: ['Loan Recovery','Guarantees','MIFID'], hovered: false },
      ],
      capabilities: [
        { title: 'Case & Matter Management', desc: 'Full lifecycle management from intake to closure. Timelines, events, notes and all stakeholders in one place.', icon: 'mdi-folder-open', color: '#0A1628', bg: '#e8f0fe' },
        { title: 'Document Management', desc: 'Versioning, OCR scanning, e-signature, template library and client-secure file vault.', icon: 'mdi-file-document-multiple', color: '#6366f1', bg: '#ede9fe' },
        { title: 'Client Portal', desc: 'Branded client-facing portal for case updates, invoice payments, document uploads and secure messaging.', icon: 'mdi-account-circle', color: '#0891b2', bg: '#e0f2fe' },
        { title: 'Billing & Trust Accounting', desc: 'Automated invoicing, billable hours, trust ledger, retainers and multi-currency support.', icon: 'mdi-bank', color: '#059669', bg: '#d1fae5' },
        { title: 'AI Legal Assistant', desc: '20 premium AI tools including contract generation, citation lookup, risk analysis and strategy suggestions.', icon: 'mdi-robot-excited', color: '#7c3aed', bg: '#f3e8ff' },
        { title: 'Calendar & Court Hearings', desc: 'Integrated calendar with court hearing tracking, deadline monitoring and automatic reminder dispatch.', icon: 'mdi-calendar-check', color: '#d97706', bg: '#fef3c7' },
        { title: 'Team & HR Management', desc: 'Staff invitations, departments, payroll, attendance, leave management and performance reviews.', icon: 'mdi-account-group', color: '#ec4899', bg: '#fce7f3' },
        { title: 'Analytics & Reporting', desc: 'Business intelligence dashboards, revenue trends, case performance KPIs and exportable custom reports.', icon: 'mdi-chart-areaspline', color: '#dc2626', bg: '#fee2e2' },
      ],
    };
  },
};
</script>
<style scoped>
.py-20 { padding-top:80px !important; padding-bottom:80px !important; }
</style>
