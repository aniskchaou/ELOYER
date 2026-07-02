<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Workflow Tracker</h1><p class="body-2 grey--text">Monitor active workflows and their current step status</p></v-col>
    </v-row>
    <v-row>
      <v-col v-for="wf in workflows" :key="wf.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-icon :color="wf.is_active ? 'teal' : 'grey'" class="mr-2">mdi-arrow-decision</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ wf.name }}</div>
            <v-spacer></v-spacer>
            <v-chip x-small :color="wf.is_active ? 'success' : 'grey'" dark>{{ wf.is_active ? 'Active' : 'Inactive' }}</v-chip>
          </div>
          <div class="caption grey--text mb-2">Trigger: {{ wf.trigger_event || 'Manual' }}</div>
          <v-stepper non-linear flat class="elevation-0 pa-0">
            <v-stepper-header class="elevation-0">
              <template v-for="(step, i) in wf.steps">
                <v-stepper-step :key="step.id" :step="i+1" :complete="step.simComplete" :color="stepColor(step)" edit-icon="mdi-check" class="pa-1">
                  <small>{{ step.label }}</small>
                </v-stepper-step>
                <v-divider v-if="i < wf.steps.length-1" :key="'d'+i"></v-divider>
              </template>
            </v-stepper-header>
          </v-stepper>
          <div class="mt-2 d-flex justify-end">
            <v-btn x-small outlined color="teal" @click="advanceStep(wf)">Advance Step</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="!loading && !workflows.length" type="info" outlined class="mt-4">No active workflows. Workflows are managed by the Firm Admin.</v-alert>
    <v-snackbar v-model="snack" color="success" top>Step advanced.</v-snackbar>
  </v-container>
</template>
<script>
import { faGetWorkflows } from '@/services/firmadminApi';
export default {
  name: 'WorkflowTracker',
  data() { return { workflows: [], loading: true, snack: false }; },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        const raw = await faGetWorkflows();
        this.workflows = raw.map(wf => ({
          ...wf,
          steps: (wf.steps || []).map((s, i) => ({ ...s, simComplete: i === 0 })),
          currentStep: 1,
        }));
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    advanceStep(wf) {
      const next = wf.steps.find(s => !s.simComplete);
      if (next) { next.simComplete = true; this.snack = true; }
    },
    stepColor(step) { return step.simComplete ? 'teal' : 'grey'; },
  },
};
</script>
