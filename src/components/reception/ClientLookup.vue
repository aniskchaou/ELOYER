<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Client Lookup</h1><p class="body-2 grey--text">Search and view client information quickly from the front desk</p></v-col>
    </v-row>
    <v-card outlined class="mb-4 pa-4">
      <v-text-field v-model="search" label="Search client by name, email or phone…" outlined dense append-icon="mdi-magnify" @input="onSearch" @click:append="doSearch" clearable></v-text-field>
    </v-card>

    <v-row v-if="results.length">
      <v-col v-for="c in results" :key="c.id" cols="12" md="6">
        <v-card outlined class="pa-4" @click="select(c)" style="cursor:pointer" :class="selected && selected.id===c.id ? 'teal lighten-5' : ''">
          <div class="d-flex align-center">
            <v-avatar color="teal" size="44" class="mr-3">
              <span class="white--text subtitle-1 font-weight-bold">{{ c.full_name.charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ c.full_name }}</div>
              <div class="caption grey--text">{{ c.email || 'No email' }} · {{ c.phone || 'No phone' }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Client Detail Panel -->
    <v-card outlined class="pa-4 mt-4" v-if="selected">
      <v-card-title class="subtitle-1 pb-2">{{ selected.full_name }}</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row>
        <v-col cols="12" md="6">
          <div class="caption grey--text">Email</div><div class="body-2 mb-2">{{ selected.email || '—' }}</div>
          <div class="caption grey--text">Phone</div><div class="body-2 mb-2">{{ selected.phone || '—' }}</div>
          <div class="caption grey--text">Created</div><div class="body-2">{{ new Date(selected.created_at).toLocaleDateString() }}</div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="subtitle-2 mb-2">Case Status</div>
          <v-chip small color="blue" dark class="mr-1">{{ caseCounts[selected.id] || 0 }} active cases</v-chip>
          <div class="mt-3">
            <v-btn small outlined color="teal" class="mr-2" to="/reception/booking"><v-icon left small>mdi-calendar-plus</v-icon>Book Appt</v-btn>
            <v-btn small outlined color="blue" to="/reception/intake"><v-icon left small>mdi-clipboard</v-icon>New Intake</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <div v-if="searched && !results.length" class="text-center grey--text mt-8">
      <v-icon large>mdi-account-search</v-icon>
      <p class="mt-2">No clients found for "{{ search }}"</p>
    </div>
  </v-container>
</template>
<script>
export default {
  name: 'ClientLookup',
  data() {
    return {
      search: '', results: [], selected: null, searched: false,
      caseCounts: {},
      allClients: [
        { id: 1, full_name: 'Ahmed Ben Ali', email: 'ahmed.benali@mail.tn', phone: '+216 20 100 001', created_at: new Date(2024,0,15) },
        { id: 2, full_name: 'Société ABC SARL', email: 'contact@abc-sarl.tn', phone: '+216 71 777 777', created_at: new Date(2024,2,1) },
        { id: 3, full_name: 'Leila Mansour', email: 'leila.mansour@mail.tn', phone: '+216 20 100 003', created_at: new Date(2024,5,10) },
      ],
    };
  },
  methods: {
    onSearch() {
      clearTimeout(this._t);
      this._t = setTimeout(() => this.doSearch(), 300);
    },
    doSearch() {
      this.searched = !!this.search;
      const q = (this.search || '').toLowerCase();
      this.results = q
        ? this.allClients.filter(c =>
            c.full_name.toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phone || '').includes(q)
          )
        : [];
    },
    select(c) {
      this.selected = c;
      this.caseCounts = { [c.id]: Math.floor(Math.random() * 3) + 1 };
    },
  },
};
</script>
