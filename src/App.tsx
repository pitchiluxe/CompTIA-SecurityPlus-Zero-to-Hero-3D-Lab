import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

// ---------------------------------------------------------------------------
// Route-level code splitting.
//
// Dashboard stays eager — it is the landing route and needs the curriculum for
// progress totals anyway. Everything else loads on navigation, which pulls each
// view's own data files (networkZones, attackChain, defenceLayers,
// riskScenarios, connectionPath) out of the initial bundle along with it.
// ---------------------------------------------------------------------------

const Roadmap = lazy(() => import('./components/Roadmap').then((m) => ({ default: m.Roadmap })));
const SOCView = lazy(() => import('./components/SOCView').then((m) => ({ default: m.SOCView })));
const PathView = lazy(() => import('./components/PathView').then((m) => ({ default: m.PathView })));
const ControlsView = lazy(() =>
  import('./components/ControlsView').then((m) => ({ default: m.ControlsView }))
);
const ScenarioWorkbench = lazy(() =>
  import('./components/ScenarioWorkbench').then((m) => ({ default: m.ScenarioWorkbench }))
);
const AttackChainView = lazy(() =>
  import('./components/AttackChainView').then((m) => ({ default: m.AttackChainView }))
);
const ZonesView = lazy(() =>
  import('./components/ZonesView').then((m) => ({ default: m.ZonesView }))
);
const IdentityView = lazy(() =>
  import('./components/IdentityView').then((m) => ({ default: m.IdentityView }))
);
const IamTroubleshootView = lazy(() =>
  import('./components/IamTroubleshootView').then((m) => ({ default: m.IamTroubleshootView }))
);
const CryptoView = lazy(() =>
  import('./components/CryptoView').then((m) => ({ default: m.CryptoView }))
);
const SocConsoleView = lazy(() =>
  import('./components/SocConsoleView').then((m) => ({ default: m.SocConsoleView }))
);
const HardeningAuditView = lazy(() =>
  import('./components/HardeningAuditView').then((m) => ({ default: m.HardeningAuditView }))
);
const VulnManagementView = lazy(() =>
  import('./components/VulnManagementView').then((m) => ({ default: m.VulnManagementView }))
);
const NetworkReviewView = lazy(() =>
  import('./components/NetworkReviewView').then((m) => ({ default: m.NetworkReviewView }))
);
const IncidentConsoleView = lazy(() =>
  import('./components/IncidentConsoleView').then((m) => ({ default: m.IncidentConsoleView }))
);
const LessonView = lazy(() =>
  import('./components/LessonView').then((m) => ({ default: m.LessonView }))
);
const LabView = lazy(() => import('./components/LabView').then((m) => ({ default: m.LabView })));
const LabLibrary = lazy(() =>
  import('./components/LabLibrary').then((m) => ({ default: m.LabLibrary }))
);
const QuizView = lazy(() => import('./components/QuizView').then((m) => ({ default: m.QuizView })));
const ProgressView = lazy(() =>
  import('./components/ProgressView').then((m) => ({ default: m.ProgressView }))
);
const NotesView = lazy(() =>
  import('./components/NotesView').then((m) => ({ default: m.NotesView }))
);
const EvidenceView = lazy(() =>
  import('./components/EvidenceView').then((m) => ({ default: m.EvidenceView }))
);
const GitHubView = lazy(() =>
  import('./components/GitHubView').then((m) => ({ default: m.GitHubView }))
);
const CloudSecurityView = lazy(() =>
  import('./components/CloudSecurityView').then((m) => ({ default: m.CloudSecurityView }))
);
const ThreatIntelView = lazy(() =>
  import('./components/ThreatIntelView').then((m) => ({ default: m.ThreatIntelView }))
);
const MobileIotView = lazy(() =>
  import('./components/MobileIotView').then((m) => ({ default: m.MobileIotView }))
);
const AppDataSecurityView = lazy(() =>
  import('./components/AppDataSecurityView').then((m) => ({ default: m.AppDataSecurityView }))
);
const GrcView = lazy(() => import('./components/GrcView').then((m) => ({ default: m.GrcView })));
const BcdrView = lazy(() => import('./components/BcdrView').then((m) => ({ default: m.BcdrView })));
const SecurityHardeningView = lazy(() =>
  import('./components/SecurityHardeningView').then((m) => ({ default: m.SecurityHardeningView }))
);
const AutomationView = lazy(() =>
  import('./components/AutomationView').then((m) => ({ default: m.AutomationView }))
);
const PacketAnalysisView = lazy(() =>
  import('./components/PacketAnalysisView').then((m) => ({ default: m.PacketAnalysisView }))
);
const TroubleshootCenterView = lazy(() =>
  import('./components/TroubleshootCenterView').then((m) => ({ default: m.TroubleshootCenterView }))
);
const SocCapstoneView = lazy(() =>
  import('./components/SocCapstoneView').then((m) => ({ default: m.SocCapstoneView }))
);
const ExamPrepView = lazy(() =>
  import('./components/ExamPrepView').then((m) => ({ default: m.ExamPrepView }))
);
const CareerModeView = lazy(() =>
  import('./components/CareerModeView').then((m) => ({ default: m.CareerModeView }))
);
const IamBridgeView = lazy(() =>
  import('./components/IamBridgeView').then((m) => ({ default: m.IamBridgeView }))
);
const CertificateView = lazy(() =>
  import('./components/CertificateView').then((m) => ({ default: m.CertificateView }))
);

