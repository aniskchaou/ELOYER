import Vue from 'vue'
import VueRouter from 'vue-router'

// ── Front Office ──────────────────────────────────────────────────────────────
import LandingPage from '../components/frontoffice/LandingPage.vue'
import ServicesPage from '../components/frontoffice/ServicesPage.vue'
import PricingPage from '../components/frontoffice/PricingPage.vue'
import AboutPage from '../components/frontoffice/AboutPage.vue'
import ContactPage from '../components/frontoffice/ContactPage.vue'

import ActiveCases from '../components/ActiveCases.vue'
import Act from '../components/Act.vue'
import Affair from '../components/Affair.vue'
import AiPredictions from '../components/AiPredictions.vue'
import ArchivedAffair from '../components/ArchivedAffair.vue'
import CaseSuccessReports from '../components/CaseSuccessReports.vue'
import CategoryAffair from '../components/CategoryAffair.vue'
import CategoryCourt from '../components/CategoryCourt.vue'
import Client from '../components/Client.vue'
import Configuration from '../components/Configuration.vue'
import Contact from '../components/Contact.vue'
import Court from '../components/Court.vue'
import Dashboard from '../components/Dashboard.vue'
import Document from '../components/Document.vue'
import Evidence from '../components/Evidence.vue'
import FavouriteAffair from '../components/FavouriteAffair.vue'
import HearingDates from '../components/hearing/HearingDates.vue'
import LegalNotes from '../components/LegalNotes.vue'
import Login from '../components/Login.vue'
import RecentPayments from '../components/RecentPayments.vue'
import Rendezvous from '../components/Rendezvous.vue'
import Study from '../components/Study.vue'
import Task from '../components/Task.vue'
import UpcomingHearings from '../components/UpcomingHearings.vue'

import Clients from '../components/clients/Clients.vue'
import ClientProfiles from '../components/clients/ClientProfiles.vue'
import ClientContracts from '../components/clients/ClientContracts.vue'
import ClientPortalAccess from '../components/clients/ClientPortal.vue'
import ClientFeedback from '../components/clients/ClientFeedback.vue'

import Documents from '../components/documents/Documents.vue'
import AutoDraft from '../components/documents/AutoDraft.vue'
import ClauseLibrary from '../components/documents/ClauseLibrary.vue'
import Comparison from '../components/documents/Comparison.vue'
import Workflow from '../components/documents/Workflow.vue'
import Blockchain from '../components/documents/Blockchain.vue'
import Templates from '../components/documents/Templates.vue'
import ContractGenerator from '../components/documents/ContractGenerator.vue'
import ESignature from '../components/documents/ESignature.vue'
import Versioning from '../components/documents/Versioning.vue'

import MultiParty from '../components/cases/MultiParty.vue'
import EvidenceAttachments from '../components/cases/EvidenceAttachments.vue'
import AIStrategy from '../components/cases/AIStrategy.vue'
import Tagging from '../components/cases/Tagging.vue'
import ConflictCheck from '../components/cases/ConflictCheck.vue'
import PredictiveOutcome from '../components/predictive/PredictiveOutcome.vue'

import TimelineView from '../components/timeline/TimelineView.vue'
import TaskList from '../components/timeline/TaskList.vue'
import CaseStudy from '../components/casestudy/CaseStudy.vue'

import CalendarSync from '../components/calendar/CalendarSync.vue'
import Reminders from '../components/calendar/Reminders.vue'
import Meetings from '../components/calendar/Meetings.vue'
import Planner from '../components/calendar/Planner.vue'

import CourtCategories from '../components/court/CourtCategories.vue'
import CourtHearings from '../components/court/CourtHearings.vue'
import EFiling from '../components/court/EFiling.vue'
import CaseStatus from '../components/court/CaseStatus.vue'
import LegalNotices from '../components/court/LegalNotices.vue'

import TimeLogs from '../components/billing/TimeLogs.vue'
import Invoices from '../components/billing/Invoices.vue'
import Retainers from '../components/billing/Retainers.vue'
import Expenses from '../components/billing/Expenses.vue'
import FinancialReports from '../components/billing/FinancialReports.vue'
import TaxCompliance from '../components/billing/TaxCompliance.vue'

import CaseLaw from '../components/legalresearch/CaseLaw.vue'
import Precedents from '../components/legalresearch/Precedents.vue'
import Statutes from '../components/legalresearch/Statutes.vue'
import AIInsights from '../components/legalresearch/AIInsights.vue'
import ResearchNotes from '../components/legalresearch/ResearchNotes.vue'

import Leads from '../components/marketing/Leads.vue'
import EmailCampaigns from '../components/marketing/EmailCampaigns.vue'
import Acquisition from '../components/marketing/Acquisition.vue'
import Referrals from '../components/marketing/Referrals.vue'

import ClientRetention from '../components/reports/ClientRetention.vue'
import FinancialAnalytics from '../components/reports/FinancialAnalytics.vue'
import EmployeePerformance from '../components/reports/EmployeePerformance.vue'
import KPIDashboard from '../components/reports/KPIDashboard.vue'

