<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Office Locations</h1><p class="body-2 grey--text">Manage your firm's offices and branches</p></v-col>
      <v-col cols="auto"><v-btn color="red lighten-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>Add Location</v-btn></v-col>
    </v-row>
    <v-row>
      <v-col v-for="loc in locations" :key="loc.id" cols="12" md="4">
        <v-card outlined class="pa-4" :class="loc.is_hq ? 'red lighten-5' : ''">
          <div class="d-flex align-center mb-2">
            <v-icon :color="loc.is_hq ? 'red' : 'grey'" class="mr-2">mdi-map-marker</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ loc.name }}</div>
            <v-spacer></v-spacer>
            <v-chip v-if="loc.is_hq" x-small color="red" dark class="mr-1">HQ</v-chip>
            <v-btn icon small @click="open(loc)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon small color="error" @click="del(loc)"><v-icon small>mdi-delete</v-icon></v-btn>
          </div>
          <div class="body-2">{{ loc.address }}, {{ loc.city }}</div>
          <div class="caption grey--text">{{ loc.country }} · {{ loc.phone || 'No phone' }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Location' : 'New Location' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.name" label="Location Name *" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="form.address" label="Street Address" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.city" label="City" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.country" label="Country" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.phone" label="Phone" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-switch v-model="form.is_hq" label="Headquarters" inset hide-details></v-switch></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="red lighten-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetLocations, faCreateLocation, faUpdateLocation, faDeleteLocation } from '@/services/firmadminApi';
export default {
  name: 'OfficeLocations',
  data() {
    return {
      locations: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { name: '', address: '', city: '', country: 'TN', phone: '', is_hq: false },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.locations = await faGetLocations(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(loc = null) {
      this.editing = loc;
      this.form = loc ? { name: loc.name, address: loc.address, city: loc.city, country: loc.country, phone: loc.phone, is_hq: loc.is_hq } : { name: '', address: '', city: '', country: 'TN', phone: '', is_hq: false };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.name) { this.err = 'Name required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await faUpdateLocation(this.editing.id, this.form);
        else await faCreateLocation(this.form);
        this.notify(this.editing ? 'Location updated.' : 'Location added.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async del(loc) {
      if (!confirm(`Delete "${loc.name}"?`)) return;
      try { await faDeleteLocation(loc.id); this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
