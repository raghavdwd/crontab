import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { 
  Clock, 
  Shield, 
  Sparkles, 
  Code, 
  ArrowRight, 
  Server, 
  CheckCircle2, 
  Database,
  ArrowUpRight,
  Activity,
  Terminal,
  RefreshCw,
  HelpCircle
} from "lucide-react";

export const Landing: React.FC = () => {
  const { user } = useAuth();

  // Interactive AI parser mockup state
  const [demoInput, setDemoInput] = useState("");
  const [demoOutput, setDemoOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDemoGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      let result = "*/15 * * * *";
      const text = demoInput.toLowerCase();
      if (text.includes("3am") || text.includes("3 am")) {
        result = "0 3 * * *";
      } else if (text.includes("hour")) {
        result = "0 * * * *";
      } else if (text.includes("weekday")) {
        result = "0 0 * * 1-5";
      } else if (text.includes("minute")) {
        result = "*/1 * * * *";
      } else if (text.includes("sunday")) {
        result = "0 0 * * 0";
      }
      setDemoOutput(result);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans selection:bg-neutral-200/60 selection:text-black">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e7] bg-white px-3 py-1 text-xs font-light text-[#71717a] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-black stroke-[1.5]" />
            <span>Introducing crontab.sh v1.0</span>
          </div>

          <h1 className="mt-8 max-w-3xl font-sans text-4xl font-normal leading-[1.15] tracking-tight sm:text-5xl md:text-6xl text-black">
            Automate API pings with elegant <br />
            <span className="font-light text-[#71717a]">cron scheduling</span>.
          </h1>

          <p className="mt-6 max-w-xl text-sm md:text-base font-light leading-relaxed text-[#71717a]">
            A beautiful, cloud-native web tool to schedule HTTP requests, manage triggers, and inspect execution logs. Zero setup required.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="h-11 bg-black hover:bg-black/90 text-white font-light tracking-wide px-8 rounded-lg shadow-sm">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4 stroke-[1.5]" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button className="h-11 bg-black hover:bg-black/90 text-white font-light tracking-wide px-8 rounded-lg shadow-sm">
                    Start Scheduling Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="h-11 border-[#e4e4e7] bg-white hover:bg-neutral-50 text-black font-light tracking-wide px-8 rounded-lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-20 md:mt-24 w-full overflow-hidden rounded-2xl border border-[#f1f1f4] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f1f1f4] pb-3 mb-4">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/30" />
              <span className="h-3 w-3 rounded-full bg-[#eab308]/20 border border-[#eab308]/30" />
              <span className="h-3 w-3 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30" />
            </div>
            <div className="rounded-md bg-neutral-50 px-8 py-1.5 text-[11px] font-light text-[#71717a] border border-[#f1f1f4] font-mono">
              crontab.sh/dashboard
            </div>
            <div className="w-8" />
          </div>
          <div className="aspect-[16/9] w-full bg-neutral-50/50 rounded-lg p-6 flex flex-col gap-6 overflow-hidden">
            {/* Mock Dashboard Headers */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1.5 text-left">
                <span className="h-4 w-28 bg-[#e4e4e7] rounded" />
                <span className="h-3 w-48 bg-[#f4f4f5] rounded" />
              </div>
              <div className="h-8 w-28 bg-black rounded-lg" />
            </div>
            
            {/* Mock Job Rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Sync Payments", schedule: "*/15 * * * *", badge: "Active" },
                { name: "Backup Database", schedule: "0 3 * * *", badge: "Active" },
                { name: "Uptime Ping", schedule: "*/5 * * * *", badge: "Active" }
              ].map((job, idx) => (
                <div key={idx} className="border border-[#e4e4e7]/60 bg-white rounded-xl p-4 flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-black">{job.name}</span>
                    <span className="h-4 w-12 bg-emerald-50 text-[10px] font-medium text-emerald-600 rounded-full border border-emerald-100 flex items-center justify-center">{job.badge}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#f4f3ec] text-[#08060d] px-2 py-0.5 rounded-md w-fit">{job.schedule}</span>
                  <div className="h-2 w-full bg-[#f4f4f5] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-400" style={{ width: idx === 1 ? "100%" : "85%" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Logs Preview */}
            <div className="flex-1 border border-[#e4e4e7]/60 bg-white rounded-xl p-4 flex flex-col gap-2 overflow-hidden text-left">
              <div className="text-xs font-medium text-black mb-1 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                Execution Log Telemetry
              </div>
              {[
                { status: "success", name: "Sync Payments", latency: "42ms" },
                { status: "success", name: "Uptime Ping", latency: "12ms" },
                { status: "success", name: "Backup Database", latency: "212ms" }
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#f4f4f5] last:border-0 text-xs font-mono text-[#71717a]">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>GET {log.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{log.latency}</span>
                    <span className="text-emerald-600 font-medium">SUCCESS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works (Numbered Timeline) */}
      <section id="how-it-works" className="border-t border-[#f1f1f4] bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl text-left">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Workflow</span>
            <h2 className="mt-3 text-3xl font-normal tracking-tight text-black sm:text-4xl">
              Clean. Sequential. Zero-friction.
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-[#71717a]">
              A developer-centric scheduling sequence that removes complex configurations and replaces them with an elegant automation pipeline.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Define Interval",
                desc: "Write your cron expression manually or prompt our AI engine in plain English to auto-format standard 5-field cron syntax."
              },
              {
                num: "02",
                title: "Configure Ping",
                desc: "Provide any URL target. On each scheduled iteration, the service triggers an isolated curl subprocess to perform the HTTP trigger."
              },
              {
                num: "03",
                title: "Analyze Logs",
                desc: "Verify outputs, latency graphs, and exit codes natively. If pings fail, inspect absolute standard error outputs on our dashboard."
              }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col gap-4 border-l border-[#f1f1f4] pl-6 text-left">
                <span className="font-mono text-4xl font-light text-neutral-300">{step.num}</span>
                <h3 className="text-lg font-normal text-black mt-2">{step.title}</h3>
                <p className="text-xs md:text-sm font-light leading-relaxed text-[#71717a]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Interactive AI Cron Parser Demonstration */}
      <section id="ai-parser" className="border-t border-[#f1f1f4] bg-[#fafafa] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Description */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-light text-violet-600">
                <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>AI Natural Language Parser</span>
              </div>
              <h2 className="text-3xl font-normal tracking-tight text-black sm:text-4xl">
                Describe in plain text, schedule instantly.
              </h2>
              <p className="text-sm font-light leading-relaxed text-[#71717a]">
                Forget the hassle of standard cron notation charts. Our integrated OpenRouter API maps English instructions into perfect, validated cron intervals in milliseconds.
              </p>
              <ul className="space-y-2 text-xs font-light text-[#71717a]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[1.5]" />
                  Maps custom prompts to standard 5-field cron formats.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[1.5]" />
                  Fully isolated sandboxed API validation pre-save.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[1.5]" />
                  Saves history of AI generations in your developer account.
                </li>
              </ul>
            </div>

            {/* Live Interactive Parser Card */}
            <div className="lg:col-span-6 bg-white border border-[#f1f1f4] rounded-2xl p-6 shadow-xs text-left">
              <h3 className="text-sm font-medium text-black mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Live AI Prompt Sandbox
              </h3>
              <p className="text-xs text-[#71717a] font-light mb-4">
                Try scheduling triggers. Type below and press Generate.
              </p>
              
              <form onSubmit={handleDemoGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder='e.g. "Every Sunday at midnight" or "Every 15 minutes on weekdays"'
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    className="w-full h-10 border border-[#e4e4e7] bg-[#fafafa]/50 focus:bg-white rounded-lg px-3 text-xs font-light text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isGenerating || !demoInput}
                  className="w-full h-10 bg-black hover:bg-black/90 text-white text-xs font-light rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isGenerating ? "AI is parsing..." : "Parse Schedule"}
                </Button>
              </form>

              {demoOutput && (
                <div className="mt-4 p-4 rounded-xl bg-violet-50/50 border border-violet-100/60 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px] text-violet-600 mb-1 font-mono font-medium">
                    <span>PARSED RESULT</span>
                    <span>VALID 5-FIELD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-base font-mono text-violet-700 font-semibold">{demoOutput}</code>
                    <span className="text-[10px] text-violet-500 font-light">Auto-fills configuration form</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Section 4: Developer Diagnostics & Failover Recovery */}
      <section id="telemetry" className="border-t border-[#f1f1f4] bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Mock Log Panel */}
            <div className="lg:col-span-6 bg-neutral-900 border border-neutral-950 rounded-2xl p-5 shadow-lg text-left font-mono text-xs text-neutral-300 min-h-[220px] flex flex-col justify-between order-last lg:order-first">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2 mb-3">
                  <span className="text-[10px] text-neutral-500">System Telemetry & Crash Recovery Log</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed text-neutral-400">
                  <p className="text-neutral-500">&gt; bun run server/index.ts</p>
                  <p className="text-neutral-400">[SYSTEM] Connecting to MongoDB Cluster...</p>
                  <p className="text-neutral-400">[SYSTEM] Server listening on port 3000</p>
                  <p className="text-violet-400">[CRON] Initializing Cron Service...</p>
                  <p className="text-violet-400">[CRON] Found 14 active cron jobs in database.</p>
                  <p className="text-violet-400">[CRON] Rescheduled 14/14 jobs in-memory natively. Recovery OK.</p>
                  <p className="text-neutral-500">[JOB 6f9d] GET https://api.service.com/sync &gt; <span className="text-emerald-500">200 OK</span> (24ms)</p>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-neutral-850 flex justify-between items-center text-[10px] text-neutral-500">
                <span>Bun.spawn subprocess</span>
                <span>Active engine</span>
              </div>
            </div>

            {/* Description */}
            <div className="lg:col-span-6 text-left space-y-6">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Resilience</span>
              <h2 className="text-3xl font-normal tracking-tight text-black sm:text-4xl">
                Crash recovery. Natively integrated.
              </h2>
              <p className="text-sm font-light leading-relaxed text-[#71717a]">
                Built with a robust singleton recovery architecture. If your server restarts, crashes, or is updated, `crontab.sh` immediately fetches and reschedules your active jobs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 border border-[#e4e4e7] mb-3">
                    <RefreshCw className="h-4.5 w-4.5 text-black stroke-[1.5]" />
                  </div>
                  <h4 className="text-xs font-semibold text-black mb-1">State Persistence</h4>
                  <p className="text-xs font-light text-[#71717a] leading-relaxed">
                    Saves state config inside MongoDB and tracks execution logs synchronously for every run.
                  </p>
                </div>
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 border border-[#e4e4e7] mb-3">
                    <Activity className="h-4.5 w-4.5 text-black stroke-[1.5]" />
                  </div>
                  <h4 className="text-xs font-semibold text-black mb-1">Latency Diagnostics</h4>
                  <p className="text-xs font-light text-[#71717a] leading-relaxed">
                    Captures precise milliseconds elapsed between subprocess spawn and stream outputs.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 5: Common Use Cases (Grid) */}
      <section id="use-cases" className="border-t border-[#f1f1f4] bg-[#fafafa] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl text-left">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Scenarios</span>
            <h2 className="mt-3 text-3xl font-normal tracking-tight text-black sm:text-4xl">
              Flexible scheduling for any environment.
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-[#71717a]">
              See how modern teams deploy `crontab.sh` to offload their automated workflows and cron jobs.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              {
                icon: <Activity className="h-5 w-5 text-black stroke-[1.5]" />,
                title: "Uptime Monitoring",
                desc: "Schedule a GET request trigger to execute every 5 minutes to verify web app endpoints remain responsive."
              },
              {
                icon: <Code className="h-5 w-5 text-black stroke-[1.5]" />,
                title: "Third-Party Data Sync",
                desc: "Automatically sync third-party webhooks (e.g. Stripe payouts or Shopify orders) hourly or on custom offsets."
              },
              {
                icon: <Database className="h-5 w-5 text-black stroke-[1.5]" />,
                title: "Automated Backups",
                desc: "Trigger routine exports, DB snapshots, or static assets cleanup tasks silently at low-traffic hours."
              },
              {
                icon: <RefreshCw className="h-5 w-5 text-black stroke-[1.5]" />,
                title: "Warm Up Serverless",
                desc: "Prevent cold starts on serverless hosting options (e.g. Vercel, Supabase edge functions) with routine pings."
              }
            ].map((card, idx) => (
              <div key={idx} className="border border-[#e4e4e7]/60 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fafafa] border border-[#e4e4e7] mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-black mb-2">{card.title}</h3>
                  <p className="text-xs font-light leading-relaxed text-[#71717a]">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: FAQ Accordion (Minimalist) */}
      <section className="border-t border-[#f1f1f4] bg-white py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
              Frequently Answered
            </h2>
            <p className="text-sm font-light text-[#71717a]">
              Simple responses to standard questions about our scheduler engine.
            </p>
          </div>

          <div className="divide-y divide-[#f1f1f4] border-t border-b border-[#f1f1f4] text-left">
            {[
              {
                q: "What cron standard does the scheduling engine support?",
                a: "The service utilizes Bun's native in-process cron engine which fully supports standard 5-field crontab notation (minute, hour, day of month, month, day of week) based on UTC timing."
              },
              {
                q: "How are the scheduled jobs executed?",
                a: "Every job execution is triggered asynchronously via an isolated shell subprocess (`Bun.spawn`). It doesn't block the main Node/Bun thread, guaranteeing sub-second accuracy and max concurrency."
              },
              {
                q: "Is there any automatic retry logic?",
                a: "The engine records the trigger latency and exit code of all executions. If a subprocess returns an exit code other than 0, it's flagged as a Failure in the logs terminal for simple debugging."
              },
              {
                q: "Are scheduled tasks secure?",
                a: "Yes. All actions are completely locked behind multi-tenant isolation schemas. Password hashes utilize secure native Argon2id, and API endpoints are signed with 7-day bearer JWT tokens."
              }
            ].map((faq, i) => (
              <div key={i} className="py-6 flex flex-col sm:flex-row gap-4">
                <h3 className="sm:w-1/3 text-xs font-semibold text-black flex items-start gap-1.5">
                  <HelpCircle className="h-4 w-4 text-[#71717a] shrink-0" />
                  {faq.q}
                </h3>
                <p className="sm:w-2/3 text-xs font-light leading-relaxed text-[#71717a]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#f1f1f4] py-20 bg-[#fafafa]">
        <div className="mx-auto max-w-4xl px-6 text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
            Build your background scheduling platform.
          </h2>
          <p className="mt-4 max-w-lg text-xs md:text-sm font-light text-[#71717a] leading-relaxed">
            Create an isolated user context, configure your schedules with our AI generator, and let `crontab.sh` handle your trigger logic with zero latency.
          </p>
          <div className="mt-8 flex gap-3 items-center">
            {user ? (
              <Link to="/dashboard">
                <Button className="h-10 bg-black hover:bg-black/90 text-white text-xs font-light px-8 rounded-lg shadow-sm">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button className="h-10 bg-black hover:bg-black/90 text-white text-xs font-light px-8 rounded-lg shadow-sm">
                    Start Scheduling Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="h-10 border-[#e4e4e7] bg-white hover:bg-neutral-50 text-black text-xs font-light px-8 rounded-lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-[#f1f1f4] py-16 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-black stroke-[1.5]" />
            <span className="font-sans font-medium text-xs tracking-tight text-black">
              crontab<span className="font-light text-[#71717a]">.sh</span>
            </span>
          </div>
          <p className="text-[10px] font-light text-[#71717a]">
            &copy; 2026 crontab.sh. Made with precision, multi-tenant isolation, and complete restraint.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
