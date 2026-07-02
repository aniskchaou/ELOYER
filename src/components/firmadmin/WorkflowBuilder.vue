<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Workflow Builder</h1><p class="body-2 grey--text">Create automated workflows to standardize your firm's processes</p></v-col>
      <v-col cols="auto"><v-btn color="red lighten-1" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>New Workflow</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col v-for="wf in workflows" :key="wf.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-icon :color="wf.is_active ? 'green' : 'grey'" class="mr-2">mdi-arrow-decision</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ wf.name }}</div>
            <v-spacer></v-spacer>
            <v-switch v-model="wf.is_active" inset hide-details dense @change="toggleWf(wf)"></v-switch>
            <v-btn icon small @click="openEdit(wf)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon small color="error" @click="del(wf)"><v-icon small>mdi-delete</v-icon></v-btn>
          </div>
          <div class="caption grey--text mb-2">Trigger: <strong>{{ wf.trigger_event || 'Manual' }}</strong></div>
          <p class="body-2 mb-2">{{ wf.description }}</p>
          <v-divider class="my-2"></v-divider>
          <div class="d-flex flex-wrap">
            <v-chip v-for="(step, i) in wf.steps" :key="i" x-small outlined class="mr-1 mb-1">
              {{ i + 1 }}. {{ step.label }}
            </v-chip>
            <span v-if="!wf.steps || !wf.steps.length" class="caption grey--text">No steps defined</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="620">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Workflow' : 'New Workflow' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Workflow Name *" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="form.description" label="Description" outlined rows="2" auto-grow class="mb-2"></v-textarea>
          <v-select v-model="form.trigger_event" :items="triggerEvents" label="Trigger Event" outlined dense clearable class="mb-3"></v-select>
          <v-card-subtitle class="px-0 pb-1">Steps</v-card-subtitle>
          <div v-for="(step, i) in form.steps" :key="i" class="d-flex align-center mb-2">
            <v-chip small class="mr-2">{{ i + 1 }}</v-chip>
            <v-select v-model="step.step_type" :items="stepTypes" outlined dense hide-details class="mr-2" style="max-width:140px"></v-select>
            <v-text-field v-model="step.label" placeholder="Step label" outlined dense hide-details class="flex-grow-1 mr-2"></v-text-field>
            <v-btn icon small color="error" @click="removeStep(i)"><v-icon small>mdi-minus</v-icon></v-btn>
          </div>
          <v-btn small outlined @click="addStep"><v-icon left small>mdi-plus</v-icon>Add Step</v-btn>
          <v-alert v-if="err" type="error" dense class="mt-3">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="red lighten-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetWorkflows, faCreateWorkflow, faUpdateWorkflow, faDeleteWorkflow } from '@/services/firmadminApi';
export default {
  name: 'WorkflowBuilder',
  data() {
    return {
      workflows: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { name: '', description: '', trigger_event: null, steps: [] },
      triggerEvents: ['case.created','case.closed','invoice.created','document.uploaded','hearing.scheduled','manual'],
      stepTypes: ['task','notify','review','approve','email','wait'],
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.workflows = await faGetWorkflows(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() {
      this.editing = null;
      this.form = { name: '', description: '', trigger_event: null, steps: [{ step_type: 'task', label: '' }] };
      this.err = ''; this.dialog = true;
    },
    openEdit(wf) {
      this.editing = wf;
      this.form = { name: wf.name, description: wf.description, trigger_event: wf.trigger_event, steps: wf.steps.map(s => ({ ...s })) };
      this.err = ''; this.dialog = true;
    },
    addStep() { this.form.steps.push({ step_type: 'task', label: '' }); },
    removeStep(i) { this.form.steps.splice(i, 1); },
    async save() {
      if (!this.form.name) { this.err = 'Name required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await faUpdateWorkflow(this.editing.id, this.form);
        else await faCreateWorkflow(this.form);
        this.notify(this.editing ? 'Workflow updated.' : 'Workflow created.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async toggleWf(wf) {
      try { await faUpdateWorkflow(wf.id, { is_active: wf.is_active }); this.notify(`Workflow ${wf.is_active ? 'activated' : 'deactivated'}.`); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async del(wf) {
      if (!confirm(`Delete workflow "${wf.name}"?`)) return;
      try { await faDeleteWorkflow(wf.id); this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
