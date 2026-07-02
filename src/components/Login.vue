<template>
  <div class="login-root">
    <!-- Left panel – branding -->
    <div class="login-left">
      <div class="login-left-inner">
        <router-link to="/home" class="brand-link">
          <span class="brand-icon">⚖</span>
          <span class="brand-name">ELoyer</span>
        </router-link>
        <h1 class="left-headline">Your legal practice,<br>elevated.</h1>
        <p class="left-sub">The all-in-one platform trusted by law firms to manage cases, clients, billing and compliance — all from one place.</p>
        <div class="trust-badges">
          <div class="badge-item"><span class="badge-dot"></span>256-bit SSL encryption</div>
          <div class="badge-item"><span class="badge-dot"></span>SOC 2 Type II certified</div>
          <div class="badge-item"><span class="badge-dot"></span>GDPR compliant</div>
        </div>
        <div class="testimonial-card">
          <p class="testimonial-text">"ELoyer cut our admin time by 60% and gave every attorney real-time visibility across all matters."</p>
          <div class="testimonial-author">
            <div class="author-avatar">M</div>
            <div>
              <div class="author-name">Meriem Bouali</div>
              <div class="author-title">Managing Partner, Bouali &amp; Associates</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel – form -->
    <div class="login-right">
      <div class="login-form-wrap">
        <div class="form-top">
          <h2 class="form-title">Welcome back</h2>
          <p class="form-subtitle">Sign in to your firm's workspace</p>
        </div>

        <div v-if="errorMsg" class="error-alert">
          <span class="error-icon">!</span>{{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="field-group">
            <label class="field-label">Email address</label>
            <div class="field-wrap" :class="{ 'field-error': errors.email }">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
              <input
                v-model="form.email"
                type="email"
                class="field-input"
                placeholder="you@lawfirm.com"
                autocomplete="email"
                @blur="validateEmail"
              />
            </div>
            <span v-if="errors.email" class="field-error-msg">{{ errors.email }}</span>
          </div>

          <div class="field-group">
            <div class="label-row">
              <label class="field-label">Password</label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>
            <div class="field-wrap" :class="{ 'field-error': errors.password }">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="Enter your password"
                autocomplete="current-password"
                @blur="validatePassword"
              />
              <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span v-if="errors.password" class="field-error-msg">{{ errors.password }}</span>
          </div>

          <div class="remember-row">
            <label class="remember-label">
              <input v-model="form.remember" type="checkbox" class="remember-check" />
              <span class="remember-custom"></span>
              Keep me signed in
            </label>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading">Sign In</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </form>

        <div class="divider"><span>or continue with</span></div>

        <div class="demo-roles">
          <p class="demo-label">Quick demo access:</p>
          <div class="role-chips">
            <button v-for="role in demoRoles" :key="role.label" class="role-chip" @click="quickLogin(role)">
              {{ role.label }}
            </button>
          </div>
        </div>

        <p class="back-link">
          <router-link to="/home">← Back to website</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      form: { email: '', password: '', remember: false },
      errors: { email: '', password: '' },
      errorMsg: '',
      showPassword: false,
      loading: false,
      demoRoles: [
        { label: 'Super Admin',  email: 'superadmin@eloyer.com', password: 'admin', route: '/superadmin/dashboard' },
        { label: 'Lawyer',       email: 'admin@admin.com',       password: 'admin', route: '/dashboard' },
        { label: 'Firm Admin',   email: 'firmadmin@eloyer.com',  password: 'admin', route: '/firmadmin/dashboard' },
        { label: 'Client',       email: 'client@eloyer.com',     password: 'admin', route: '/client/portal' },
        { label: 'HR Manager',   email: 'hr@eloyer.com',         password: 'admin', route: '/hr/dashboard' },
      ]
    }
  },
  methods: {
    validateEmail () {
      if (!this.form.email) { this.errors.email = 'Email is required'; return false }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) { this.errors.email = 'Enter a valid email address'; return false }
      this.errors.email = ''
      return true
    },
    validatePassword () {
      if (!this.form.password) { this.errors.password = 'Password is required'; return false }
      this.errors.password = ''
      return true
    },
    async handleLogin () {
      const valid = this.validateEmail() & this.validatePassword()
      if (!valid) return
      this.loading = true
      this.errorMsg = ''
      await new Promise(r => setTimeout(r, 600))
      this.loading = false
      this.$router.push('/dashboard')
    },
    quickLogin (role) {
      this.form.email = role.email
      this.form.password = role.password
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$router.push(role.route)
      }, 500)
    }
  }
}
</script>

