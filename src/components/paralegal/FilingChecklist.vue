<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Filing Checklists</h1><p class="body-2 grey--text">Track all required documents and steps for court filings</p></v-col>
      <v-col cols="auto"><v-btn color="teal" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>New Checklist</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col v-for="cl in checklists" :key="cl.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <div>
              <div class="subtitle-2 font-weight-bold">{{ cl.title }}</div>
              <div class="caption grey--text">{{ cl.case_title || 'General' }} · {{ cl.court || 'No court' }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-chip x-small :color="progressColor(cl)" dark>{{ doneCount(cl) }}/{{ cl.items.length }}</v-chip>
          </div>
          <v-progress-linear :value="progressPct(cl)" :color="progressColor(cl)" rounded height="6" class="mb-3"></v-progress-linear>
          <div v-if="cl.filing_deadline" class="caption mb-2" :class="isPast(cl.filing_deadline) ? 'red--text' : 'grey--text'">
            <v-icon x-small>mdi-calendar-alert</v-icon>
            Deadline: {{ new Date(cl.filing_deadline).toLocaleDateString() }}
          </div>
          <v-list dense class="pa-0">
            <v-list-item v-for="item in cl.items" :key="item.id" class="px-0" style="min-height:36px">
              <v-list-item-icon class="mr-2" style="min-width:28px">
                <v-checkbox v-model="item.is_done" dense hide-details class="mt-0 pt-0" @change="toggle(item)"></v-checkbox>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title :class="item.is_done ? 'text-decoration-line-through grey--text' : ''">
                  {{ item.label }}
                  <v-chip v-if="item.is_required" x-small color="red" dark class="ml-1">Required</v-chip>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="!loading && !checklists.length" type="info" outlined class="mt-4">No filing checklists yet.</v-alert>

    <v-dialog v-model="dialog" max-width="580">
      <v-card>
        <v-card-title>New Filing Checklist</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.title" label="Checklist Title *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.court" label="Court" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.filing_deadline" label="Filing Deadline" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-card-subtitle class="px-0 pb-1">Checklist Items</v-card-subtitle>
          <div v-for="(item, i) in form.items" :key="i" class="d-flex align-center mb-2">
            <v-text-field v-model="item.label" :placeholder="`Item ${i+1}`" outlined dense hide-details class="flex-grow-1 mr-2"></v-text-field>
            <v-checkbox v-model="item.is_required" label="Req." dense hide-details class="mr-1"></v-checkbox>
            <v-btn icon small color="error" @click="form.items.splice(i,1)"><v-icon small>mdi-minus</v-icon></v-btn>
          </div>
          <v-btn small outlined @click="form.items.push({label:'',is_required:true})"><v-icon left small>mdi-plus</v-icon>Add Item</v-btn>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="teal" dark :loading="saving" @click="save">Create</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetChecklists, stCreateChecklist, stUpdateChecklistItem } from '@/services/staffApi';
export default {
  name: 'FilingChecklist',
  data() {
    return {
      checklists: [], loading: true, dialog: false, saving: false, err: '',
      form: { case_id: 1, created_by: 1, title: '', court: '', filing_deadline: '', items: [{ label: '', is_required: true }] },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.checklists = await stGetChecklists(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() {
      this.form = { case_id: 1, created_by: 1, title: '', court: '', filing_deadline: '', items: [{ label: 'Prepare cover sheet', is_required: true }, { label: 'Attach certified copies', is_required: true }, { label: 'Pay filing fee', is_required: true }] };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try { await stCreateChecklist(this.form); this.notify('Checklist created.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async toggle(item) {
      try { await stUpdateChecklistItem(item.id, { is_done: item.is_done }); }
      catch (e) { item.is_done = !item.is_done; this.notify(e.message, 'error'); }
    },
    doneCount(cl) { return cl.items.filter(i => i.is_done).length; },
    progressPct(cl) { return cl.items.length ? Math.round((this.doneCount(cl) / cl.items.length) * 100) : 0; },
    progressColor(cl) { const p = this.progressPct(cl); return p === 100 ? 'success' : p > 50 ? 'blue' : 'orange'; },
    isPast(d) { return new Date(d) < new Date(); },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
