<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Law Firms (Tenants)</h1>
        <p class="body-2 grey--text">Create, manage and monitor all registered law firms</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="deep-purple darken-3" dark @click="openCreate">
          <v-icon left>mdi-plus</v-icon>New Firm
        </v-btn>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search firms…" single-line hide-details dense outlined style="max-width:300px"></v-text-field>
        <v-spacer></v-spacer>
        <v-chip-group v-model="statusFilter" mandatory active-class="deep-purple darken-3 white--text">
          <v-chip value="">All</v-chip>
          <v-chip value="active">Active</v-chip>
          <v-chip value="suspended">Suspended</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="filtered"
        :loading="loading"
        :search="search"
        class="elevation-0"
      >
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'active' ? 'success' : 'error'" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.plan_name="{ item }">
          <v-chip small :color="planColor(item.plan_code)" dark>{{ item.plan_name || '—' }}</v-chip>
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString() }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="openEdit(item)" title="Edit"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small :color="item.status === 'active' ? 'warning' : 'success'" @click="toggleStatus(item)" :title="item.status === 'active' ? 'Suspend' : 'Activate'">
            <v-icon small>{{ item.status === 'active' ? 'mdi-pause-circle' : 'mdi-play-circle' }}</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="confirmDelete(item)" title="Delete"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Firm' : 'New Law Firm' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="Firm Name *" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.slug" label="Slug *" outlined dense :disabled="!!editing" hint="URL-friendly ID"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Contact Email *" outlined dense type="email"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.phone" label="Phone" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.address" label="Address" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.country" label="Country" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.plan_id" :items="plans" item-text="name" item-value="id" label="Subscription Plan" outlined dense clearable></v-select>
            </v-col>
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

    <!-- Confirm Delete -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Firm?</v-card-title>
        <v-card-text>This will permanently remove <strong>{{ deleteTarget && deleteTarget.name }}</strong>. This cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="saving" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetTenants, saGetPlans, saCreateTenant, saUpdateTenant, saSuspendTenant, saActivateTenant, saDeleteTenant } from '@/services/superadminApi';
export default {
  name: 'TenantManagement',
  data() {
    return {
      tenants: [], plans: [], loading: true, search: '', statusFilter: '',
      dialog: false, editing: null, saving: false, formError: '',
      deleteDialog: false, deleteTarget: null,
      snack: false, snackMsg: '', snackColor: 'success',
      form: { name: '', slug: '', email: '', phone: '', address: '', country: 'TN', plan_id: null },
      headers: [
        { text: 'Firm Name', value: 'name' },
        { text: 'Slug', value: 'slug' },
        { text: 'Email', value: 'email' },
        { text: 'Plan', value: 'plan_name' },
        { text: 'Status', value: 'status' },
        { text: 'Created', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() {
      if (!this.statusFilter) return this.tenants;
      return this.tenants.filter(t => t.status === this.statusFilter);
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        [this.tenants, this.plans] = await Promise.all([saGetTenants(), saGetPlans()]);
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() {
      this.editing = null;
      this.form = { name: '', slug: '', email: '', phone: '', address: '', country: 'TN', plan_id: null };
      this.formError = '';
      this.dialog = true;
    },
    openEdit(item) {
      this.editing = item;
      this.form = { name: item.name, slug: item.slug, email: item.email, phone: item.phone, address: item.address, country: item.country, plan_id: item.plan_id };
      this.formError = '';
      this.dialog = true;
    },
    async save() {
      if (!this.form.name || !this.form.slug || !this.form.email) {
        this.formError = 'Name, slug and email are required.'; return;
      }
      this.saving = true;
      try {
        if (this.editing) {
          await saUpdateTenant(this.editing.id, this.form);
          this.notify('Firm updated.');
        } else {
          await saCreateTenant(this.form);
          this.notify('Firm created.', 'success');
        }
        this.dialog = false;
        this.load();
      } catch (e) { this.formError = e.message; }
      finally { this.saving = false; }
    },
    async toggleStatus(item) {
      try {
        if (item.status === 'active') await saSuspendTenant(item.id);
        else await saActivateTenant(item.id);
        this.notify(`Firm ${item.status === 'active' ? 'suspended' : 'activated'}.`);
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
    },
    confirmDelete(item) { this.deleteTarget = item; this.deleteDialog = true; },
    async doDelete() {
      this.saving = true;
      try {
        await saDeleteTenant(this.deleteTarget.id);
        this.deleteDialog = false;
        this.notify('Firm deleted.', 'error');
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    planColor(code) {
      const m = { starter: 'blue-grey', pro: 'blue', business: 'deep-purple', enterprise: 'deep-orange' };
      return m[code] || 'grey';
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
