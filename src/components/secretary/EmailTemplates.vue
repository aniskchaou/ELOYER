<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Email Templates</h1><p class="body-2 grey--text">Pre-written templates for client correspondence</p></v-col>
      <v-col cols="auto"><v-btn color="pink darken-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>New Template</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined style="min-height:500px">
          <v-card-title class="subtitle-1">Templates</v-card-title>
          <v-divider></v-divider>
          <v-select v-model="catFilter" :items="['All', ...categories]" dense outlined hide-details class="ma-3"></v-select>
          <v-list dense>
            <v-list-item v-for="t in filtered" :key="t.id" @click="select(t)" :class="selected && selected.id===t.id ? 'pink lighten-5':''">
              <v-list-item-icon><v-icon small color="pink">mdi-email</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ t.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-capitalize">{{ t.category }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon x-small @click.stop="open(t)"><v-icon x-small>mdi-pencil</v-icon></v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card outlined class="pa-4" style="min-height:500px">
          <template v-if="selected">
            <div class="subtitle-1 font-weight-bold mb-1">{{ selected.name }}</div>
            <div class="caption grey--text mb-3">Category: {{ selected.category }}</div>
            <div class="overline grey--text">Subject</div>
            <div class="body-1 mb-3 font-weight-medium">{{ selected.subject }}</div>
            <v-divider class="mb-3"></v-divider>
            <div class="overline grey--text">Body</div>
            <pre class="body-2 mt-1" style="white-space:pre-wrap;font-family:inherit">{{ selected.body }}</pre>
            <v-divider class="my-3"></v-divider>
            <div class="overline grey--text">Variables</div>
            <v-chip v-for="v in (selected.variables||[])" :key="v" x-small outlined class="mr-1 mt-1">{{ varTag(v) }}</v-chip>
            <div class="d-flex justify-end mt-4">
              <v-btn small outlined color="blue" class="mr-2" @click="useTemplate"><v-icon left small>mdi-send</v-icon>Use Template</v-btn>
              <v-btn small outlined color="error" @click="del(selected)"><v-icon left small>mdi-delete</v-icon>Delete</v-btn>
            </div>
          </template>
          <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-email-outline</v-icon><p class="mt-2">Select a template to preview</p></div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="620">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Template' : 'New Template' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="8"><v-text-field v-model="form.name" label="Template Name *" outlined dense></v-text-field></v-col>
            <v-col cols="4"><v-select v-model="form.category" :items="['general','appointments','billing','cases','hearings','reminders']" label="Category" outlined dense></v-select></v-col>
            <v-col cols="12"><v-text-field v-model="form.subject" label="Subject *" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.body" label="Body *" outlined rows="8" :hint="bodyHint"></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="pink darken-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetEmailTemplates, stCreateEmailTemplate, stUpdateEmailTemplate, stDeleteEmailTemplate } from '@/services/staffApi';
export default {
  name: 'EmailTemplates',
  data() {
    return {
      templates: [], selected: null, loading: true, dialog: false, editing: null, saving: false, err: '',
      catFilter: 'All',
      form: { name: '', subject: '', body: '', category: 'general' },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  computed: {
    categories() { return [...new Set(this.templates.map(t => t.category))]; },
    filtered() { return this.catFilter === 'All' ? this.templates : this.templates.filter(t => t.category === this.catFilter); },
    bodyHint() { return 'Use ' + '{{' + 'variable_name' + '}}' + ' for placeholders'; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.templates = await stGetEmailTemplates(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    select(t) { this.selected = t; },
    open(t = null) {
      this.editing = t;
      this.form = t ? { name: t.name, subject: t.subject, body: t.body, category: t.category } : { name: '', subject: '', body: '', category: 'general' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.name || !this.form.subject || !this.form.body) { this.err = 'Name, subject and body required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await stUpdateEmailTemplate(this.editing.id, this.form);
        else await stCreateEmailTemplate(this.form);
        this.notify(this.editing ? 'Template updated.' : 'Template created.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async del(t) {
      if (!confirm(`Delete "${t.name}"?`)) return;
      try { await stDeleteEmailTemplate(t.id); this.selected = null; this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    useTemplate() { this.notify('Template copied to composer.'); },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
    varTag(v) { return '{{' + v + '}}'; },
  },
};
</script>
