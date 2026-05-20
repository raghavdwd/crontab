import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Clock, Shield, Sparkles, Code, ArrowRight, Server } from "lucide-react";

export const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b]">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e7] bg-white px-3 py-1 text-xs font-light text-[#71717a] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-black stroke-[1.5]" />
            <span>Introducing crontab.sh v1.0</span>
          </div>

          <h1 className="mt-8 max-w-3xl font-sans text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl md:text-6xl text-black">
            Automate API pings with elegant <span className="font-light text-[#71717a]">cron scheduling</span>.
          </h1>

          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-[#71717a] sm:text-lg">
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
            <div className="rounded-md bg-neutral-50 px-8 py-1 text-[11px] font-light text-[#71717a] border border-[#f1f1f4]">
              crontab.sh/dashboard
            </div>
            <div className="w-8" />
          </div>
          <div className="aspect-[16/9] w-full bg-neutral-50/50 rounded-lg p-6 flex flex-col gap-6 overflow-hidden">
            {/* Mock Dashboard Rows */}
            <div className="flex flex-col gap-1.5">
              <span className="h-4 w-28 bg-[#e4e4e7] rounded" />
              <span className="h-3 w-48 bg-[#f4f4f5] rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[#e4e4e7]/60 bg-white rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-16 bg-[#e4e4e7] rounded" />
                    <span className="h-4 w-12 bg-emerald-50 text-[10px] font-medium text-emerald-600 rounded-full border border-emerald-100 flex items-center justify-center">Active</span>
                  </div>
                  <div className="h-3 w-28 bg-[#f4f4f5] rounded" />
                  <div className="h-3.5 w-32 bg-neutral-100 rounded mt-2" />
                </div>
              ))}
            </div>
            {/* Logs Preview */}
            <div className="flex-1 border border-[#e4e4e7]/60 bg-white rounded-xl p-4 flex flex-col gap-2 overflow-hidden">
              <div className="h-3.5 w-20 bg-[#e4e4e7] rounded mb-2" />
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#f4f4f5] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="h-3 w-40 bg-[#f4f4f5] rounded" />
                  </div>
                  <div className="h-3 w-20 bg-[#f4f4f5] rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-[#f1f1f4] bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-normal tracking-tight text-black sm:text-4xl">
              Engineered for extreme simplicity.
            </h2>
            <p className="mt-4 text-base font-light leading-relaxed text-[#71717a]">
              A scheduler that stays out of your way. Set your target, define your expression, and monitor the pings in real time.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 border border-[#e4e4e7]">
                <Code className="h-5 w-5 text-black stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-normal text-black">Standard Cron Expression</h3>
              <p className="text-sm font-light leading-relaxed text-[#71717a]">
                Utilize standard 5-field cron notation (e.g. `*/5 * * * *`) for robust, precise intervals. Fully validated expression parser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 border border-[#e4e4e7]">
                <Server className="h-5 w-5 text-black stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-normal text-black">HTTP Hook Integration</h3>
              <p className="text-sm font-light leading-relaxed text-[#71717a]">
                Enter any webhook URL or public endpoint, and our scheduler will securely execute GET request triggers via curl hooks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 border border-[#e4e4e7]">
                <Shield className="h-5 w-5 text-black stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-normal text-black">Execution Telemetry</h3>
              <p className="text-sm font-light leading-relaxed text-[#71717a]">
                Inspect status output, HTTP headers, timing latency, and failures with comprehensive historical cron run logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-[#f1f1f4] py-16 bg-[#fafafa]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-black stroke-[1.5]" />
            <span className="font-sans font-medium text-sm tracking-tight text-black">
              crontab<span className="font-light text-[#71717a]">.sh</span>
            </span>
          </div>
          <p className="text-xs font-light text-[#71717a]">
            &copy; 2026 crontab.sh. Made with precision and restraint.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