import Roles from '../components/team/Roles.vue'
import Directory from '../components/team/Directory.vue'
import Workload from '../components/team/Workload.vue'
import Attendance from '../components/team/Attendance.vue'
import PerformanceReviews from '../components/team/PerformanceReviews.vue'

import Preferences from '../components/configuration/Preferences.vue'
import RolesPermissions from '../components/configuration/RolesPermissions.vue'
import Branding from '../components/configuration/Branding.vue'
import Integrations from '../components/configuration/Integrations.vue'
import Security from '../components/configuration/Security.vue'

import AIPredictions from '../components/ai/AIPredictions.vue'
import Summarization from '../components/ai/Summarization.vue'
import SmartTasks from '../components/ai/SmartTasks.vue'
import AnalyticsAI from '../components/ai/AnalyticsAI.vue'
import CaseProbability from '../components/ai/CaseProbability.vue'
import LitigationRisk from '../components/ai/LitigationRisk.vue'
import BillingTrends from '../components/ai/BillingTrends.vue'
import PerformanceDashboard from '../components/ai/PerformanceDashboard.vue'
import ResearchSuggestions from '../components/ai/ResearchSuggestions.vue'

import LawyerPortal from '../components/lawyer/LawyerPortal.vue'
import LawyerCaseWorkspace from '../components/lawyer/LawyerCaseWorkspace.vue'

// ── Junior Associate ──────────────────────────────────────────────────────────
import JuniorDashboard from '../components/junior/JuniorDashboard.vue'
import ResearchWorkspace from '../components/junior/ResearchWorkspace.vue'

// ── Paralegal ─────────────────────────────────────────────────────────────────
import FilingChecklist from '../components/paralegal/FilingChecklist.vue'
import WorkflowTracker from '../components/paralegal/WorkflowTracker.vue'

// ── Secretary ─────────────────────────────────────────────────────────────────
import SecretaryDashboard from '../components/secretary/SecretaryDashboard.vue'
import AppointmentManager from '../components/secretary/AppointmentManager.vue'
import EmailTemplates from '../components/secretary/EmailTemplates.vue'
import SMSReminders from '../components/secretary/SMSReminders.vue'
import ContactManagement from '../components/secretary/ContactManagement.vue'

// ── Reception ─────────────────────────────────────────────────────────────────
import ReceptionDashboard from '../components/reception/ReceptionDashboard.vue'
import VisitorManagement from '../components/reception/VisitorManagement.vue'
import QueueManagement from '../components/reception/QueueManagement.vue'
import IntakeForms from '../components/reception/IntakeForms.vue'
import ClientLookup from '../components/reception/ClientLookup.vue'

// ── Finance ───────────────────────────────────────────────────────────────────
import FinanceDashboard from '../components/finance/FinanceDashboard.vue'
import TrustLedger from '../components/finance/TrustLedger.vue'
import Payroll from '../components/finance/Payroll.vue'
import ProfitReports from '../components/finance/ProfitReports.vue'

// ── HR Manager ────────────────────────────────────────────────────────────────
import HRDashboard from '../components/hr/HRDashboard.vue'
import AttendanceManagement from '../components/hr/AttendanceManagement.vue'
import LeaveManagement from '../components/hr/LeaveManagement.vue'
import Recruitment from '../components/hr/Recruitment.vue'
import PerformanceTracking from '../components/hr/PerformanceTracking.vue'
import EmployeeRecords from '../components/hr/EmployeeRecords.vue'

// ── Client Portal ─────────────────────────────────────────────────────────────
import ClientPortal from '../components/client/ClientPortal.vue'
import ClientCases from '../components/client/ClientCases.vue'
import ClientDocumentVault from '../components/client/ClientDocumentVault.vue'
import ClientInvoices from '../components/client/ClientInvoices.vue'
import ClientAIFAQ from '../components/client/ClientAIFAQ.vue'
import ClientMeetings from '../components/client/ClientMeetings.vue'
import ClientESignature from '../components/client/ClientESignature.vue'

// ── Corporate Client ──────────────────────────────────────────────────────────
import CorporateDashboard from '../components/corporate/CorporateDashboard.vue'
import LegalRequests from '../components/corporate/LegalRequests.vue'
import CorporateApprovals from '../components/corporate/CorporateApprovals.vue'
import ContractRepository from '../components/corporate/ContractRepository.vue'
import SpendingAnalytics from '../components/corporate/SpendingAnalytics.vue'

