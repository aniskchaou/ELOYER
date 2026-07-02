<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold"><v-icon left color="purple darken-2">mdi-robot-excited</v-icon>Premium AI Features</h1>
        <p class="body-2 grey--text">20 AI-powered legal tools — research, drafting, analysis and automation</p>
      </v-col>
      <v-col cols="auto">
        <v-chip color="purple darken-2" dark>
          <v-icon left small>mdi-lightning-bolt</v-icon>{{ usage.total_requests || 284 }} requests · {{ (usage.tokens_used || 284500).toLocaleString() }} tokens used
        </v-chip>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="feature in features" :key="feature.route" cols="12" sm="6" md="4" lg="3">
        <v-card outlined class="pa-3 d-flex flex-column" style="min-height:130px" :to="feature.route"
          :class="{ 'elevation-2': hovering === feature.route }"
          @mouseenter="hovering = feature.route" @mouseleave="hovering = null">
          <div class="d-flex align-center mb-2">
            <v-avatar size="38" :color="feature.color" class="mr-2">
              <v-icon dark small>{{ feature.icon }}</v-icon>
            </v-avatar>
            <div class="subtitle-2 font-weight-bold">{{ feature.title }}</div>
          </div>
          <p class="caption grey--text mb-0 flex-grow-1">{{ feature.desc }}</p>
          <div class="mt-2 d-flex justify-end">
            <v-chip x-small :color="feature.color" dark outlined>{{ feature.category }}</v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { aiUsage } from '@/services/aiPremiumApi';
export default {
  name: 'AIPremiumHub',
  data() {
    return {
      usage: {}, hovering: null,
      features: [
        { title: 'Legal Research',       desc: 'Search statutes, precedents and doctrine',         icon: 'mdi-book-search',         color: 'purple darken-2',  category: 'Research',    route: '/ai-premium/legal-research' },
        { title: 'Contract Generation',  desc: 'Generate professional contracts from a prompt',    icon: 'mdi-file-sign',           color: 'indigo darken-1',  category: 'Drafting',    route: '/ai-premium/contract-generation' },
        { title: 'Clause Suggestions',   desc: 'Recommended clauses for any contract type',        icon: 'mdi-puzzle-edit',         color: 'blue darken-2',    category: 'Drafting',    route: '/ai-premium/clause-suggestions' },
        { title: 'Document Summary',     desc: 'Concise summaries of lengthy legal documents',     icon: 'mdi-text-box-search',     color: 'teal darken-1',    category: 'Analysis',    route: '/ai-premium/document-summary' },
        { title: 'Citation Generator',   desc: 'Properly formatted legal citations',               icon: 'mdi-bookmark-multiple',   color: 'deep-orange',      category: 'Research',    route: '/ai-premium/citation-generation' },
        { title: 'Hearing Preparation',  desc: 'Complete hearing briefs and checklists',           icon: 'mdi-gavel',               color: 'brown darken-1',   category: 'Preparation', route: '/ai-premium/hearing-preparation' },
        { title: 'Deposition Prep',      desc: 'Examination questions and coaching notes',         icon: 'mdi-microphone-question', color: 'amber darken-3',   category: 'Preparation', route: '/ai-premium/deposition-preparation' },
        { title: 'Evidence Summary',     desc: 'Structured evidence analysis for cases',           icon: 'mdi-briefcase-search',    color: 'green darken-2',   category: 'Analysis',    route: '/ai-premium/evidence-summary' },
        { title: 'Meeting Transcription',desc: 'Structured transcripts from meeting notes',        icon: 'mdi-transcribe',          color: 'blue-grey darken-1',category: 'Tools',      route: '/ai-premium/meeting-transcription' },
        { title: 'Translation',          desc: 'Legal translation — Arabic, French, English',      icon: 'mdi-translate',           color: 'cyan darken-2',    category: 'Tools',       route: '/ai-premium/translation' },
        { title: 'Client Intake',        desc: 'Intelligent new client matter assessment',         icon: 'mdi-account-plus',        color: 'pink darken-1',    category: 'Client',      route: '/ai-premium/client-intake' },
        { title: 'Risk Analysis',        desc: 'Comprehensive legal risk scoring',                 icon: 'mdi-shield-alert',        color: 'red darken-2',     category: 'Analysis',    route: '/ai-premium/risk-analysis' },
        { title: 'Invoice Generation',   desc: 'Auto-generate professional invoices',              icon: 'mdi-receipt-text',        color: 'green darken-1',   category: 'Billing',     route: '/ai-premium/invoice-generation' },
        { title: 'Email Drafting',       desc: 'Professional legal correspondence in seconds',     icon: 'mdi-email-edit',          color: 'blue darken-1',    category: 'Drafting',    route: '/ai-premium/email-drafting' },
        { title: 'Task Recommendations', desc: 'AI-suggested tasks by case stage',                 icon: 'mdi-clipboard-list',      color: 'orange darken-2',  category: 'Productivity',route: '/ai-premium/task-recommendations' },
        { title: 'Deadline Prediction',  desc: 'Predict upcoming deadlines with confidence scores',icon: 'mdi-calendar-clock',      color: 'teal darken-2',    category: 'Productivity',route: '/ai-premium/deadline-prediction' },
        { title: 'Conflict Detection',   desc: 'Screen new clients for conflicts of interest',     icon: 'mdi-account-alert',       color: 'red darken-3',     category: 'Compliance',  route: '/ai-premium/conflict-detection' },
        { title: 'Litigation Strategy',  desc: 'Strategic options with win probability analysis',  icon: 'mdi-chess-rook',          color: 'indigo darken-2',  category: 'Strategy',    route: '/ai-premium/litigation-strategy' },
        { title: 'Document Comparison',  desc: 'Identify material differences between drafts',     icon: 'mdi-compare',             color: 'deep-purple',      category: 'Analysis',    route: '/ai-premium/document-comparison' },
        { title: 'Knowledge Search',     desc: 'Search internal cases, templates and research',    icon: 'mdi-database-search',     color: 'amber darken-2',   category: 'Research',    route: '/ai-premium/knowledge-search' },
      ],
    };
  },
  created() {
    aiUsage().then(r => { this.usage = r; }).catch(() => {});
  },
};
</script>
