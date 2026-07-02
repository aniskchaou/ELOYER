<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Queue Management</h1><p class="body-2 grey--text">Live queue display and visitor calling system</p></v-col>
      <v-col cols="auto">
        <v-btn color="teal" dark @click="refreshLoop" class="mr-2"><v-icon left>mdi-refresh</v-icon>Refresh</v-btn>
      </v-col>
    </v-row>

    <!-- Current Number -->
    <v-card outlined class="pa-6 mb-4 text-center" color="teal darken-2" dark>
      <div class="overline">Now Serving</div>
      <div class="text-h1 font-weight-black">{{ currentServing ? '#' + currentServing.queue_number : '—' }}</div>
      <div class="subtitle-1 mt-1">{{ currentServing ? currentServing.visitor_name : 'No one currently being served' }}</div>
    </v-card>

    <v-row>
      <!-- Waiting Queue -->
      <v-col cols="12" md="7">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Waiting Queue ({{ waiting.length }})</v-card-title>
          <v-list dense>
            <v-list-item v-for="q in waiting" :key="q.id">
              <v-list-item-icon>
                <v-avatar :color="q.status==='called'?'orange':'teal lighten-2'" size="32">
                  <span class="white--text caption font-weight-bold">#{{ q.queue_number }}</span>
                </v-avatar>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ q.visitor_name }}</v-list-item-title>
                <v-list-item-subtitle>{{ q.service_type }} · {{ q.status }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="d-flex flex-row">
                <v-btn x-small color="orange" dark @click="call(q)" v-if="q.status==='waiting'" class="mr-1">Call</v-btn>
                <v-btn x-small color="success" @click="serve(q)" v-if="q.status==='called'">Serve</v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!waiting.length"><v-list-item-content><v-list-item-subtitle>Queue is empty.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Stats -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Today's Stats</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row>
            <v-col cols="6" v-for="s in queueStats" :key="s.label" class="text-center">
              <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
              <div class="caption grey--text">{{ s.label }}</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetQueue, stCallQueue, stServeQueue } from '@/services/staffApi';
export default {
  name: 'QueueManagement',
  data() { return { queue: [], loading: true, snack: false, snackMsg: '', snackColor: 'success' }; },
  computed: {
    waiting() { return this.queue.filter(q => ['waiting','called'].includes(q.status)); },
    currentServing() { return this.queue.find(q => q.status === 'called') || null; },
    queueStats() {
      return [
        { label: 'Total Today', value: this.queue.length + 3, color: 'teal' },
        { label: 'Waiting', value: this.queue.filter(q => q.status === 'waiting').length, color: 'orange' },
        { label: 'Served', value: 3, color: 'green' },
        { label: 'Avg Wait', value: '12m', color: 'blue' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.queue = await stGetQueue(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    refreshLoop() { this.load(); },
    async call(q) {
      try { await stCallQueue(q.id); this.notify(`Calling #${q.queue_number} — ${q.visitor_name}`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async serve(q) {
      try { await stServeQueue(q.id); this.notify(`#${q.queue_number} served.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
