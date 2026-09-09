import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Cable,
  CheckCircle,
  Cpu,
  Globe,
  Lock,
  Mail,
  Network,
  Server,
  Shield,
  Wifi,
  X,
} from 'lucide-react';
import { Button } from './ui';

const LANDING_TITLE =
  'CompTIA Network+ & Security+ Zero-to-Hero 3D Lab — Erick OMARI';
const LANDING_DESC =
  'Master CompTIA Network+ and Security+ through an interactive 3D lab, safe simulations, hands-on exercises, and real-world scenarios. Built by Erick OMARI.';

function NetworkBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
      <svg className="absolute h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent/30" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute left-[10%] top-[15%] h-3 w-3 rounded-full bg-accent/40 shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-float" />
      <div className="absolute left-[25%] top-[45%] h-2 w-2 rounded-full bg-accent-2/50 shadow-[0_0_15px_rgba(129,140,248,0.5)] animate-float [animation-delay:1s]" />
      <div className="absolute right-[20%] top-[20%] h-4 w-4 rounded-full bg-ok/30 shadow-[0_0_25px_rgba(34,197,94,0.4)] animate-float [animation-delay:2s]" />
      <div className="absolute right-[15%] bottom-[25%] h-2 w-2 rounded-full bg-accent/40 shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-float [animation-delay:3s]" />
      <div className="absolute left-[40%] bottom-[15%] h-3 w-3 rounded-full bg-accent-2/40 shadow-[0_0_20px_rgba(129,140,248,0.5)] animate-float [animation-delay:4s]" />
      <Cable className="absolute left-[12%] top-[18%] h-6 w-6 text-accent/20 rotate-12 animate-pulse-glow" />
      <Wifi className="absolute right-[18%] top-[22%] h-8 w-8 text-ok/20 -rotate-12 animate-pulse-glow [animation-delay:1s]" />
      <Server className="absolute left-[20%] bottom-[20%] h-7 w-7 text-accent-2/20 rotate-6 animate-pulse-glow [animation-delay:2s]" />
      <Globe className="absolute right-[12%] bottom-[18%] h-8 w-8 text-accent/20 -rotate-6 animate-pulse-glow [animation-delay:3s]" />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <div
      className="group rounded-xl border border-border bg-panel/80 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-panel hover:shadow-[0_0_30px_rgba(56,189,248,0.08)] animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3 text-accent">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Network+ Lab inquiry from ${name}`);
    const body = encodeURIComponent(
      `${message}\n\n--\nName: ${name}\nReply-to: ${email}`
    );
    window.location.href = `mailto:erickomari243@gmail.com?subject=${subject}&body=${body}`;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-muted transition-colors hover:bg-panel-2 hover:text-white"
          aria-label="Close contact form"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="contact-title" className="mb-1 text-xl font-bold text-white">
          Contact the Lab
        </h2>
        <p className="mb-6 text-sm text-muted">
          Send a message about the Network+ or Security+ lab.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="contact-name" className="mb-1 block text-xs font-medium text-muted">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1 block text-xs font-medium text-muted">
              Your email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block text-xs font-medium text-muted">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="How can I help you?"
            />
          </div>
          <Button type="submit" variant="primary" onClick={() => {}}>
            <Mail className="mr-2 h-4 w-4" />
            Send message
          </Button>
        </form>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    document.title = LANDING_TITLE;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', LANDING_DESC);

    let ld: HTMLScriptElement | null = document.getElementById(
      'landing-ld'
    ) as HTMLScriptElement;
    if (!ld) {
      ld = document.createElement('script');
      ld.id = 'landing-ld';
      ld.type = 'application/ld+json';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: LANDING_TITLE,
          url: window.location.origin,
          description: LANDING_DESC,
          author: {
            '@type': 'Person',
            name: 'Erick OMARI',
          },
        },
        {
          '@type': 'SoftwareApplication',
          name: 'CompTIA Network+ & Security+ Zero-to-Hero 3D Lab',
          applicationCategory: 'EducationApplication',
          operatingSystem: 'Web',
          creator: {
            '@type': 'Person',
            name: 'Erick OMARI',
          },
        },
      ],
    });

    return () => {
      document.title = 'Security+ Zero-to-Hero — 3D Lab Platform';
      ld?.remove();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-text">
      <NetworkBackground />

      <header className="relative z-10 border-b border-border/50 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent/10 p-2 text-accent">
              <Network className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold text-white">NetSec Lab</span>
          </div>
          <nav aria-label="Primary">
            <Button variant="ghost" onClick={() => setShowContact(true)}>
              Contact Us
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent animate-fade-in">
              <Cpu className="h-4 w-4" />
              <span>CompTIA Network+ & Security+ aligned</span>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-6xl animate-fade-in-up">
              From cables to careers —{' '}
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
                master networking & security
              </span>{' '}
              in 3D
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted animate-fade-in-up [animation-delay:150ms]">
              A hands-on, browser-based lab built by{' '}
              <strong className="text-white">Erick OMARI</strong>. Explore
              networks, simulate real devices, practice security scenarios, and
              build job-ready skills with zero risk to live systems.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up [animation-delay:300ms]">
              <Button onClick={() => navigate('/')}>Access the Lab</Button>
              <Button variant="ghost" onClick={() => setShowContact(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 animate-fade-in-up [animation-delay:450ms]">
            {[
              { label: 'Phases', value: '28' },
              { label: '3D Scenes', value: '15+' },
              { label: 'Labs', value: '40+' },
              { label: 'Safe Simulations', value: '100%' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-panel/60 px-6 py-4 text-center backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-accent">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 px-6 py-24" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 id="features-heading" className="text-3xl font-bold text-white">
                Why this lab stands out
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted">
                Every module connects theory to action — the same way a network
                engineer or security analyst actually works.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Globe}
                title="Interactive 3D Network Environment"
                body="Walk through routers, switches, firewalls, and endpoints in a live 3D topology. Click, inspect, and trace traffic paths instead of memorizing static diagrams."
                delay={0}
              />
              <FeatureCard
                icon={Shield}
                title="CompTIA Security+ Aligned"
                body="Covers all five SY0-701 domains: concepts, threats, architecture, operations, and program management — with quizzes, labs, and mock exams."
                delay={100}
              />
              <FeatureCard
                icon={Server}
                title="Safe, Deterministic Simulations"
                body="Run commands, capture packets, and investigate incidents without touching real networks. Every output is clearly labeled real, simulated, or prepared."
                delay={200}
              />
              <FeatureCard
                icon={Lock}
                title="Security-First Mindset"
                body="Learn Zero Trust, defense in depth, identity lifecycle, and incident response through guided scenarios rather than bullet lists."
                delay={300}
              />
              <FeatureCard
                icon={BookOpen}
                title="Career-Ready Portfolio"
                body="Build lab reports, GitHub documentation, and a skills map that translates certification knowledge into interview answers."
                delay={400}
              />
              <FeatureCard
                icon={CheckCircle}
                title="Mastery Tracking"
                body="A 0–6 mastery ladder plus spaced repetition keeps weak areas in front of you until you can explain, apply, and teach each concept."
                delay={500}
              />
            </div>
          </div>
        </section>

        <section className="relative z-10 px-6 py-24" aria-labelledby="creator-heading">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center gap-10 rounded-2xl border border-border bg-panel/80 p-8 backdrop-blur-sm md:flex-row md:p-12">
              <div className="shrink-0">
                <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-accent/20 shadow-[0_0_40px_rgba(56,189,248,0.15)]">
                  <img
                    src="/Erick.jpg"
                    alt="Erick OMARI — creator of the CompTIA Network+ and Security+ Zero-to-Hero 3D Lab"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    width="192"
                    height="192"
                  />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 id="creator-heading" className="text-3xl font-bold text-white">
                  Built by Erick OMARI
                </h2>
                <p className="mt-4 text-muted">
                  This lab was created by <strong className="text-white">Erick OMARI</strong>{' '}
                  to bridge the gap between certification study and real-world IT
                  operations. Whether you are starting with Network+ fundamentals
                  or preparing for a Security+ exam and a junior cybersecurity role,
                  the platform takes you from zero to hands-on professional through
                  guided 3D labs, safe simulations, and career-focused projects.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row md:justify-start">
                  <Button onClick={() => navigate('/')}>Start learning</Button>
                  <Button variant="ghost" onClick={() => setShowContact(true)}>
                    Get in touch
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-6 py-24" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-accent/10 to-accent-2/10 p-10 text-center border border-accent/20">
            <h2 id="cta-heading" className="text-3xl font-bold text-white">
              Ready to build your network and security skills?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Jump into the lab, explore the 3D SOC, run your first simulation, and
              see how far the zero-to-hero path can take you.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button onClick={() => navigate('/')}>Access the Lab</Button>
              <Button variant="ghost" onClick={() => setShowContact(true)}>
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border bg-panel/50 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-accent" />
            <span className="font-semibold text-white">NetSec Lab</span>
          </div>
          <p className="text-center text-sm text-muted">
            &copy; {new Date().getFullYear()} Erick OMARI. CompTIA Network+ & Security+ Zero-to-Hero 3D Lab.
          </p>
          <Button variant="ghost" onClick={() => setShowContact(true)}>
            Contact Us
          </Button>
        </div>
      </footer>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