// ── Premium AI ────────────────────────────────────────────────────────────────
import AIPremiumHub from '../components/ai_premium/AIPremiumHub.vue'
import AILegalResearch from '../components/ai_premium/AILegalResearch.vue'
import AIContractGeneration from '../components/ai_premium/AIContractGeneration.vue'
import AIClauseSuggestions from '../components/ai_premium/AIClauseSuggestions.vue'
import AIDocumentSummarization from '../components/ai_premium/AIDocumentSummarization.vue'
import AILegalCitationGenerator from '../components/ai_premium/AILegalCitationGenerator.vue'
import AIHearingPreparation from '../components/ai_premium/AIHearingPreparation.vue'
import AIDepositionPreparation from '../components/ai_premium/AIDepositionPreparation.vue'
import AIEvidenceSummarization from '../components/ai_premium/AIEvidenceSummarization.vue'
import AIMeetingTranscription from '../components/ai_premium/AIMeetingTranscription.vue'
import AIMultilingualTranslation from '../components/ai_premium/AIMultilingualTranslation.vue'
import AIClientIntakeAssistant from '../components/ai_premium/AIClientIntakeAssistant.vue'
import AILegalRiskAnalysis from '../components/ai_premium/AILegalRiskAnalysis.vue'
import AIInvoiceGeneration from '../components/ai_premium/AIInvoiceGeneration.vue'
import AIEmailDrafting from '../components/ai_premium/AIEmailDrafting.vue'
import AITaskRecommendations from '../components/ai_premium/AITaskRecommendations.vue'
import AIDeadlinePrediction from '../components/ai_premium/AIDeadlinePrediction.vue'
import AIConflictDetection from '../components/ai_premium/AIConflictDetection.vue'
import AILitigationStrategy from '../components/ai_premium/AILitigationStrategy.vue'
import AIDocumentComparison from '../components/ai_premium/AIDocumentComparison.vue'
import AIKnowledgeBaseSearch from '../components/ai_premium/AIKnowledgeBaseSearch.vue'

// ── Enterprise ────────────────────────────────────────────────────────────────
import EnterpriseHub from '../components/enterprise/EnterpriseHub.vue'
import WebhooksManager from '../components/enterprise/WebhooksManager.vue'
import AutomationRules from '../components/enterprise/AutomationRules.vue'
import BusinessIntelligence from '../components/enterprise/BusinessIntelligence.vue'
import DataExportImport from '../components/enterprise/DataExportImport.vue'
import CRMIntegration from '../components/enterprise/CRMIntegration.vue'
import DisasterRecovery from '../components/enterprise/DisasterRecovery.vue'
import EntComplianceDashboard from '../components/enterprise/ComplianceDashboard.vue'
import SSOConfiguration from '../components/enterprise/SSOConfiguration.vue'
import TwoFactorAuth from '../components/enterprise/TwoFactorAuth.vue'
import RetentionPolicies from '../components/enterprise/RetentionPolicies.vue'
import CustomDomains from '../components/enterprise/CustomDomains.vue'
import AdvancedRBAC from '../components/enterprise/AdvancedRBAC.vue'
import MultiOfficeManagement from '../components/enterprise/MultiOfficeManagement.vue'
import MultiCountrySupport from '../components/enterprise/MultiCountrySupport.vue'
import CourtEFiling from '../components/enterprise/CourtEFiling.vue'
import MobileApps from '../components/enterprise/MobileApps.vue'
import OfflineAccess from '../components/enterprise/OfflineAccess.vue'
import EnterpriseAuditLogs from '../components/enterprise/EnterpriseAuditLogs.vue'
import AccountingIntegration from '../components/enterprise/AccountingIntegration.vue'

// ── Consultant ────────────────────────────────────────────────────────────────
import ConsultantPortal from '../components/consultant/ConsultantPortal.vue'
import ExpertReports from '../components/consultant/ExpertReports.vue'

// ── Court Liaison ─────────────────────────────────────────────────────────────
import CourtLiaisonDashboard from '../components/court_liaison/CourtLiaisonDashboard.vue'
import CourtNotices from '../components/court_liaison/CourtNotices.vue'
import FilingTracker from '../components/court_liaison/FilingTracker.vue'
import CourtCommunicationLog from '../components/court_liaison/CourtCommunicationLog.vue'

// ── Investigator ──────────────────────────────────────────────────────────────
import InvestigatorDashboard from '../components/investigator/InvestigatorDashboard.vue'
import InvestigationFindings from '../components/investigator/InvestigationFindings.vue'
import EvidenceChainOfCustody from '../components/investigator/EvidenceChainOfCustody.vue'
import InterviewRecords from '../components/investigator/InterviewRecords.vue'

// ── Compliance ────────────────────────────────────────────────────────────────
import ComplianceDashboard from '../components/compliance/ComplianceDashboard.vue'
import AIComplianceChecker from '../components/compliance/AIComplianceChecker.vue'
import RiskAnalysis from '../components/compliance/RiskAnalysis.vue'
import ComplianceApprovals from '../components/compliance/ComplianceApprovals.vue'
import FirmAdminDashboard from '../components/firmadmin/FirmAdminDashboard.vue'
import FirmProfile from '../components/firmadmin/FirmProfile.vue'
import Departments from '../components/firmadmin/Departments.vue'
import OfficeLocations from '../components/firmadmin/OfficeLocations.vue'
import StaffInvitations from '../components/firmadmin/StaffInvitations.vue'
import WorkflowBuilder from '../components/firmadmin/WorkflowBuilder.vue'
import RevenueAnalytics from '../components/firmadmin/RevenueAnalytics.vue'
import PricingConfig from '../components/firmadmin/PricingConfig.vue'
import FirmPermissions from '../components/firmadmin/FirmPermissions.vue'
import FirmNotifications from '../components/firmadmin/FirmNotifications.vue'

