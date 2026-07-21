import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GeneralTab from "@/components/general-tab";
import AdvancedTab from "@/components/advanced-tab";
import api from "@/lib/api";

interface Header {
  id: number;
  name: string;
  value: string;
  enabled: boolean;
}

export const CreateJob: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([
    { id: 1, name: "Content-Type", value: "application/json", enabled: true },
    { id: 2, name: "Accept", value: "application/json", enabled: true },
    { id: 3, name: "User-Agent", value: "crontab-client/1.0", enabled: true },
  ]);
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [timeout, setTimeout_] = useState("");
  const [expectedStatus, setExpectedStatus] = useState("");
  const [saveResponse, setSaveResponse] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{ type: "email" | "webhook"; target: string; enabled: boolean }>({
    type: "email",
    target: "",
    enabled: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule.trim() || !url.trim()) {
      setError("Schedule (Cron expression) and URL are required.");
      return;
    }

    const cronFields = schedule.trim().split(/\s+/);
    if (cronFields.length !== 5) {
      setError(
        "A standard cron expression must contain exactly 5 space-separated fields.",
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
    const savedHeaders = headers.filter((h) => h.name.trim());
    await api.post("/cron", {
      name: name.trim() || undefined,
      schedule: schedule.trim(),
      url: url.trim(),
      headers: savedHeaders.length > 0 ? savedHeaders : undefined,
      method: method !== "GET" ? method : undefined,
      body: body.trim() || undefined,
      timeout: timeout ? Number(timeout) : undefined,
      expectedStatus: expectedStatus ? Number(expectedStatus) : undefined,
      saveResponse,
      alertConfig: alertConfig.enabled ? alertConfig : undefined,
    });
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to create cron job. Make sure the cron expression is valid.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] py-12 px-6">
      <div className="mx-auto max-w-2xl">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-light text-[#71717a] hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
          Back to Dashboard
        </Link>

        {/* Title Block */}
        <div className="mb-10">
          <h1 className="text-2xl font-normal text-black tracking-tight">
            Create Cron Job
          </h1>
          <p className="text-sm font-light text-[#71717a] mt-1">
            Configure a new scheduled GET ping to your HTTP endpoint.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-2">
            <Tabs defaultValue="general" className="w-full">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <GeneralTab
                  name={name}
                  schedule={schedule}
                  url={url}
                  error={error}
                  submitting={submitting}
                  saveResponse={saveResponse}
                  onNameChange={setName}
                  onScheduleChange={setSchedule}
                  onUrlChange={setUrl}
                  onErrorChange={setError}
                  onSaveResponseChange={setSaveResponse}
                />
              </TabsContent>
              <TabsContent value="advanced">
                <AdvancedTab
                  headers={headers}
                  method={method}
                  body={body}
                  timeout={timeout}
                  expectedStatus={expectedStatus}
                  alertConfig={alertConfig}
                  submitting={submitting}
                  onHeadersChange={setHeaders}
                  onMethodChange={setMethod}
                  onBodyChange={setBody}
                  onTimeoutChange={setTimeout_}
                  onExpectedStatusChange={setExpectedStatus}
                  onAlertConfigChange={setAlertConfig}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-4 border border-[#f1f1f4] bg-white shadow-xs rounded-xl p-4 flex items-center justify-end gap-3">
            <Link to="/dashboard">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                className="border-[#e4e4e7] text-neutral-600 hover:bg-neutral-50 font-light rounded-lg"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-black hover:bg-black/90 text-white font-light tracking-wide rounded-lg flex items-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 stroke-[1.5]" />
                  Schedule Job
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
