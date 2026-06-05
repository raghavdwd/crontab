import { useState } from "react";
import { AlertCircle, Loader2, Info, Sparkles, X } from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GeneralTabProps {
  name: string;
  schedule: string;
  url: string;
  error: string | null;
  submitting: boolean;
  onNameChange: (value: string) => void;
  onScheduleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onErrorChange: (value: string | null) => void;
}

const GeneralTab = ({
  name,
  schedule,
  url,
  error,
  submitting,
  onNameChange,
  onScheduleChange,
  onUrlChange,
  onErrorChange,
}: GeneralTabProps) => {
  // AI generation state (local to this component)
  const [aiDescription, setAiDescription] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  const handleCronGeneration = async () => {
    if (!aiDescription.trim()) {
      onErrorChange(
        "Please describe what you want to schedule before generating.",
      );
      return;
    }

    onErrorChange(null);
    setAiGenerating(true);
    setAiSuccess(false);

    try {
      const res = await api.post("/ai/generate-cron", {
        cron_description: aiDescription.trim(),
      });
      const expression: string = res.data?.aiResponse?.cron_expression;
      if (!expression) {
        throw new Error("No cron expression returned from AI.");
      }
      onScheduleChange(expression);
      setAiSuccess(true);
      setAiPanelOpen(false);
      setAiDescription("");
    } catch (err: any) {
      console.error(err);
      onErrorChange(
        err.response?.data?.error ||
          err.message ||
          "AI generation failed. Please try again or enter the expression manually.",
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const toggleAiPanel = () => {
    setAiPanelOpen((prev) => !prev);
    onErrorChange(null);
    setAiSuccess(false);
  };

  return (
    <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden">
      <CardHeader className="p-4 pb-4">
        <CardTitle className="text-base font-medium text-black">
          Job Configuration
        </CardTitle>
        <CardDescription className="text-xs font-light text-[#71717a]">
          Define the name, interval expression, and destination of the trigger.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6 pt-0">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50/50 border border-red-100 p-4 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[1.5] mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Error</span>
              <span className="font-light">{error}</span>
            </div>
          </div>
        )}

        {/* Job Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-normal text-neutral-600"
          >
            Job Name{" "}
            <span className="text-[#71717a] font-light">(Optional)</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Database Ping"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={submitting}
            className="h-10 border-[#e4e4e7] bg-[#fafafa]/50 focus-visible:ring-1 focus-visible:ring-[#18181b] rounded-lg text-sm font-light placeholder:text-neutral-400"
          />
        </div>

        {/* Cron Schedule Expression */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="schedule"
              className="text-xs font-normal text-neutral-600"
            >
              Cron Schedule Expression
            </Label>
            <button
              type="button"
              onClick={toggleAiPanel}
              className={`inline-flex items-center gap-1 text-[10px] font-light rounded-md px-2 py-0.5 border transition-all ${
                aiPanelOpen
                  ? "bg-violet-50 border-violet-200 text-violet-600"
                  : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-violet-200 hover:text-violet-500 hover:bg-violet-50"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Generate with AI
            </button>
          </div>

          {/* AI Panel */}
          {aiPanelOpen && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Cron Generator
                </div>
                <button
                  type="button"
                  onClick={toggleAiPanel}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-violet-600/70 font-light">
                Describe your schedule in plain English and AI will generate the
                cron expression.
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder='e.g. "Every day at 3am" or "Every 15 minutes on weekdays"'
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleCronGeneration())
                  }
                  disabled={aiGenerating}
                  className="h-9 flex-1 border-violet-200 bg-white focus-visible:ring-1 focus-visible:ring-violet-400 rounded-lg text-xs font-light placeholder:text-neutral-400"
                />
                <Button
                  type="button"
                  onClick={handleCronGeneration}
                  disabled={aiGenerating || !aiDescription.trim()}
                  className="h-9 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-light rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Schedule Input */}
          <div className="relative">
            <Input
              id="schedule"
              type="text"
              placeholder="*/5 * * * *"
              value={schedule}
              onChange={(e) => {
                onScheduleChange(e.target.value);
                setAiSuccess(false);
              }}
              disabled={submitting}
              className={`h-10 bg-[#fafafa]/50 font-mono text-xs focus-visible:ring-1 rounded-lg placeholder:text-neutral-400 pr-8 transition-colors ${
                aiSuccess
                  ? "border-violet-300 focus-visible:ring-violet-400"
                  : "border-[#e4e4e7] focus-visible:ring-[#18181b]"
              }`}
            />
            {aiSuccess && (
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-400" />
            )}
          </div>
          <p className="text-[10px] font-light text-[#71717a]">
            Must be a 5-field expression: minute, hour, day of month, month, day
            of week.
          </p>
        </div>

        {/* Target URL */}
        <div className="space-y-1.5">
          <Label htmlFor="url" className="text-xs font-normal text-neutral-600">
            Target Ping URL
          </Label>
          <Input
            id="url"
            type="url"
            placeholder="https://api.example.com/v1/backup"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            disabled={submitting}
            className="h-10 border-[#e4e4e7] bg-[#fafafa]/50 font-mono text-xs focus-visible:ring-1 focus-visible:ring-[#18181b] rounded-lg placeholder:text-neutral-400"
          />
          <p className="text-[10px] font-light text-[#71717a]">
            Our runner will perform a{" "}
            <span className="font-medium text-black">GET</span> ping on this URL
            on the defined schedule.
          </p>
        </div>
      </CardContent>

      {/* Reference Guide */}
      <div className="border-t border-[#f1f1f4] bg-neutral-50/50 p-6 flex gap-4">
        <Info className="h-5 w-5 text-neutral-400 shrink-0 stroke-[1.5]" />
        <div className="flex-1 text-xs">
          <h4 className="font-normal text-black mb-1.5">
            Cron Expression Reference
          </h4>
          <ul className="space-y-1 text-[#71717a] font-light">
            <li>
              <code className="font-mono text-black font-normal bg-neutral-100 px-1 rounded">
                */5 * * * *
              </code>{" "}
              &mdash; Every 5 minutes
            </li>
            <li>
              <code className="font-mono text-black font-normal bg-neutral-100 px-1 rounded">
                0 * * * *
              </code>{" "}
              &mdash; Hourly (at minute 0)
            </li>
            <li>
              <code className="font-mono text-black font-normal bg-neutral-100 px-1 rounded">
                0 0 * * *
              </code>{" "}
              &mdash; Daily (at midnight)
            </li>
            <li>
              <code className="font-mono text-black font-normal bg-neutral-100 px-1 rounded">
                0 0 * * 0
              </code>{" "}
              &mdash; Weekly (Sunday at midnight)
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default GeneralTab;
