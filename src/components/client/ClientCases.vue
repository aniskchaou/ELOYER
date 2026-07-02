<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">My Cases</h1><p class="body-2 grey--text">Track your legal matters and view case timelines</p></v-col>
    </v-row>

    <v-row>
      <!-- Case List -->
      <v-col cols="12" md="4">
        <v-card outlined style="min-height:500px">
          <v-card-title class="subtitle-1">Cases ({{ cases.length }})</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="c in cases" :key="c.id" @click="selectCase(c)" :class="selected && selected.id===c.id ? 'teal lighten-5':''">
              <v-list-item-icon><v-icon small :color="statusColor(c.status)">mdi-folder</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ c.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ c.case_type }} · {{ c.lawyer_name }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-chip x-small :color="statusColor(c.status)" dark>{{ c.status }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!loading && !cases.length"><v-list-item-content><v-list-item-subtitle>No cases.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Timeline -->
      <v-col cols="12" md="8">
        <v-card outlined style="min-height:500px" class="pa-4">
          <template v-if="selected">
            <v-card-title class="subtitle-1 pa-0 mb-2">{{ selected.title }} — Timeline</v-card-title>
            <div class="caption grey--text mb-3">Lawyer: {{ selected.lawyer_name }} · {{ selected.case_type }}</div>
            <v-row class="mb-3" dense>
              <v-col><v-chip small :color="statusColor(selected.status)" dark>{{ selected.status }}</v-chip></v-col>
              <v-col v-if="selected.next_hearing" cols="auto" class="caption grey--text">Next hearing: {{ new Date(selected.next_hearing).toLocaleDateString() }}</v-col>
            </v-row>
            <v-divider class="mb-4"></v-divider>
            <v-skeleton-loader v-if="loadingTimeline" type="list-item-two-line, list-item-two-line"></v-skeleton-loader>
            <v-timeline dense v-else-if="timeline.length">
              <v-timeline-item v-for="(item, i) in timeline" :key="i" :color="sourceColor(item.source)" small>
                <div class="caption grey--text">{{ new Date(item.date).toLocaleDateString() }}</div>
                <div class="body-2 font-weight-medium">{{ item.title }}</div>
                <v-chip x-small :color="sourceColor(item.source)" dark class="mt-1">{{ item.type }}</v-chip>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center grey--text mt-6">No timeline events yet.</div>
          </template>
          <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-folder-open</v-icon><p class="mt-2">Select a case to view its timeline</p></div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { cpGetCases, cpGetTimeline } from '@/services/portalApi';
const CLIENT_ID = 1;
export default {
  name: 'ClientCases',
  data() { return { cases: [], timeline: [], selected: null, loading: true, loadingTimeline: false }; },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.cases = await cpGetCases(CLIENT_ID); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async selectCase(c) {
      this.selected = c;
      this.loadingTimeline = true;
      try { this.timeline = await cpGetTimeline(CLIENT_ID, c.id); }
      catch (e) { this.timeline = []; }
      finally { this.loadingTimeline = false; }
    },
    statusColor(s) { const m = { open:'blue', in_progress:'orange', closed:'grey', won:'success', lost:'error' }; return m[s]||'grey'; },
    sourceColor(s) { const m = { event:'blue', hearing:'purple', update:'teal' }; return m[s]||'grey'; },
  },
};
</script>
