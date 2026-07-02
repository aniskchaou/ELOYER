<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Pricing Configuration</h1><p class="body-2 grey--text">Set billing rates for your firm's legal services</p></v-col>
      <v-col cols="auto"><v-btn color="red lighten-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>Add Service</v-btn></v-col>
    </v-row>
    <v-card outlined>
      <v-data-table :headers="headers" :items="pricing" :loading="loading" class="elevation-0">
        <template v-slot:item.rate="{ item }">
          <strong>{{ item.rate }} {{ item.currency }}</strong> / {{ item.billing_type }}
        </template>
        <template v-slot:item.billing_type="{ item }">
          <v-chip small outlined>{{ item.billing_type }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="error" @click="del(item)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Service' : 'Add Service' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.service_name" label="Service Name *" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.billing_type" :items="billingTypes" label="Billing Type" outlined dense class="mb-2"></v-select>
          <v-row dense>
            <v-col cols="8"><v-text-field v-model.number="form.rate" label="Rate" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="4"><v-select v-model="form.currency" :items="['TND','EUR','USD']" label="Currency" outlined dense></v-select></v-col>
          </v-row>
          <v-textarea v-model="form.notes" label="Notes" outlined rows="2" auto-grow></v-textarea>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="red lighten-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Add' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetPricing, faCreatePricing, faUpdatePricing, faDeletePricing } from '@/services/firmadminApi';
export default {
  name: 'PricingConfig',
  data() {
    return {
      pricing: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { service_name: '', billing_type: 'hourly', rate: 0, currency: 'TND', notes: '' },
      billingTypes: ['hourly', 'daily', 'fixed', 'retainer', 'contingency'],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Service', value: 'service_name' },
        { text: 'Type', value: 'billing_type' },
        { text: 'Rate', value: 'rate' },
        { text: 'Notes', value: 'notes' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.pricing = await faGetPricing(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(p = null) {
      this.editing = p;
      this.form = p ? { service_name: p.service_name, billing_type: p.billing_type, rate: p.rate, currency: p.currency, notes: p.notes } : { service_name: '', billing_type: 'hourly', rate: 0, currency: 'TND', notes: '' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.service_name) { this.err = 'Service name required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await faUpdatePricing(this.editing.id, this.form);
        else await faCreatePricing(this.form);
        this.notify(this.editing ? 'Updated.' : 'Service added.'); this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async del(p) {
      if (!confirm('Delete this pricing entry?')) return;
      try { await faDeletePricing(p.id); this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
