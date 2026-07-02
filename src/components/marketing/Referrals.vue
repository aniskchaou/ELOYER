<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Referral Program</h1><p class="body-2 grey--text">Track referrals, referred clients, and rewards</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Referral</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-data-table :headers="headers" :items="referrals" class="elevation-1">
      <template v-slot:item.status="{ item }">
        <v-chip small :color="item.status === 'Converted' ? 'green' : item.status === 'Pending' ? 'orange' : 'red'" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.reward="{ item }">
        <span :class="item.rewardPaid ? 'green--text' : 'orange--text'">{{ item.rewardPaid ? 'Paid' : 'Pending' }} – €{{ item.rewardAmount }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="green" @click="payReward(item)" v-if="item.status === 'Converted' && !item.rewardPaid"><v-icon small>mdi-cash-check</v-icon></v-btn>
        <v-btn icon small color="orange" @click="editR(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-btn icon small color="red" @click="del(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Referral' : 'Add Referral' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.referrerName" label="Referrer Name" outlined dense></v-text-field>
          <v-text-field v-model="form.referredName" label="Referred Person" outlined dense class="mt-3"></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.date" label="Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.status" :items="['Pending', 'Contacted', 'Converted', 'Lost']" label="Status" outlined dense></v-select></v-col>
          </v-row>
          <v-text-field v-model="form.rewardAmount" label="Reward Amount (€)" outlined dense type="number" class="mt-3"></v-text-field>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Referrals',
  data() {
    return {
      dialog: false, editMode: false,
      form: { id: null, referrerName: '', referredName: '', date: '', status: 'Pending', rewardAmount: 100, rewardPaid: false },
      referrals: [
        { id: 1, referrerName: 'Ahmed Ben Ali', referredName: 'Mounir Jebali', date: '2026-04-20', status: 'Converted', rewardAmount: 200, rewardPaid: false },
        { id: 2, referrerName: 'Leila Mansour', referredName: 'Faten Hamouda', date: '2026-05-01', status: 'Pending', rewardAmount: 100, rewardPaid: false },
        { id: 3, referrerName: 'Karim Slim', referredName: 'Nadia Chaker', date: '2026-03-10', status: 'Converted', rewardAmount: 150, rewardPaid: true },
        { id: 4, referrerName: 'Ahmed Ben Ali', referredName: 'Sami Ghorbel', date: '2026-04-05', status: 'Lost', rewardAmount: 0, rewardPaid: false },
      ],
      headers: [
        { text: 'Referrer', value: 'referrerName' }, { text: 'Referred', value: 'referredName' }, { text: 'Date', value: 'date' },
        { text: 'Status', value: 'status' }, { text: 'Reward', value: 'reward' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Total Referrals', value: this.referrals.length, color: 'blue', icon: 'mdi-account-arrow-right' },
        { label: 'Converted', value: this.referrals.filter(r => r.status === 'Converted').length, color: 'green', icon: 'mdi-check-circle' },
        { label: 'Rewards Paid', value: '€' + this.referrals.filter(r => r.rewardPaid).reduce((s, r) => s + Number(r.rewardAmount), 0), color: 'orange', icon: 'mdi-cash' },
        { label: 'Pending Rewards', value: '€' + this.referrals.filter(r => r.status === 'Converted' && !r.rewardPaid).reduce((s, r) => s + Number(r.rewardAmount), 0), color: 'purple', icon: 'mdi-clock' },
      ];
    },
  },
  methods: {
    payReward(r) { r.rewardPaid = true; },
    openAdd() { this.editMode = false; this.form = { id: null, referrerName: '', referredName: '', date: '', status: 'Pending', rewardAmount: 100, rewardPaid: false }; this.dialog = true; },
    editR(r) { this.editMode = true; this.form = { ...r }; this.dialog = true; },
    del(id) { this.referrals = this.referrals.filter(r => r.id !== id); },
    save() {
      if (this.editMode) { const i = this.referrals.findIndex(r => r.id === this.form.id); if (i !== -1) this.referrals.splice(i, 1, { ...this.form }); }
      else this.referrals.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