<style scoped>
/* ── Root layout ── */
.login-root {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Left branding panel ── */
.login-left {
  flex: 1;
  background: linear-gradient(160deg, #0A1628 0%, #0d2044 60%, #0A1628 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  position: relative;
  overflow: hidden;
}
.login-left::before {
  content: '';
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%);
  top: -100px; right: -100px;
  pointer-events: none;
}
.login-left::after {
  content: '';
  position: absolute;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,169,110,0.05) 0%, transparent 70%);
  bottom: -50px; left: -50px;
  pointer-events: none;
}
.login-left-inner {
  position: relative;
  z-index: 1;
  max-width: 440px;
  width: 100%;
}

/* Brand */
.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  margin-bottom: 48px;
}
.brand-icon { font-size: 28px; }
.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #C8A96E;
  letter-spacing: 0.5px;
}
.left-headline {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff;
  margin: 0 0 16px;
}
.left-sub {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255,255,255,0.6);
  margin: 0 0 36px;
}

/* Trust badges */
.trust-badges {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 40px;
}
.badge-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
}
.badge-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #C8A96E;
  flex-shrink: 0;
}

/* Testimonial */
.testimonial-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(200,169,110,0.2);
  border-radius: 14px;
  padding: 24px;
}
.testimonial-text {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255,255,255,0.8);
  font-style: italic;
  margin: 0 0 16px;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #C8A96E, #b8945a);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #0A1628;
  flex-shrink: 0;
}
.author-name {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}
.author-title {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

/* ── Right form panel ── */
.login-right {
  width: 480px;
  flex-shrink: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 48px;
}
.login-form-wrap {
  width: 100%;
  max-width: 360px;
}
.form-top { margin-bottom: 32px; }
.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #0A1628;
  margin: 0 0 6px;
}
.form-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Error alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #dc2626;
}
.error-icon {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  font-weight: 700;
  font-size: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Fields */
.field-group { margin-bottom: 20px; }
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.forgot-link {
  font-size: 12px;
  color: #C8A96E;
  text-decoration: none;
  font-weight: 500;
}
.forgot-link:hover { text-decoration: underline; }

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  transition: border-color 0.2s, background 0.2s;
}
.field-wrap:focus-within {
  border-color: #C8A96E;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(200,169,110,0.12);
}
.field-wrap.field-error { border-color: #dc2626; }

.field-icon {
  width: 16px; height: 16px;
  margin-left: 14px;
  flex-shrink: 0;
  color: #9ca3af;
}
.field-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 14px;
  font-size: 14px;
  color: #111827;
  outline: none;
  font-family: inherit;
}
.field-input::placeholder { color: #9ca3af; }

.toggle-pw {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 14px;
  display: flex;
  align-items: center;
  color: #9ca3af;
}
.toggle-pw svg { width: 16px; height: 16px; }
.toggle-pw:hover { color: #6b7280; }

.field-error-msg {
  display: block;
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
}

/* Remember */
.remember-row { margin-bottom: 24px; }
.remember-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  user-select: none;
}
.remember-check { display: none; }
.remember-custom {
  width: 18px; height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 5px;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.2s, background 0.2s;
}
.remember-check:checked + .remember-custom {
  background: #C8A96E;
  border-color: #C8A96E;
}
.remember-check:checked + .remember-custom::after {
  content: '';
  position: absolute;
  left: 4px; top: 1px;
  width: 6px; height: 10px;
  border: 2px solid white;
  border-top: none; border-left: none;
  transform: rotate(45deg);
}

/* Submit button */
.submit-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #C8A96E, #b8945a);
  color: #0A1628;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  letter-spacing: 0.3px;
  font-family: inherit;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(200,169,110,0.4);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.7; cursor: default; }

/* Loading dots */
.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.loading-dots span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #0A1628;
  animation: bounce 0.6s infinite alternate;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { to { transform: translateY(-4px); opacity: 0.5; } }

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}
.divider::before {
  content: '';
  position: absolute;
  top: 50%; left: 0;
  width: 100%; height: 1px;
  background: #e5e7eb;
}
.divider span {
  position: relative;
  background: white;
  padding: 0 12px;
  font-size: 12px;
  color: #9ca3af;
}

/* Demo roles */
.demo-label {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 10px;
  font-weight: 500;
}
.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.role-chip {
  padding: 5px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  font-size: 12px;
  color: #374151;
  background: white;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.role-chip:hover {
  border-color: #C8A96E;
  color: #0A1628;
  background: rgba(200,169,110,0.08);
}

/* Back link */
.back-link {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
}
.back-link a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}
.back-link a:hover { color: #C8A96E; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right { width: 100%; padding: 40px 24px; }
}
</style>
