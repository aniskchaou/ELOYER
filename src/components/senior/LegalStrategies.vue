<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Legal Strategies</h1><p class="body-2 grey--text">Plan and manage legal approaches for each case</p></v-col>
      <v-col cols="auto"><v-btn color="indigo" dark @click="open()"><v-icon left>mdi-plus</v-icon>New Strategy</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col v-for="s in strategies" :key="s.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-chip small :color="typeColor(s.strategy_type)" dark class="mr-2">{{ s.strategy_type }}</v-chip>
            <div class="subtitle-2 font-weight-bold">{{ s.title }}</div>
            <v-spacer></v-spacer>
            <v-chip x-small :color="statusColor(s.status)" dark class="mr-2">{{ s.status }}</v-chip>
            <v-btn icon small @click="open(s)"><v-icon small>mdi-pencil</v-icon></v-btn>
          </div>
          <div class="caption grey--text mb-1">Case: {{ s.case_title || '—' }} · By: {{ s.lawyer_name }}</div>
          <p class="body-2 mb-2" v-if="s.description">{{ s.description }}</p>
          <v-row v-if="s.strengths || s.weaknesses" dense class="mt-1">
            <v-col cols="6" v-if="s.strengths">
              <div class="caption green--text font-weight-bold">Strengths</div>
              <p class="caption">{{ s.strengths }}</p>
            </v-col>
            <v-col cols="6" v-if="s.weaknesses">
              <div class="caption red--text font-weight-bold">Weaknesses</div>
              <p class="caption">{{ s.weaknesses }}</p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="620">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Strategy' : 'New Strategy' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.title" label="Title *" outlined dense></v-text-field></v-col>
            <v-col cols="6">
              <v-select v-model="form.strategy_type" :items="['defense','offense','settlement','motion','appeal','negotiation']" label="Strategy Type" outlined dense></v-select>
            </v-col>
            <v-col cols="6">
              <v-select v-model="form.status" :items="['draft','active','on_hold','archived']" label="Status" outlined dense></v-select>
            </v-col>
            <v-col cols="12"><v-textarea v-model="form.description" label="Description" outlined rows="2" auto-grow></v-textarea></v-col>
            <v-col cols="6"><v-textarea v-model="form.strengths" label="Strengths" outlined rows="2" auto-grow></v-textarea></v-col>
            <v-col cols="6"><v-textarea v-model="form.weaknesses" label="Weaknesses" outlined rows="2" auto-grow></v-textarea></v-col>
            <v-col cols="12"><v-textarea v-model="form.recommendations" label="Recommendations" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="indigo" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetStrategies, faCreateStrategy, faUpdateStrategy } from '@/services/firmadminApi';
export default {
  name: 'LegalStrategies',
  data() {
    return {
      strategies: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { case_id: 1, lawyer_id: 1, title: '', strategy_type: 'defense', description: '', strengths: '', weaknesses: '', recommendations: '', status: 'draft' },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.strategies = await faGetStrategies(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(s = null) {
      this.editing = s;
      this.form = s ? { ...s } : { case_id: 1, lawyer_id: 1, title: '', strategy_type: 'defense', description: '', strengths: '', weaknesses: '', recommendations: '', status: 'draft' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await faUpdateStrategy(this.editing.id, this.form);
        else await faCreateStrategy(this.form);
        this.notify(this.editing ? 'Strategy updated.' : 'Strategy created.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    typeColor(t) { const m = { defense:'blue', offense:'red', settlement:'green', motion:'orange', appeal:'purple', negotiation:'teal' }; return m[t] || 'grey'; },
    statusColor(s) { const m = { draft:'grey', active:'success', on_hold:'warning', archived:'blue-grey' }; return m[s] || 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
