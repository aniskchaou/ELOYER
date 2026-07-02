<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Webhooks</h1><p class="body-2 grey--text">Receive real-time event notifications to external systems</p></v-col>
      <v-col cols="auto"><v-btn color="indigo darken-2" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>Add Webhook</v-btn></v-col>
    </v-row>

    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="webhooks" dense class="elevation-0">
        <template v-slot:item.is_active="{ item }"><v-chip x-small :color="item.is_active ? 'success' : 'grey'" dark>{{ item.is_active ? 'Active' : 'Paused' }}</v-chip></template>
        <template v-slot:item.events="{ item }">
          <v-chip v-for="e in (item.events || []).slice(0,2)" :key="e" x-small outlined class="mr-1">{{ e }}</v-chip>
          <span v-if="(item.events || []).length > 2" class="caption grey--text">+{{ item.events.length - 2 }}</span>
        </template>
        <template v-slot:item.last_triggered_at="{ item }">{{ item.last_triggered_at ? new Date(item.last_triggered_at).toLocaleString() : 'Never' }}</template>
        <template v-slot:item.last_status="{ item }">
          <v-chip x-small v-if="item.last_status" :color="item.last_status === 200 ? 'success' : 'error'" dark>{{ item.last_status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="test(item)" title="Test" :loading="testing === item.id"><v-icon small>mdi-play</v-icon></v-btn>
          <v-btn icon small @click="openEdit(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="error" @click="del(item)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Webhook' : 'New Webhook' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Webhook Name *" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.url" label="Endpoint URL *" outlined dense class="mb-2" placeholder="https://your-app.com/webhooks/eloyer"></v-text-field>
          <v-select v-model="form.events" :items="eventTypes" label="Events to Subscribe" multiple outlined dense chips small-chips deletable-chips></v-select>
          <v-switch v-model="form.is_active" label="Active" inset hide-details v-if="editing"></v-switch>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="indigo darken-2" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetWebhooks, entCreateWebhook, entUpdateWebhook, entDeleteWebhook, entTestWebhook } from '@/services/enterpriseApi';
export default {
  name: 'WebhooksManager',
  data() {
    return {
      webhooks: [], loading: true, dialog: false, editing: null, saving: false, testing: null, err: '',
      form: { name: '', url: '', events: [], is_active: true },
      eventTypes: ['case.created','case.updated','case.closed','invoice.created','invoice.paid','document.uploaded','hearing.scheduled','client.created','user.login'],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Name', value: 'name' }, { text: 'URL', value: 'url' }, { text: 'Events', value: 'events' },
        { text: 'Status', value: 'is_active' }, { text: 'Last HTTP', value: 'last_status' },
        { text: 'Last Triggered', value: 'last_triggered_at' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.webhooks = await entGetWebhooks(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() { this.editing = null; this.form = { name: '', url: '', events: ['case.created'], is_active: true }; this.err = ''; this.dialog = true; },
    openEdit(w) { this.editing = w; this.form = { name: w.name, url: w.url, events: w.events || [], is_active: w.is_active }; this.err = ''; this.dialog = true; },
    async save() {
      if (!this.form.name || !this.form.url) { this.err = 'Name and URL required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await entUpdateWebhook(this.editing.id, this.form);
        else await entCreateWebhook(this.form);
        this.notify(this.editing ? 'Updated.' : 'Webhook created.'); this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async test(w) {
      this.testing = w.id;
      try { await entTestWebhook(w.id); this.notify('Test event sent — HTTP 200.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.testing = null; }
    },
    async del(w) {
      if (!confirm(`Delete webhook "${w.name}"?`)) return;
      try { await entDeleteWebhook(w.id); this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
