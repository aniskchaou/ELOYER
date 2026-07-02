<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Firm Profile</h1><p class="body-2 grey--text">Manage your law firm's public and administrative information</p></v-col>
      <v-col cols="auto"><v-btn color="red lighten-1" dark :loading="saving" @click="save"><v-icon left>mdi-content-save</v-icon>Save</v-btn></v-col>
    </v-row>
    <v-skeleton-loader v-if="loading" type="card, card"></v-skeleton-loader>
    <v-row v-else>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Basic Information</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="form.name" label="Firm Name *" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.tagline" label="Tagline" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.bar_number" label="Bar Registration Number" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model.number="form.founded_year" label="Founded Year" outlined dense type="number" class="mb-2"></v-text-field>
          <v-combobox v-model="form.specializations" label="Specializations" multiple outlined dense chips small-chips deletable-chips></v-combobox>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Contact & Online</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="form.email" label="Contact Email" outlined dense type="email" class="mb-2"></v-text-field>
          <v-text-field v-model="form.phone" label="Phone" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.website" label="Website URL" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="form.address" label="Head Office Address" outlined rows="3" auto-grow></v-textarea>
        </v-card>
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Branding</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="form.logo_url" label="Logo URL" outlined dense class="mb-2"></v-text-field>
          <v-img v-if="form.logo_url" :src="form.logo_url" max-height="80" contain class="mt-2"></v-img>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetProfile, faUpdateProfile } from '@/services/firmadminApi';
export default {
  name: 'FirmProfile',
  data() {
    return {
      form: { name: '', tagline: '', email: '', phone: '', address: '', website: '', bar_number: '', founded_year: null, specializations: [], logo_url: '' },
      loading: true, saving: false, snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        const p = await faGetProfile();
        if (p && p.name) this.form = { ...this.form, ...p, specializations: p.specializations || [] };
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async save() {
      if (!this.form.name) { this.notify('Firm name is required.', 'error'); return; }
      this.saving = true;
      try { await faUpdateProfile(this.form); this.notify('Firm profile saved.'); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
