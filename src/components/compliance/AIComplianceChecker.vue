<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Compliance Checker</h1><p class="body-2 grey--text">Paste a document to get an instant AI-powered compliance and risk analysis</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Document Input</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="form.title" label="Document Title *" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.review_type" :items="['contract','nda','employment','lease','compliance','policy','regulation']" label="Document Type" outlined dense class="mb-3"></v-select>
          <v-textarea v-model="form.content_text" label="Paste document text here…" outlined :rows="12" auto-grow placeholder="Paste the full text of the contract or document to analyze…"></v-textarea>
          <v-btn color="red darken-3" dark block class="mt-3" :loading="analyzing" @click="analyze">
            <v-icon left>mdi-robot</v-icon>Analyze Compliance
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-skeleton-loader v-if="analyzing" type="card, list-item-three-line, list-item-two-line"></v-skeleton-loader>
        <template v-else-if="result">
          <!-- Score -->
          <v-card outlined class="pa-4 mb-4">
            <div class="d-flex align-center">
              <div>
                <div class="overline grey--text">Compliance Score</div>
                <div class="text-h2 font-weight-bold" :class="scoreColor(result.compliance_score)+'--text'">{{ result.compliance_score }}</div>
                <div class="body-2 grey--text">out of 100</div>
              </div>
              <v-spacer></v-spacer>
              <div class="text-center">
                <v-progress-circular :value="result.compliance_score" :color="scoreColor(result.compliance_score)" size="80" width="10">
                  <span class="caption font-weight-bold">{{ riskLabel(result.overall_risk) }}</span>
                </v-progress-circular>
              </div>
            </div>
          </v-card>

          <!-- Flags -->
          <v-card outlined class="pa-4 mb-4">
            <v-card-title class="subtitle-1 pb-2">Compliance Flags ({{ (result.flags||[]).filter(f=>!f.is_resolved).length }} open)</v-card-title>
            <v-divider class="mb-3"></v-divider>
            <v-list dense>
              <v-list-item v-for="flag in (result.flags||[])" :key="flag.id">
                <v-list-item-icon><v-icon :color="severityColor(flag.severity)" small>{{ flag.is_resolved ? 'mdi-check-circle' : 'mdi-flag' }}</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title :class="flag.is_resolved ? 'text-decoration-line-through grey--text' : ''">{{ flag.description }}</v-list-item-title>
                  <v-list-item-subtitle v-if="flag.recommendation">{{ flag.recommendation }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip x-small :color="severityColor(flag.severity)" dark>{{ flag.severity }}</v-chip>
                </v-list-item-action>
              </v-list-item>
              <v-list-item v-if="!(result.flags||[]).length"><v-list-item-content><v-list-item-subtitle>No flags.</v-list-item-subtitle></v-list-item-content></v-list-item>
            </v-list>
          </v-card>

          <!-- Actions -->
          <v-card outlined class="pa-4">
            <div class="d-flex">
              <v-btn outlined color="success" class="mr-2" :loading="approving" @click="approve"><v-icon left small>mdi-check</v-icon>Approve</v-btn>
              <v-btn outlined color="error" :loading="rejecting" @click="reject"><v-icon left small>mdi-close</v-icon>Reject</v-btn>
              <v-spacer></v-spacer>
              <v-btn outlined color="blue" @click="newReview">New Review</v-btn>
            </div>
          </v-card>
        </template>
        <div v-else class="text-center grey--text mt-12">
          <v-icon x-large>mdi-robot-outline</v-icon>
          <p class="mt-2 body-2">Paste document text and click "Analyze Compliance" to get results.</p>
        </div>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extRunCompliance, extApproveCompliance, extRejectCompliance } from '@/services/externalApi';
export default {
  name: 'AIComplianceChecker',
  data() {
    return {
      analyzing: false, approving: false, rejecting: false,
      result: null,
      form: { reviewer_id: 1, title: '', review_type: 'contract', content_text: '' },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  methods: {
    async analyze() {
      if (!this.form.title || !this.form.content_text) { this.notify('Title and content required.', 'error'); return; }
      this.analyzing = true;
      try {
        const r = await extRunCompliance(this.form);
        const full = await import('@/services/externalApi').then(m => m.extGetCompliance(1));
        this.result = full.find(rev => rev.id === r.id) || r;
        this.notify('Analysis complete.');
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.analyzing = false; }
    },
    async approve() {
      if (!this.result) return;
      this.approving = true;
      try { await extApproveCompliance(this.result.id); this.notify('Document approved.'); this.result.status = 'approved'; }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.approving = false; }
    },
    async reject() {
      if (!this.result) return;
      this.rejecting = true;
      try { await extRejectCompliance(this.result.id); this.notify('Document rejected.', 'warning'); this.result.status = 'rejected'; }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.rejecting = false; }
    },
    newReview() { this.result = null; this.form = { reviewer_id: 1, title: '', review_type: 'contract', content_text: '' }; },
    scoreColor(s) { return s >= 80 ? 'green' : s >= 60 ? 'orange' : 'error'; },
    riskLabel(r) { return r === 'high' ? 'HIGH' : r === 'medium' ? 'MED' : 'LOW'; },
    severityColor(s) { return s === 'high' ? 'error' : s === 'medium' ? 'warning' : 'success'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