function RouteFallback() {
  return <div className="p-6 text-sm text-muted">Loading…</div>;
}

export function App() {
  const location = useLocation();
  if (location.pathname === '/landing') {
    return <LandingPage />;
  }

  return (
    <AppLayout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/soc" element={<SOCView />} />
          <Route path="/path" element={<PathView />} />
          <Route path="/controls" element={<ControlsView />} />
          <Route path="/scenarios" element={<ScenarioWorkbench />} />
          <Route path="/attack-chain" element={<AttackChainView />} />
          <Route path="/zones" element={<ZonesView />} />
          <Route path="/identity" element={<IdentityView />} />
          <Route path="/iam-troubleshoot" element={<IamTroubleshootView />} />
          <Route path="/crypto" element={<CryptoView />} />
          <Route path="/soc-console" element={<SocConsoleView />} />
          <Route path="/hardening" element={<HardeningAuditView />} />
          <Route path="/vulnerabilities" element={<VulnManagementView />} />
          <Route path="/network-review" element={<NetworkReviewView />} />
          <Route path="/incident-console" element={<IncidentConsoleView />} />
          <Route path="/threat-intel" element={<ThreatIntelView />} />
          <Route path="/cloud-security" element={<CloudSecurityView />} />
          <Route path="/mobile-iot" element={<MobileIotView />} />
          <Route path="/app-data-security" element={<AppDataSecurityView />} />
          <Route path="/grc" element={<GrcView />} />
          <Route path="/bcdr" element={<BcdrView />} />
          <Route path="/security-hardening" element={<SecurityHardeningView />} />
          <Route path="/automation" element={<AutomationView />} />
          <Route path="/packet-analysis" element={<PacketAnalysisView />} />
          <Route path="/troubleshoot-center" element={<TroubleshootCenterView />} />
          <Route path="/soc-capstone" element={<SocCapstoneView />} />
          <Route path="/exam-prep" element={<ExamPrepView />} />
          <Route path="/career-mode" element={<CareerModeView />} />
          <Route path="/iam-bridge" element={<IamBridgeView />} />
          <Route path="/certificate" element={<CertificateView />} />
          <Route path="/labs" element={<LabLibrary />} />
          <Route path="/lesson/:lessonId" element={<LessonView />} />
          <Route path="/lab/:labId" element={<LabView />} />
          <Route path="/quiz" element={<QuizView />} />
          <Route path="/quiz/:lessonId" element={<QuizView />} />
          <Route path="/progress" element={<ProgressView />} />
          <Route path="/notes" element={<NotesView />} />
          <Route path="/evidence" element={<EvidenceView />} />
          <Route path="/github" element={<GitHubView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