// ── Senior Lawyer / Partner ───────────────────────────────────────────────────
import SeniorDashboard from '../components/senior/SeniorDashboard.vue'
import Approvals from '../components/senior/Approvals.vue'
import CaseAssignment from '../components/senior/CaseAssignment.vue'
import LegalStrategies from '../components/senior/LegalStrategies.vue'
import SettlementsManagement from '../components/senior/SettlementsManagement.vue'
import InvoiceReview from '../components/senior/InvoiceReview.vue'
import TeamCollaboration from '../components/senior/TeamCollaboration.vue'

// ── Attorney ──────────────────────────────────────────────────────────────────
import AIDrafting from '../components/attorney/AIDrafting.vue'
import AIContractReview from '../components/attorney/AIContractReview.vue'
import Pleadings from '../components/attorney/Pleadings.vue'
import OCRScanning from '../components/attorney/OCRScanning.vue'
import DeadlineTracker from '../components/attorney/DeadlineTracker.vue'
import BillableHours from '../components/attorney/BillableHours.vue'
import ClientCommunication from '../components/attorney/ClientCommunication.vue'
import EmailIntegration from '../components/attorney/EmailIntegration.vue'

import SADashboard from '../components/superadmin/SADashboard.vue'
import TenantManagement from '../components/superadmin/TenantManagement.vue'
import SubscriptionPlans from '../components/superadmin/SubscriptionPlans.vue'
import BillingManagement from '../components/superadmin/BillingManagement.vue'
import FeatureFlags from '../components/superadmin/FeatureFlags.vue'
import AuditLogs from '../components/superadmin/AuditLogs.vue'
import APIManagement from '../components/superadmin/APIManagement.vue'
import EmailSMSConfig from '../components/superadmin/EmailSMSConfig.vue'
import StorageManagement from '../components/superadmin/StorageManagement.vue'
import AIUsageMonitor from '../components/superadmin/AIUsageMonitor.vue'
import SASecurityDashboard from '../components/superadmin/SecurityDashboard.vue'
import PlatformHealth from '../components/superadmin/PlatformHealth.vue'
import PlatformSettings from '../components/superadmin/PlatformSettings.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/',         redirect: '/home' },
  { path: '/login',    name: 'login',    component: Login,        meta: { frontOffice: true } },
  { path: '/home',     name: 'home',     component: LandingPage,  meta: { frontOffice: true } },
  { path: '/features', name: 'features', component: LandingPage,  meta: { frontOffice: true } },
  { path: '/services', name: 'services', component: ServicesPage, meta: { frontOffice: true } },
  { path: '/pricing',  name: 'pricing',  component: PricingPage,  meta: { frontOffice: true } },
  { path: '/about',    name: 'about',    component: AboutPage,    meta: { frontOffice: true } },
  { path: '/contact',  name: 'contact',  component: ContactPage,  meta: { frontOffice: true } },
  { path: '/public', redirect: '/home' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/lawyer/portal', name: 'lawyer-portal', component: LawyerPortal },
  { path: '/lawyer/cases/:id', name: 'lawyer-case-workspace', component: LawyerCaseWorkspace },
  { path: '/active-cases', name: 'active-cases', component: ActiveCases },
  { path: '/upcoming-hearings', name: 'upcoming-hearings', component: UpcomingHearings },
  { path: '/recent-payments', name: 'recent-payments', component: RecentPayments },

  { path: '/contact', name: 'contact', component: Contact },
  { path: '/configuration', name: 'configuration', component: Configuration },
  { path: '/affair', name: 'affair', component: Affair },
  { path: '/rendezvous', name: 'rendezvous', component: Rendezvous },
  { path: '/study', name: 'study', component: Study },
  { path: '/task', name: 'task', component: Task },
  { path: '/document', name: 'document', component: Document },
  { path: '/favouriteaffair', name: 'favouriteaffair', component: FavouriteAffair },
  { path: '/archivedaffair', name: 'archivedaffair', component: ArchivedAffair },
  { path: '/court', name: 'court', component: Court },
  { path: '/categorycourt', name: 'categorycourt', component: CategoryCourt },
  { path: '/categoryaffair', name: 'categoryaffair', component: CategoryAffair },
  { path: '/client', name: 'client', component: Client },
  { path: '/act', name: 'act', component: Act },

  { path: '/affair/timeline', name: 'timeline', component: TimelineView },
  { path: '/tasks/assign', name: 'tasklist', component: TaskList },
  { path: '/case-study', name: 'casestudy', component: CaseStudy },
  { path: '/hearing-dates', name: 'hearingdates', component: HearingDates },
  { path: '/affair/predictive', name: 'predictiveoutcome', component: PredictiveOutcome },

  { path: '/clients', name: 'clients', component: Clients },
  { path: '/clients/profiles', name: 'client-profiles', component: ClientProfiles },
  { path: '/clients/contracts', name: 'client-contracts', component: ClientContracts },
  { path: '/clients/portal', name: 'client-portal', component: ClientPortalAccess },
  { path: '/clients/feedback', name: 'client-feedback', component: ClientFeedback },

  { path: '/documents', name: 'documents', component: Documents },
  { path: '/documents/templates', name: 'templates', component: Templates },
  { path: '/documents/contract-generator', name: 'contract-generator', component: ContractGenerator },
  { path: '/documents/esignature', name: 'esignature', component: ESignature },
  { path: '/documents/versioning', name: 'versioning', component: Versioning },
  { path: '/documents/auto-draft', name: 'auto-draft', component: AutoDraft },
  { path: '/documents/clause-library', name: 'clause-library', component: ClauseLibrary },
  { path: '/documents/comparison', name: 'comparison', component: Comparison },
  { path: '/documents/workflow', name: 'workflow', component: Workflow },
  { path: '/documents/blockchain', name: 'blockchain', component: Blockchain },

  { path: '/cases/legal-notes', name: 'legal-notes', component: LegalNotes },
  { path: '/cases/evidence', name: 'evidence', component: Evidence },
  { path: '/cases/multi-party', name: 'multi-party', component: MultiParty },
  { path: '/cases/evidence-attachments', name: 'evidence-attachments', component: EvidenceAttachments },
  { path: '/cases/ai-strategy', name: 'ai-strategy', component: AIStrategy },
  { path: '/cases/tagging', name: 'tagging', component: Tagging },
  { path: '/cases/conflict-check', name: 'conflict-check', component: ConflictCheck },

  { path: '/calendar/sync', name: 'calendar-sync', component: CalendarSync },
  { path: '/calendar/reminders', name: 'calendar-reminders', component: Reminders },
  { path: '/calendar/meetings', name: 'calendar-meetings', component: Meetings },
  { path: '/calendar/planner', name: 'calendar-planner', component: Planner },

  { path: '/court/categories', name: 'court-categories', component: CourtCategories },
  { path: '/court/hearings', name: 'court-hearings', component: CourtHearings },
  { path: '/court/efiling', name: 'court-efiling', component: EFiling },
  { path: '/court/status', name: 'court-status', component: CaseStatus },
  { path: '/court/notices', name: 'court-notices', component: LegalNotices },

  { path: '/billing/timelogs', name: 'billing-timelogs', component: TimeLogs },
  { path: '/billing/invoices', name: 'billing-invoices', component: Invoices },
  { path: '/billing/retainers', name: 'billing-retainers', component: Retainers },
  { path: '/billing/expenses', name: 'billing-expenses', component: Expenses },
  { path: '/billing/reports', name: 'billing-reports', component: FinancialReports },
  { path: '/billing/tax', name: 'billing-tax', component: TaxCompliance },

  { path: '/legalresearch/caselaw', name: 'legalresearch-caselaw', component: CaseLaw },
  { path: '/legalresearch/precedents', name: 'legalresearch-precedents', component: Precedents },
  { path: '/legalresearch/statutes', name: 'legalresearch-statutes', component: Statutes },
  { path: '/legalresearch/ai-insights', name: 'legalresearch-ai-insights', component: AIInsights },
  { path: '/legalresearch/notes', name: 'legalresearch-notes', component: ResearchNotes },

  { path: '/marketing/leads', name: 'marketing-leads', component: Leads },
  { path: '/marketing/email', name: 'marketing-email', component: EmailCampaigns },
  { path: '/marketing/acquisition', name: 'marketing-acquisition', component: Acquisition },
  { path: '/marketing/referrals', name: 'marketing-referrals', component: Referrals },

  { path: '/reports/case-success', name: 'case-success-reports', component: CaseSuccessReports },
  { path: '/reports/client-retention', name: 'reports-client-retention', component: ClientRetention },
  { path: '/reports/financial', name: 'reports-financial', component: FinancialAnalytics },
  { path: '/reports/performance', name: 'reports-performance', component: EmployeePerformance },
  { path: '/reports/kpi', name: 'reports-kpi', component: KPIDashboard },

  { path: '/team/roles', name: 'team-roles', component: Roles },
  { path: '/team/directory', name: 'team-directory', component: Directory },
  { path: '/team/workload', name: 'team-workload', component: Workload },
  { path: '/team/attendance', name: 'team-attendance', component: Attendance },
  { path: '/team/performance', name: 'team-performance', component: PerformanceReviews },

  { path: '/configuration/preferences', name: 'configuration-preferences', component: Preferences },
  { path: '/configuration/roles', name: 'configuration-roles', component: RolesPermissions },
  { path: '/configuration/branding', name: 'configuration-branding', component: Branding },
  { path: '/configuration/integrations', name: 'configuration-integrations', component: Integrations },
  { path: '/configuration/security', name: 'configuration-security', component: Security },

  { path: '/ai-predictions', name: 'ai-predictions-legacy', component: AiPredictions },
  { path: '/ai/predictions', name: 'ai-predictions', component: AIPredictions },
  { path: '/ai/summarization', name: 'ai-summarization', component: Summarization },
  { path: '/ai/smart-tasks', name: 'ai-smart-tasks', component: SmartTasks },
  { path: '/ai/analytics', name: 'ai-analytics', component: AnalyticsAI },
  { path: '/ai/case-probability', name: 'ai-case-probability', component: CaseProbability },
  { path: '/ai/litigation-risk', name: 'ai-litigation-risk', component: LitigationRisk },
  { path: '/ai/billing-trends', name: 'ai-billing-trends', component: BillingTrends },
  { path: '/ai/performance', name: 'ai-performance', component: PerformanceDashboard },
  { path: '/ai/research-suggestions', name: 'ai-research-suggestions', component: ResearchSuggestions },

  { path: '/superadmin/dashboard',   name: 'sa-dashboard',   component: SADashboard },
  { path: '/superadmin/tenants',     name: 'sa-tenants',     component: TenantManagement },
  { path: '/superadmin/plans',       name: 'sa-plans',       component: SubscriptionPlans },
  { path: '/superadmin/billing',     name: 'sa-billing',     component: BillingManagement },
  { path: '/superadmin/feature-flags', name: 'sa-feature-flags', component: FeatureFlags },
  { path: '/superadmin/audit-logs',  name: 'sa-audit-logs',  component: AuditLogs },
  { path: '/superadmin/api-keys',    name: 'sa-api-keys',    component: APIManagement },
  { path: '/superadmin/email-sms',   name: 'sa-email-sms',   component: EmailSMSConfig },
  { path: '/superadmin/storage',     name: 'sa-storage',     component: StorageManagement },
  { path: '/superadmin/ai-usage',    name: 'sa-ai-usage',    component: AIUsageMonitor },
  { path: '/superadmin/security',    name: 'sa-security',    component: SASecurityDashboard },
  { path: '/superadmin/health',      name: 'sa-health',      component: PlatformHealth },
  { path: '/superadmin/settings',    name: 'sa-settings',    component: PlatformSettings },

  // ── Firm Admin ──────────────────────────────────────────────────────────────
  { path: '/firmadmin/dashboard',    name: 'fa-dashboard',    component: FirmAdminDashboard },
  { path: '/firmadmin/profile',      name: 'fa-profile',      component: FirmProfile },
  { path: '/firmadmin/departments',  name: 'fa-departments',  component: Departments },
  { path: '/firmadmin/locations',    name: 'fa-locations',    component: OfficeLocations },
  { path: '/firmadmin/invitations',  name: 'fa-invitations',  component: StaffInvitations },
  { path: '/firmadmin/workflows',    name: 'fa-workflows',    component: WorkflowBuilder },
  { path: '/firmadmin/revenue',      name: 'fa-revenue',      component: RevenueAnalytics },
  { path: '/firmadmin/pricing',      name: 'fa-pricing',      component: PricingConfig },
  { path: '/firmadmin/permissions',  name: 'fa-permissions',  component: FirmPermissions },
  { path: '/firmadmin/notifications', name: 'fa-notifications', component: FirmNotifications },

  // ── Senior Lawyer ───────────────────────────────────────────────────────────
  { path: '/senior/dashboard',       name: 'senior-dashboard',      component: SeniorDashboard },
  { path: '/senior/approvals',       name: 'senior-approvals',      component: Approvals },
  { path: '/senior/case-assignment', name: 'senior-assignment',     component: CaseAssignment },
  { path: '/senior/strategies',      name: 'senior-strategies',     component: LegalStrategies },
  { path: '/senior/settlements',     name: 'senior-settlements',    component: SettlementsManagement },
  { path: '/senior/invoice-review',  name: 'senior-invoice-review', component: InvoiceReview },
  { path: '/senior/collaboration',   name: 'senior-collaboration',  component: TeamCollaboration },

  // ── Attorney ────────────────────────────────────────────────────────────────
  { path: '/attorney/ai-drafting',      name: 'attorney-ai-drafting',      component: AIDrafting },
  { path: '/attorney/contract-review',  name: 'attorney-contract-review',  component: AIContractReview },
  { path: '/attorney/pleadings',        name: 'attorney-pleadings',        component: Pleadings },
  { path: '/attorney/ocr',              name: 'attorney-ocr',              component: OCRScanning },
  { path: '/attorney/deadlines',        name: 'attorney-deadlines',        component: DeadlineTracker },
  { path: '/attorney/billable-hours',   name: 'attorney-billable-hours',   component: BillableHours },
  { path: '/attorney/client-comms',     name: 'attorney-client-comms',     component: ClientCommunication },
  { path: '/attorney/email-integration', name: 'attorney-email', component: EmailIntegration },

  // ── Junior Associate ────────────────────────────────────────────────────────
  { path: '/junior/dashboard',  name: 'junior-dashboard',  component: JuniorDashboard },
  { path: '/junior/research',   name: 'junior-research',   component: ResearchWorkspace },

  // ── Paralegal ───────────────────────────────────────────────────────────────
  { path: '/paralegal/checklists', name: 'paralegal-checklists', component: FilingChecklist },
  { path: '/paralegal/workflows',  name: 'paralegal-workflows',  component: WorkflowTracker },

  // ── Secretary ───────────────────────────────────────────────────────────────
  { path: '/secretary/dashboard',       name: 'secretary-dashboard',   component: SecretaryDashboard },
  { path: '/secretary/appointments',    name: 'secretary-appointments', component: AppointmentManager },
  { path: '/secretary/email-templates', name: 'secretary-email-tpl',   component: EmailTemplates },
  { path: '/secretary/sms-reminders',   name: 'secretary-sms',         component: SMSReminders },
  { path: '/secretary/contacts',        name: 'secretary-contacts',    component: ContactManagement },

  // ── Reception ───────────────────────────────────────────────────────────────
  { path: '/reception/dashboard',    name: 'reception-dashboard',    component: ReceptionDashboard },
  { path: '/reception/visitors',     name: 'reception-visitors',     component: VisitorManagement },
  { path: '/reception/booking',      name: 'reception-booking',      component: AppointmentManager },
  { path: '/reception/intake',       name: 'reception-intake',       component: IntakeForms },
  { path: '/reception/client-lookup', name: 'reception-lookup',     component: ClientLookup },
  { path: '/reception/queue',        name: 'reception-queue',        component: QueueManagement },

  // ── Finance ─────────────────────────────────────────────────────────────────
  { path: '/finance/dashboard',    name: 'finance-dashboard',    component: FinanceDashboard },
  { path: '/finance/payments',     name: 'finance-payments',     component: FinanceDashboard },
  { path: '/finance/trust',        name: 'finance-trust',        component: TrustLedger },
  { path: '/finance/payroll',      name: 'finance-payroll',      component: Payroll },
  { path: '/finance/reports',      name: 'finance-reports',      component: ProfitReports },
  { path: '/finance/integrations', name: 'finance-integrations', component: ProfitReports },

  // ── HR Manager ──────────────────────────────────────────────────────────────
  { path: '/hr/dashboard',   name: 'hr-dashboard',   component: HRDashboard },
  { path: '/hr/attendance',  name: 'hr-attendance',  component: AttendanceManagement },
  { path: '/hr/leave',       name: 'hr-leave',       component: LeaveManagement },
  { path: '/hr/recruitment', name: 'hr-recruitment', component: Recruitment },
  { path: '/hr/performance', name: 'hr-performance', component: PerformanceTracking },
  { path: '/hr/employees',   name: 'hr-employees',   component: EmployeeRecords },

  // ── Client Portal ────────────────────────────────────────────────────────────
  { path: '/client/dashboard',   name: 'client-dashboard',  component: ClientPortal },
  { path: '/client/cases',       name: 'client-cases',      component: ClientCases },
  { path: '/client/documents',   name: 'client-documents',  component: ClientDocumentVault },
  { path: '/client/invoices',    name: 'client-invoices',   component: ClientInvoices },
  { path: '/client/appointments', name: 'client-appts',     component: AppointmentManager },
  { path: '/client/chat',        name: 'client-chat',       component: ClientPortal },
  { path: '/client/meetings',    name: 'client-meetings',   component: ClientMeetings },
  { path: '/client/esignature',  name: 'client-esignature', component: ClientESignature },
  { path: '/client/faq',         name: 'client-faq',        component: ClientAIFAQ },

  // ── Corporate Portal ─────────────────────────────────────────────────────────
  { path: '/corporate/dashboard', name: 'corp-dashboard', component: CorporateDashboard },
  { path: '/corporate/requests',  name: 'corp-requests',  component: LegalRequests },
  { path: '/corporate/cases',     name: 'corp-cases',     component: ClientCases },
  { path: '/corporate/approvals', name: 'corp-approvals', component: CorporateApprovals },
  { path: '/corporate/contracts', name: 'corp-contracts', component: ContractRepository },
  { path: '/corporate/spending',  name: 'corp-spending',  component: SpendingAnalytics },

  // ── Consultant ──────────────────────────────────────────────────────────────
  { path: '/consultant/dashboard', name: 'consultant-dashboard', component: ConsultantPortal },
  { path: '/consultant/reports',   name: 'consultant-reports',   component: ExpertReports },
  { path: '/consultant/evidence',  name: 'consultant-evidence',  component: EvidenceChainOfCustody },
  { path: '/consultant/calendar',  name: 'consultant-calendar',  component: ConsultantPortal },
  { path: '/consultant/messages',  name: 'consultant-messages',  component: ConsultantPortal },
  { path: '/consultant/invoices',  name: 'consultant-invoices',  component: ConsultantPortal },

  // ── Court Liaison ────────────────────────────────────────────────────────────
  { path: '/court-liaison/dashboard',      name: 'cl-dashboard',  component: CourtLiaisonDashboard },
  { path: '/court-liaison/notices',        name: 'cl-notices',    component: CourtNotices },
  { path: '/court-liaison/filings',        name: 'cl-filings',    component: FilingTracker },
  { path: '/court-liaison/deadlines',      name: 'cl-deadlines',  component: FilingTracker },
  { path: '/court-liaison/communications', name: 'cl-comms',      component: CourtCommunicationLog },

  // ── Investigator ─────────────────────────────────────────────────────────────
  { path: '/investigator/dashboard',  name: 'inv-dashboard',  component: InvestigatorDashboard },
  { path: '/investigator/findings',   name: 'inv-findings',   component: InvestigationFindings },
  { path: '/investigator/custody',    name: 'inv-custody',    component: EvidenceChainOfCustody },
  { path: '/investigator/interviews', name: 'inv-interviews', component: InterviewRecords },
  { path: '/investigator/gps',        name: 'inv-gps',        component: InvestigationFindings },

  // ── Compliance ───────────────────────────────────────────────────────────────
  { path: '/compliance/dashboard',  name: 'comp-dashboard',  component: ComplianceDashboard },
  { path: '/compliance/ai-checker', name: 'comp-ai-checker', component: AIComplianceChecker },
  { path: '/compliance/clauses',    name: 'comp-clauses',    component: AIComplianceChecker },
  { path: '/compliance/risk',       name: 'comp-risk',       component: RiskAnalysis },
  { path: '/compliance/approvals',  name: 'comp-approvals',  component: ComplianceApprovals },
  { path: '/compliance/flags',      name: 'comp-flags',      component: RiskAnalysis },

  // ── Premium AI ──────────────────────────────────────────────────────────────
  { path: '/ai-premium',                        name: 'ai-premium-hub',         component: AIPremiumHub },
  { path: '/ai-premium/legal-research',         name: 'ai-legal-research',      component: AILegalResearch },
  { path: '/ai-premium/contract-generation',    name: 'ai-contract-gen',        component: AIContractGeneration },
  { path: '/ai-premium/clause-suggestions',     name: 'ai-clause-suggestions',  component: AIClauseSuggestions },
  { path: '/ai-premium/document-summary',       name: 'ai-doc-summary',         component: AIDocumentSummarization },
  { path: '/ai-premium/citation-generation',    name: 'ai-citation-gen',        component: AILegalCitationGenerator },
  { path: '/ai-premium/hearing-preparation',    name: 'ai-hearing-prep',        component: AIHearingPreparation },
  { path: '/ai-premium/deposition-preparation', name: 'ai-deposition-prep',     component: AIDepositionPreparation },
  { path: '/ai-premium/evidence-summary',       name: 'ai-evidence-summary',    component: AIEvidenceSummarization },
  { path: '/ai-premium/meeting-transcription',  name: 'ai-transcription',       component: AIMeetingTranscription },
  { path: '/ai-premium/translation',            name: 'ai-translation',         component: AIMultilingualTranslation },
  { path: '/ai-premium/client-intake',          name: 'ai-client-intake',       component: AIClientIntakeAssistant },
  { path: '/ai-premium/risk-analysis',          name: 'ai-risk-analysis',       component: AILegalRiskAnalysis },
  { path: '/ai-premium/invoice-generation',     name: 'ai-invoice-gen',         component: AIInvoiceGeneration },
  { path: '/ai-premium/email-drafting',         name: 'ai-email-drafting',      component: AIEmailDrafting },
  { path: '/ai-premium/task-recommendations',   name: 'ai-task-reco',           component: AITaskRecommendations },
  { path: '/ai-premium/deadline-prediction',    name: 'ai-deadline-pred',       component: AIDeadlinePrediction },
  { path: '/ai-premium/conflict-detection',     name: 'ai-conflict-detect',     component: AIConflictDetection },
  { path: '/ai-premium/litigation-strategy',    name: 'ai-litigation-strategy', component: AILitigationStrategy },
  { path: '/ai-premium/document-comparison',    name: 'ai-doc-comparison',      component: AIDocumentComparison },
  { path: '/ai-premium/knowledge-search',       name: 'ai-knowledge-search',    component: AIKnowledgeBaseSearch },
  // ── Enterprise ──────────────────────────────────────────────────────────────
  { path: '/enterprise/dashboard',        name: 'ent-dashboard',     component: EnterpriseHub },
  { path: '/enterprise/offices',          name: 'ent-offices',       component: MultiOfficeManagement },
  { path: '/enterprise/countries',        name: 'ent-countries',     component: MultiCountrySupport },
  { path: '/enterprise/branding',         name: 'ent-branding',      component: EnterpriseHub },
  { path: '/enterprise/domains',          name: 'ent-domains',       component: CustomDomains },
  { path: '/enterprise/sso',              name: 'ent-sso',           component: SSOConfiguration },
  { path: '/enterprise/2fa',              name: 'ent-2fa',           component: TwoFactorAuth },
  { path: '/enterprise/rbac',             name: 'ent-rbac',          component: AdvancedRBAC },
  { path: '/enterprise/webhooks',         name: 'ent-webhooks',      component: WebhooksManager },
  { path: '/enterprise/automation',       name: 'ent-automation',    component: AutomationRules },
  { path: '/enterprise/retention',        name: 'ent-retention',     component: RetentionPolicies },
  { path: '/enterprise/data-export',      name: 'ent-data-export',   component: DataExportImport },
  { path: '/enterprise/bi',               name: 'ent-bi',            component: BusinessIntelligence },
  { path: '/enterprise/crm',              name: 'ent-crm',           component: CRMIntegration },
  { path: '/enterprise/accounting',       name: 'ent-accounting',    component: AccountingIntegration },
  { path: '/enterprise/court-efiling',    name: 'ent-court-efiling', component: CourtEFiling },
  { path: '/enterprise/mobile',           name: 'ent-mobile',        component: MobileApps },
  { path: '/enterprise/offline',          name: 'ent-offline',       component: OfflineAccess },
  { path: '/enterprise/disaster-recovery',name: 'ent-dr',            component: DisasterRecovery },
  { path: '/enterprise/compliance',       name: 'ent-compliance',    component: EntComplianceDashboard },
  { path: '/enterprise/audit-logs',       name: 'ent-audit-logs',    component: EnterpriseAuditLogs },
  { path: '/enterprise/api-dashboard',    name: 'ent-api',           component: WebhooksManager },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router