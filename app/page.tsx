import Link from "next/link"
import {
  Activity,
  ArrowRight,
  Binary,
  BookOpenCheck,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  GitBranch,
  Globe2,
  Layers,
  LineChart,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"


  // heroHighlights defines the key benefits displayed in the hero section of the landing page.
// Each object includes a title, description, and an icon c
const heroHighlights = [

  {
    title: "Pre-runtime failure detection",
    description: "Catches brittle agent flows, schema mismatches, and risky SDK calls before code ships.",
    icon: ShieldCheck,
  },
  {
    title: "Deterministic CI/CD gating",
    description: "Spelunker policies deliver reproducible scores, so every merge meets the same standard.",
    icon: GitBranch,
  },
  {
    title: "Token cost intelligence",
    description: "Forecasts token spend, detects cacheable prompts, and surfaces concrete savings paths.",
    icon: LineChart,
  },
]


// coreCapabilities lists the primary modules offered by the tool along with a summary, bullet points, and an icon.
// Each object represents a capability with details students can learn from.
const coreCapabilities = [
  {
    name: "Static SDK Validator",
    summary:
      "Parses Python 3.8–3.12 agent workflows in under a second per file, mapping every tool invocation with deterministic hashes.",
    bullets: [
      "Precisely flags missing, extra, and mistyped parameters with file:line:col context",
      "Never crashes on syntax errors – downgrades to warnings with recovery",
      "Configurable include/exclude patterns that mirror real repos",
 
],
    icon: Binary,
  },
  {
    name: "Pattern Match Engine",
    summary:
      "Version-aware similarity search across a living knowledge base of production incidents, GitHub fixes, and tests.",
    bullets: [
      "Ranks matches with confidence scores tied to specific issues, PRs, and regression tests",
      "Respects SDK versions so your team only gets relevant fixes",
      "Ships with offline bundles so air-gapped environments still get coverage",
    ],
    icon: BrainCircuit,
  },
  {
    name: "Token Efficiency Analyzer",
    summary:
      "Understands prompts, f-strings, and templating libraries to model real token usage before you run them.",
    bullets: [
      "Identifies cacheable, batchable, and deduplicated segments with estimated savings",
      "Produces what-if reports comparing current vs optimized spend",
      "Connects insights back to exact source snippets",
    ],
    icon: Activity,
  },
  {
    name: "Deterministic CI/CD Gate",
    summary:
      "Turns spelunker.yml policies into pass/fail enforcement backed by structured artifacts and OTEL traces.",
    bullets: [
      "Fails closed on internal errors (configurable) so risky builds never slip",
      "Outputs analysis.json, human-readable reports, and PR annotations",
      "Links build IDs to OTEL metrics for downstream observability",
    ],
    icon: Workflow,
  },
]

const differentiators = [
  {
    title: "AI-native experience",
    description: "Explainability and rule authoring in natural language, built so AI agents and humans understand the same findings.",
    icon: Sparkles,
  },
  {
    title: "Evidence-backed patterns",
    description: "Every rule originates from real incidents across LangGraph, CrewAI, AutoGen, and top enterprise repos.",
    icon: BookOpenCheck,
  },
  {
    title: "Version + context aware",
    description: "Keeps pattern databases tied to SDK releases, avoiding noisy false positives from incompatible APIs.",
    icon: Layers,
  },
  {
    title: "Cost & security in one run",
    description: "Token and performance modeling land alongside supply-chain checks, so you prioritize the right fix.",
    icon: Lock,
  },

// differentiators highlight features that set the platform apart.
// Each object includes a title, description, and icon component.
]// personas define the user roles this platform targets, their pain points, and how the product helps them.


const personas = [
  {
    role: "AI Engineers",
    pain: "Need fast feedback on agent flows without waiting for staging incidents.",
    win: "Inline IDE extensions and CLI scans highlight the exact module, argument, and fix template in seconds.",
    icon: Cpu,
  },
  {
    role: "DevOps / SRE",
    pain: "Production drops trace back to misconfigured tools and brittle chains discovered too late.",
    win: "Deterministic merge gates, OTEL exports, and environment-aware thresholds keep releases safe.",
    icon: Network,
  },
  {
    role: "Platform Architects",
    pain: "Governance teams juggle compliance, cost, and reliability with limited AI-literate tooling.",
    win: "Organization-wide pattern libraries, offline bundles, and reproducible metrics support rollout at scale.",
    icon: Globe2,
  },
]
    // metrics define quantifiable scores computed by the system to guide improvements.
// Each object includes a label and an explanation of its meaning.


const metrics = [
  {
    label: "token_efficiency_score",
    meaning: "Compare actual vs optimal tokens to spot waste before it hits production invoices.",
  },
  {
    label: "failure_prediction_score",
    meaning: "Quantifies the likelihood an invocation will trigger a known incident pattern.",
  },
  {
    label: "cost_optimization_potential",
    meaning: "Translates remediation opportunities into $ savings tied to specific prompts.",
  },
  {
    label: "pattern_match_confidence",
    meaning: "Assigns similarity scores grounded in historic issues so you can trust each flag.",
  },
  {
    label: "fix_suggestion_accuracy",
    meaning: "Measures how closely suggested fixes match real PRs used in the wild.",
  },
]

// roadmap outlines the phased rollout timeline for the tool.
// Each object defines a phase with its name, time window, and key focus.
const roadmap = [
  {
    phase: "Phase 1 · Developer Adoption",
    window: "Months 1-6",
    focus: "Launch CLI + IDE extensions with the top LangGraph, CrewAI, and AutoGen failure patterns preloaded.",
  },
  {
    phase: "Phase 2 · Team Integration",
    window: "Months 6-12",
    focus: "Ship GitHub Actions, GitLab CI, and Jenkins integrations with shared dashboards and policy packs.",
  },
  {
    phase: "Phase 3 · Enterprise Platform",
    window: "Year 2+",
    focus: "Deliver governance, compliance reporting, and secure pattern libraries tailored to regulated industries.",
  },
]

const workflow = [
  {
    step: "Mine & Learn",
    detail: "Harvest GitHub issues, PRs, test suites, production repos, and Stack Overflow threads for validated patterns.",
    icon: Boxes,
  },
  {
    step: "Model & Score",
    detail: "Vectorize code, enforce version gates, and assign deterministic hashes for reproducible analysis runs.",
    icon: CircuitBoard,
  },
  {
    step: "Alert & Act",
    detail: "Surface inline fixes, CI annotations, OTEL events, and token optimization plans ready for automation.",
    icon: CheckCircle2,
 
  // workflow outlines the sequence of processes used to mine patterns, model them, and act upon them.
// Each entry includes a step name, detailed description, and an icon.
},
]


// LandingPage composes the entire landing page using the defined sections above.
// It returns the full page markup with hero, core capabilities, personas, metrics, roadmap, and workflow sections.
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(58,113,255,0.22),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(183,71,255,0.18),_transparent_50%)]" />
      <div className="relative">
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Module Spelunker</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Pattern certainty for agentic AI systems</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
                Catch failure-prone SDK calls, orchestration gaps, and runaway token spend before your agents ever hit production.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href="#early-access"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02] hover:shadow-indigo-500/40"
              >
                Request early access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <span className="text-xs text-white/60">Built for AI engineers, SRE, and platform teams.</span>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-14">
          <div className="grid gap-6 md:grid-cols-3">
            {heroHighlights.map((item) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-indigo-400/40 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-indigo-300">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.35em] text-indigo-300">Core platform</span>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold sm:text-4xl">Everything critical happens before runtime</h2>
              <p className="hidden max-w-sm text-sm text-white/60 md:block">
                Module Spelunker inspects Python-based agent stacks, predicts failure modes, and exports reproducible findings your
                automation can trust.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {coreCapabilities.map((capability) => (
              <div
                key={capability.name}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/4 to-transparent p-8 shadow-lg shadow-black/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <capability.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{capability.name}</h3>
                </div>
                <p className="mt-4 text-sm text-white/70">{capability.summary}</p>
                <ul className="mt-6 space-y-2 text-sm text-white/75">
                  {capability.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-indigo-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-indigo-400/30 bg-indigo-950/40 p-10 shadow-2xl shadow-indigo-900/40">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.35em] text-indigo-200">Why teams switch</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Differentiators you won&apos;t find in generic static analysis</h2>
              <p className="text-sm text-indigo-100/70">
                Module Spelunker merges AI-native context, deterministic scoring, and cost optics into a single inspection pass that
                humans and autonomous agents can act on instantly.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {differentiators.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <item.icon className="h-6 w-6 text-indigo-200" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.35em] text-indigo-300">Designed for impact</span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Who benefits day one</h2>
            <p className="max-w-2xl text-sm text-white/70">
              Module Spelunker is built for bottom-up adoption: start with individual developers, grow into team workflows, and scale to
              enterprise governance.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {personas.map((persona) => (
              <div key={persona.role} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-200">
                  <persona.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{persona.role}</h3>
                <p className="mt-3 text-sm font-semibold text-white/70">Pain we solve</p>
                <p className="text-sm text-white/60">{persona.pain}</p>
                <p className="mt-4 text-sm font-semibold text-white/70">How they win</p>
                <p className="text-sm text-white/60">{persona.win}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.35em] text-indigo-300">Deterministic insight layer</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Metrics every stakeholder can trust</h2>
              <p className="max-w-3xl text-sm text-white/70">
                Each analysis run emits a reproducible hash and structured artifacts so findings can flow into CI gates, dashboards, and
                OTEL pipelines without translation.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">{metric.label}</h3>
                  <p className="mt-3 text-sm text-white/70">{metric.meaning}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Testing Guardrails</h3>
                <p className="mt-3 text-sm text-white/70">
                  Historical validation targets &gt;70% detection on real incidents, &gt;70% fix similarity, and &lt;10% false positives — all
                  grounded in six months of OpenAI SDK failures.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.35em] text-indigo-300">How it works</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">An agent-operable pipeline from evidence to action</h2>
              <p className="max-w-3xl text-sm text-white/70">
                Designed so autonomous agents can operate safely: structured outputs, deterministic scores, and direct fix
                recommendations.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {workflow.map((stage, index) => (
                <div key={stage.step} className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-indigo-200">
                    <stage.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">Step {index + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{stage.step}</h3>
                  <p className="mt-2 text-sm text-white/70">{stage.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.35em] text-indigo-300">Go-to-market path</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">From individual champion to enterprise standard</h2>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {roadmap.map((phase) => (
                <div key={phase.phase} className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{phase.window}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{phase.phase}</h3>
                  <p className="mt-3 text-sm text-white/70">{phase.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24" id="early-access">
          <div className="rounded-3xl border border-indigo-400/30 bg-gradient-to-r from-indigo-600/60 via-purple-600/60 to-fuchsia-500/60 p-10 text-white shadow-2xl shadow-purple-900/40">
            <h2 className="text-3xl font-semibold sm:text-4xl">Join the Module Spelunker beta</h2>
            <p className="mt-4 max-w-2xl text-sm text-white/80">
              We&apos;re onboarding AI platform teams who want proactive guardrails across LangGraph, CrewAI, AutoGen, and custom agent
              frameworks. Tell us about your stack and we&apos;ll reserve your spot.
            </p>
            <form
              action="https://formcarry.com/s/r-m7iylu-Vi"
              method="POST"
              acceptCharset="UTF-8"
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                autoComplete="name"
                required
                className="rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="email"
                name="email"
                placeholder="Work email"
                autoComplete="email"
                required
                className="rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                name="primary_framework"
                placeholder="Primary agent framework"
                className="rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                name="company_size"
                placeholder="Company size"
                className="rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <textarea
                name="request_details"
                placeholder="What failure patterns should we hunt for you?"
                rows={3}
                className="sm:col-span-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="sm:col-span-2 inline-flex items-center justify-center rounded-full bg-black/40 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/40 transition hover:scale-[1.02]"
              >
                Secure beta invite
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
            <p className="mt-3 text-xs text-white/70">Prefer async? Email spelunker@module.ai with your stack details.</p>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/80 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module Spelunker</p>
              <p className="mt-2 text-sm text-white/60">Static intelligence for agentic systems · 2025</p>
            </div>
            <div className="flex flex-col gap-1 text-xs text-white/50 sm:items-end">
              <p>Focused on the OpenAI Python SDK first, expanding to multi-modal pipelines next.</p>
              <p>Made with deterministic love by Saksham Adhikari.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
