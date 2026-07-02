<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Automation Rules</h1><p class="body-2 grey--text">Automate repetitive tasks with trigger-based rules</p></v-col>
      <v-col cols="auto"><v-btn color="purple darken-1" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>New Rule</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col v-for="rule in rules" :key="rule.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-icon :color="rule.is_active ? 'purple' : 'grey'" class="mr-2">mdi-robot</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ rule.name }}</div>
            <v-spacer></v-spacer>
            <v-switch v-model="rule.is_active" inset hide-details dense @change="toggle(rule)"></v-switch>
            <v-btn icon small @click="openEdit(rule)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon small color="error" @click="del(rule)"><v-icon small>mdi-delete</v-icon></v-btn>
          </div>
          <div class="caption grey--text mb-2">Trigger: <strong>{{ rule.trigger_event }}</strong> · Runs: {{ rule.run_count }}</div>
          <p class="body-2 mb-2">{{ rule.description }}</p>
          <div class="d-flex flex-wrap">
            <v-chip v-for="a in (rule.actions || [])" :key="a.id" x-small outlined class="mr-1 mb-1">{{ a.action_type }}</v-chip>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" v-if="!loading && !rules.length">
        <v-alert type="info" outlined>No automation rules yet. Create your first rule to automate workflow tasks.</v-alert>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="620">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Rule' : 'New Automation Rule' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Rule Name *" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="form.description" label="Description" outlined rows="2" auto-grow class="mb-2"></v-textarea>
          <v-select v-model="form.trigger_event" :items="triggers" label="Trigger Event *" outlined dense class="mb-3"></v-select>
          <v-card-subtitle class="px-0 pb-1">Actions</v-card-subtitle>
          <div v-for="(action, i) in form.actions" :key="i" class="d-flex align-center mb-2">
            <v-select v-model="action.action_type" :items="actionTypes" outlined dense hide-details class="mr-2" style="max-width:200px"></v-select>
            <v-text-field v-model="action.note" placeholder="Notes" outlined dense hide-details class="flex-grow-1 mr-2"></v-text-field>
            <v-btn icon small color="error" @click="form.actions.splice(i,1)"><v-icon small>mdi-minus</v-icon></v-btn>
          </div>
          <v-btn small outlined @click="form.actions.push({ action_type: 'send_notification', note: '' })"><v-icon left small>mdi-plus</v-icon>Add Action</v-btn>
          <v-alert v-if="err" type="error" dense class="mt-3">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="purple darken-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetAutomation, entCreateAutomation, entUpdateAutomation, entDeleteAutomation } from '@/services/enterpriseApi';
export default {
  name: 'AutomationRules',
  data() {
    return {
      rules: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { name: '', description: '', trigger_event: 'case.created', actions: [{ action_type: 'send_notification', note: '' }] },
      triggers: ['case.created','case.closed','invoice.created','invoice.paid','invoice.overdue','document.uploaded','hearing.scheduled','client.created','deadline.due'],
      actionTypes: ['send_notification','send_email','create_task','send_sms','trigger_webhook','assign_lawyer','update_status','generate_invoice'],
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.rules = await entGetAutomation(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() { this.editing = null; this.form = { name: '', description: '', trigger_event: 'case.created', actions: [{ action_type: 'send_notification', note: '' }] }; this.err = ''; this.dialog = true; },
    openEdit(r) { this.editing = r; this.form = { name: r.name, description: r.description, trigger_event: r.trigger_event, actions: (r.actions || []).map(a => ({ ...a })) }; this.err = ''; this.dialog = true; },
    async save() {
      if (!this.form.name || !this.form.trigger_event) { this.err = 'Name and trigger required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await entUpdateAutomation(this.editing.id, this.form);
        else await entCreateAutomation({ ...this.form, created_by: 1 });
        this.notify(this.editing ? 'Updated.' : 'Rule created.'); this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async toggle(r) {
      try { await entUpdateAutomation(r.id, { is_active: r.is_active }); this.notify(`Rule ${r.is_active ? 'activated' : 'paused'}.`); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async del(r) {
      if (!confirm(`Delete rule "${r.name}"?`)) return;
      try { await entDeleteAutomation(r.id); this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
