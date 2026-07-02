<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Billing Management</h1>
        <p class="body-2 grey--text">Platform revenue overview and payment gateway configuration</p>
      </v-col>
    </v-row>

    <!-- Revenue KPIs -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Total Revenue</div>
          <div class="text-h4 font-weight-bold green--text">${{ Number(billing.revenue && billing.revenue.total || 0).toLocaleString() }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Paid</div>
          <div class="text-h4 font-weight-bold teal--text">${{ Number(billing.revenue && billing.revenue.paid || 0).toLocaleString() }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Pending</div>
          <div class="text-h4 font-weight-bold orange--text">${{ Number(billing.revenue && billing.revenue.pending || 0).toLocaleString() }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Monthly Trend -->
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Monthly Revenue Trend</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="m in (billing.monthly_trend || [])" :key="m.month">
              <v-list-item-content><v-list-item-title>{{ m.month }}</v-list-item-title></v-list-item-content>
              <v-list-item-action>
                <v-chip small color="green" dark>${{ m.revenue.toLocaleString() }}</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Payment Gateways -->
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Payment Gateways</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list>
            <v-list-item v-for="gw in (billing.payment_gateways || [])" :key="gw.name">
              <v-list-item-avatar :color="gw.connected ? 'success' : 'grey'" size="36">
                <v-icon dark small>{{ gw.name === 'Stripe' ? 'mdi-credit-card' : 'mdi-paypal' }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ gw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ gw.connected ? 'Connected' : 'Not connected' }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn small outlined :color="gw.connected ? 'error' : 'success'">
                  {{ gw.connected ? 'Disconnect' : 'Connect' }}
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-alert type="info" dense outlined class="mt-3 caption">
            Connect Stripe or PayPal to enable automated subscription billing and renewal.
          </v-alert>
        </v-card>
      </v-col>

      <!-- Tenant Billing -->
      <v-col cols="12">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Tenant Billing Summary</v-card-title>
          <v-data-table
            :headers="headers"
            :items="billing.tenants || []"
            class="elevation-0"
            dense
          >
            <template v-slot:item.status="{ item }">
              <v-chip x-small :color="item.status === 'active' ? 'success' : 'error'" dark>{{ item.status }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { saGetBilling } from '@/services/superadminApi';
export default {
  name: 'BillingManagement',
  data() {
    return {
      billing: {}, loading: true,
      headers: [
        { text: 'Firm', value: 'name' },
        { text: 'Status', value: 'status' },
        { text: 'Plan', value: 'plan' },
        { text: 'Monthly ($)', value: 'price_monthly' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.billing = await saGetBilling(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
