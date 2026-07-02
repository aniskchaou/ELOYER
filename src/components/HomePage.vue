<template>
  <v-app>
    <!-- Navbar -->
    <v-app-bar app flat color="white">
      <v-toolbar-title class="font-weight-bold">⚖️ Eloyer</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/features">Features</v-btn>
      <v-btn text to="/pricing">Pricing</v-btn>
      <v-btn text to="/about">About</v-btn>
      <v-btn text to="/contact">Contact</v-btn>
      <v-btn color="primary" class="ml-4" to="/login">Login</v-btn>
      <v-btn outlined color="primary" class="ml-2" to="/signup">Sign Up</v-btn>
    </v-app-bar>

    <!-- Hero Section -->
    <v-container class="text-center py-16">
      <h1 class="text-4xl font-bold mb-4">Smart Legal Practice Management</h1>
      <p class="text-lg mb-6">Manage cases, clients, billing & documents — all in one secure platform.</p>
      <v-btn color="primary" large class="mr-4">Start Free Trial</v-btn>
      <v-btn outlined large>Book a Demo</v-btn>
      <v-img src="@/assets/img/mockup-dashboard.png" max-width="800" class="mt-10 mx-auto rounded-xl shadow-lg"></v-img>
    </v-container>

    <!-- Features -->
    <v-container class="py-16">
      <h2 class="text-3xl font-semibold text-center mb-12">Why Lawyers Choose Eloyer</h2>
      <v-row>
        <v-col v-for="feature in features" :key="feature.title" cols="12" md="4" class="text-center px-8">
          <v-icon size="48" color="primary">{{ feature.icon }}</v-icon>
          <h3 class="text-xl font-semibold mt-4">{{ feature.title }}</h3>
          <p class="text-gray-600">{{ feature.text }}</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Testimonials -->
    <v-container class="py-16 bg-gray-100 text-center rounded-xl">
      <h2 class="text-3xl font-semibold mb-10">What Lawyers Say</h2>
      <v-row>
        <v-col cols="12" md="4" v-for="t in testimonials" :key="t.name">
          <v-card outlined class="pa-6">
            <p>"{{ t.quote }}"</p>
            <strong class="block mt-4">- {{ t.name }}, {{ t.role }}</strong>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- CTA -->
    <v-container class="py-16 text-center bg-primary text-white rounded-xl">
      <h2 class="text-3xl font-bold mb-6">Ready to simplify your law practice?</h2>
      <v-btn dark large color="white" class="text-primary font-bold">Get Started Free</v-btn>
    </v-container>

    <!-- Footer -->
    <v-footer class="pa-6 justify-center">
      <span>&copy; 2025 Eloyer. All rights reserved.</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      features: [
        { icon: "mdi-folder", title: "Case Management", text: "Track cases, hearings & deadlines effortlessly." },
        { icon: "mdi-account-group", title: "Client Portal", text: "Securely collaborate with clients." },
        { icon: "mdi-credit-card", title: "Billing & Finance", text: "Invoices, retainers & expenses made easy." },
        { icon: "mdi-file-document", title: "Documents", text: "Templates, e-signatures & versioning." },
        { icon: "mdi-bank", title: "Court Integration", text: "Stay updated on hearings & e-filings." },
        { icon: "mdi-magnify", title: "Legal Research", text: "AI-powered insights & precedents." },
      ],
      testimonials: [
        { name: "Sarah M.", role: "Corporate Lawyer", quote: "Eloyer has saved me hours every week managing cases." },
        { name: "David K.", role: "Litigation Attorney", quote: "The client portal is a game changer for communication." },
        { name: "Emily R.", role: "Small Firm Partner", quote: "Billing and retainer tracking has never been this easy." },
      ]
    }
  }
}
</script>

<style scoped>
h1, h2, h3 {
  font-family: 'Poppins', sans-serif;
}
.bg-gray-100 {
  background-color: #f9f9f9;
}
</style>
