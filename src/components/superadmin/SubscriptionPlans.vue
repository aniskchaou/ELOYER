<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Subscription Plans</h1>
        <p class="body-2 grey--text">Manage SaaS pricing tiers and feature entitlements</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="deep-purple darken-3" dark @click="openCreate">
          <v-icon left>mdi-plus</v-icon>New Plan
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="plan in plans" :key="plan.id" cols="12" sm="6" md="3">
        <v-card outlined :class="{ 'deep-purple lighten-5': !$vuetify.theme.dark }" :loading="loading">
          <v-card-title class="subtitle-1 font-weight-bold d-flex justify-space-between align-center">
            <span>{{ plan.name }}</span>
            <v-chip small :color="planColor(plan.code)" dark>{{ plan.code }}</v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <div class="text-h4 font-weight-bold">${{ plan.price_monthly }}<span class="body-2 grey--text">/mo</span></div>
            <div class="caption grey--text mb-3">${{ plan.price_yearly }}/yr</div>
            <v-list dense class="pa-0">
              <v-list-item class="px-0"><v-icon small left>mdi-account-group</v-icon><v-list-item-title>{{ plan.max_users }} users</v-list-item-title></v-list-item>
              <v-list-item class="px-0"><v-icon small left>mdi-folder</v-icon><v-list-item-title>{{ plan.max_cases }} cases</v-list-item-title></v-list-item>
              <v-list-item class="px-0"><v-icon small left>mdi-database</v-icon><v-list-item-title>{{ plan.max_storage_gb }} GB storage</v-list-item-title></v-list-item>
              <v-list-item class="px-0"><v-icon small left>mdi-brain</v-icon><v-list-item-title>{{ (plan.ai_tokens_monthly || 0).toLocaleString() }} AI tokens/mo</v-list-item-title></v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-chip x-small :color="plan.tenant_count > 0 ? 'success' : 'grey'" class="mr-auto">{{ plan.tenant_count }} firms</v-chip>
            <v-btn icon small @click="openEdit(plan)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon small @click="toggleActive(plan)">
              <v-icon small :color="plan.is_active ? 'success' : 'grey'">{{ plan.is_active ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off' }}</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit/Create Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Plan' : 'New Plan' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="form.name" label="Plan Name *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.code" label="Code *" outlined dense :disabled="!!editing"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.price_monthly" label="Monthly Price ($)" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.price_yearly" label="Yearly Price ($)" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.max_users" label="Max Users" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.max_cases" label="Max Cases" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.max_storage_gb" label="Storage (GB)" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.ai_tokens_monthly" label="AI Tokens/Month" outlined dense type="number"></v-text-field></v-col>
          </v-row>
          <v-alert v-if="formError" type="error" dense class="mt-2">{{ formError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="deep-purple darken-3" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetPlans, saCreatePlan, saUpdatePlan } from '@/services/superadminApi';
export default {
  name: 'SubscriptionPlans',
  data() {
    return {
      plans: [], loading: true, dialog: false, editing: null, saving: false, formError: '',
      snack: false, snackMsg: '', snackColor: 'success',
      form: { name: '', code: '', price_monthly: 0, price_yearly: 0, max_users: 5, max_cases: 50, max_storage_gb: 5, ai_tokens_monthly: 10000 },
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.plans = await saGetPlans(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() {
      this.editing = null;
      this.form = { name: '', code: '', price_monthly: 0, price_yearly: 0, max_users: 5, max_cases: 50, max_storage_gb: 5, ai_tokens_monthly: 10000 };
      this.formError = ''; this.dialog = true;
    },
    openEdit(plan) {
      this.editing = plan;
      this.form = { name: plan.name, code: plan.code, price_monthly: plan.price_monthly, price_yearly: plan.price_yearly, max_users: plan.max_users, max_cases: plan.max_cases, max_storage_gb: plan.max_storage_gb, ai_tokens_monthly: plan.ai_tokens_monthly };
      this.formError = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.name || !this.form.code) { this.formError = 'Name and code required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await saUpdatePlan(this.editing.id, this.form);
        else await saCreatePlan(this.form);
        this.notify(this.editing ? 'Plan updated.' : 'Plan created.');
        this.dialog = false; this.load();
      } catch (e) { this.formError = e.message; }
      finally { this.saving = false; }
    },
    async toggleActive(plan) {
      try {
        await saUpdatePlan(plan.id, { is_active: !plan.is_active });
        this.notify(`Plan ${plan.is_active ? 'deactivated' : 'activated'}.`);
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
    },
    planColor(code) {
      const m = { starter: 'blue-grey', pro: 'blue', business: 'deep-purple', enterprise: 'deep-orange' };
      return m[code] || 'grey';
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
