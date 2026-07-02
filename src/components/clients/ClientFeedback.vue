<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Client Satisfaction & Feedback</h1>
        <p class="body-2 grey--text">Track client satisfaction, reviews, and improvement areas</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="requestDialog = true">
          <v-icon left>mdi-send</v-icon> Request Feedback
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4 text-center">
          <div class="overline">Avg. Rating</div>
          <p class="text-h4 font-weight-bold amber--text">{{ avgRating }}</p>
          <v-rating :value="parseFloat(avgRating)" readonly dense color="amber" background-color="grey lighten-2" half-increments size="18"></v-rating>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4 text-center">
          <div class="overline">Total Reviews</div>
          <p class="text-h4 font-weight-bold blue--text">{{ feedback.length }}</p>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4 text-center">
          <div class="overline">5-Star Reviews</div>
          <p class="text-h4 font-weight-bold green--text">{{ countByRating(5) }}</p>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4 text-center">
          <div class="overline">Need Attention</div>
          <p class="text-h4 font-weight-bold red--text">{{ countNeedAttention() }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Rating distribution -->
    <v-card outlined class="mb-4 pa-4">
      <v-card-title class="pb-2">Rating Distribution</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <div v-for="n in [5,4,3,2,1]" :key="n" class="d-flex align-center mb-2">
        <span class="caption mr-2" style="width:20px">{{ n }}</span>
        <v-icon small color="amber" class="mr-2">mdi-star</v-icon>
        <v-progress-linear :value="ratingPct(n)" height="12" rounded :color="n >= 4 ? 'green' : n === 3 ? 'orange' : 'red'" class="mr-3" style="max-width:300px"></v-progress-linear>
        <span class="caption grey--text">{{ countByRating(n) }}</span>
      </div>
    </v-card>

    <!-- Feedback list -->
    <v-card outlined>
      <v-card-title>Recent Feedback
        <v-spacer></v-spacer>
        <v-select v-model="filterRating" :items="[5,4,3,2,1]" label="Filter by rating" outlined dense clearable style="max-width:200px" class="mr-2"></v-select>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense style="max-width:200px"></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-list>
        <template v-for="(item, i) in filteredFeedback">
          <v-list-item :key="item.id" class="py-2">
            <v-list-item-avatar color="primary">
              <span class="white--text caption">{{ initials(item.client) }}</span>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">{{ item.client }}</v-list-item-title>
              <v-rating :value="item.rating" readonly dense color="amber" background-color="grey lighten-2" size="14" class="mb-1"></v-rating>
              <v-list-item-subtitle class="body-2">{{ item.comment }}</v-list-item-subtitle>
              <v-list-item-subtitle class="caption grey--text mt-1">{{ item.case }} · {{ item.date }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon small color="blue" @click="replyTo(item)"><v-icon small>mdi-reply</v-icon></v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider :key="'d'+i"></v-divider>
        </template>
      </v-list>
    </v-card>

    <!-- Request Dialog -->
    <v-dialog v-model="requestDialog" max-width="480px">
      <v-card>
        <v-card-title>Request Feedback</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="reqForm.client" :items="clientNames" label="Client" outlined dense></v-select>
          <v-select v-model="reqForm.case" :items="caseNames" label="Case" outlined dense class="mt-3"></v-select>
          <v-textarea v-model="reqForm.message" label="Custom Message (optional)" outlined rows="3" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="requestDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="sendRequest">Send Request</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" timeout="3000" color="success">Feedback request sent!</v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'ClientFeedback',
  data() {
    return {
      search: '', filterRating: null, requestDialog: false, snackbar: false,
      reqForm: { client: '', case: '', message: '' },
      clientNames: ['Ahmed Ben Ali', 'Société ABC SARL', 'Leila Mansour', 'ONG HelpAid'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Criminal Appeal – Jane Smith', 'Property Dispute – Ben Ali'],
      feedback: [
        { id: 1, client: 'Ahmed Ben Ali', rating: 5, comment: 'Excellent service, very professional and responsive. Highly recommended!', case: 'Property Dispute', date: '2026-04-15' },
        { id: 2, client: 'Société ABC SARL', rating: 4, comment: 'Good work overall. Communication could be slightly faster.', case: 'Corporate Merger', date: '2026-03-20' },
        { id: 3, client: 'Leila Mansour', rating: 5, comment: 'Outstanding representation. Won the case, very happy!', case: 'Labor Dispute', date: '2026-02-10' },
        { id: 4, client: 'ONG HelpAid', rating: 3, comment: 'Decent support but expected more updates on case progress.', case: 'NGO Registration', date: '2026-01-05' },
      ],
    };
  },
  computed: {
    avgRating() {
      if (!this.feedback.length) return '0.0';
      return (this.feedback.reduce((s, f) => s + f.rating, 0) / this.feedback.length).toFixed(1);
    },
    filteredFeedback() {
      let list = this.feedback;
      if (this.filterRating) list = list.filter(f => f.rating === this.filterRating);
      if (this.search) list = list.filter(f => f.client.toLowerCase().includes(this.search.toLowerCase()) || f.comment.toLowerCase().includes(this.search.toLowerCase()));
      return list;
    },
  },
  methods: {
    initials(name) { return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(); },
    countByRating(rating) { return this.feedback.filter(f => f.rating === rating).length; },
    countNeedAttention() { return this.feedback.filter(f => f.rating <= 2).length; },
    ratingPct(n) { return this.feedback.length ? (this.feedback.filter(f => f.rating === n).length / this.feedback.length) * 100 : 0; },
    replyTo(item) { void item; },
    sendRequest() { this.requestDialog = false; this.snackbar = true; },
  },
};
</script>
