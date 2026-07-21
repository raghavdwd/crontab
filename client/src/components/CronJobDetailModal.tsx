import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Pencil,
  Loader2,
  Clock,
  Globe,
  Save,
  History,
  Trash2,
  CircleCheckBig,
  Circle,
  Plus,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

interface Header {
  id: number;
  name: string;
  value: string;
  enabled: boolean;
}

interface CronJob {
  _id: string;
  name?: string;
  schedule: string;
  command: string;
  isActive: boolean;
  method?: string;
  headers?: { name: string; value: string; enabled: boolean }[];
  body?: string;
  timeout?: number;
  expectedStatus?: number;
  saveResponse: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: CronJob | null;
  onJobUpdated?: () => void;
}

const extractUrl = (command: string): string => {
  const last = command.lastIndexOf("'");
  if (last === -1) return command;
  const prev = command.lastIndexOf("'", last - 1);
  if (prev === -1) return command;
  return command.slice(prev + 1, last);
};

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
};

const formatSchedule = (sched: string) => {
  const map: Map<string, string> = new Map([
    ["*/5 * * * *", "Every 5 minutes"],
    ["*/10 * * * *", "Every 10 minutes"],
    ["*/15 * * * *", "Every 15 minutes"],
    ["*/30 * * * *", "Every 30 minutes"],
    ["0 * * * *", "Every hour"],
    ["0 */6 * * *", "Every 6 hours"],
    ["0 0 * * *", "Daily at midnight"],
    ["0 0 * * 0", "Weekly on Sunday"],
    ["0 0 1 * *", "Monthly on 1st"],
  ]);
  return map.get(sched) || "";
};

const inputClass =
  "h-10 border-[#e4e4e7] bg-[#fafafa]/50 focus-visible:ring-1 focus-visible:ring-[#18181b] rounded-lg text-sm font-light placeholder:text-neutral-400";

const labelClass = "text-xs font-normal text-neutral-600";

const CronJobDetailModal = ({
  open,
  onOpenChange,
  job,
  onJobUpdated,
}: Props) => {
  const [mode, setMode] = useState<"read" | "edit">("read");
  const [activeTab, setActiveTab] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<Header[]>([]);
  const [body, setBody] = useState("");
  const [timeout, setTimeout_] = useState("");
  const [expectedStatus, setExpectedStatus] = useState("");
  const [saveResponse, setSaveResponse] = useState(false);

  useEffect(() => {
    if (job) {
      setMode("read");
      setActiveTab("general");
      setError(null);
      setName(job.name || "");
      setSchedule(job.schedule);
      setUrl(extractUrl(job.command));
      setMethod(job.method || "GET");
      setHeaders(
        (job.headers || []).map((h, i) => ({
          id: i + 1,
          name: h.name,
          value: h.value,
          enabled: h.enabled,
        })),
      );
      setBody(job.body || "");
      setTimeout_(job.timeout?.toString() || "");
      setExpectedStatus(job.expectedStatus?.toString() || "");
      setSaveResponse(job.saveResponse);
    }
  }, [job]);

  const handleSave = async () => {
    if (!job) return;
    if (!schedule.trim() || !url.trim()) {
      setError("Schedule and URL are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const savedHeaders = headers.filter((h) => h.name.trim());
      const changeFields: Record<string, unknown> = {
        name: name.trim() || undefined,
        schedule: schedule.trim(),
        url: url.trim(),
        method: method !== "GET" ? method : undefined,
        headers: savedHeaders.length > 0 ? savedHeaders : undefined,
        body: body.trim() || undefined,
        timeout: timeout ? Number(timeout) : undefined,
        expectedStatus: expectedStatus ? Number(expectedStatus) : undefined,
        saveResponse,
      };
      await api.put(`/cron/${job._id}`, changeFields);
      setMode("read");
      onJobUpdated?.();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to update cron job.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    if (job) {
      setName(job.name || "");
      setSchedule(job.schedule);
      setUrl(extractUrl(job.command));
      setMethod(job.method || "GET");
      setHeaders(
        (job.headers || []).map((h, i) => ({
          id: i + 1,
          name: h.name,
          value: h.value,
          enabled: h.enabled,
        })),
      );
      setBody(job.body || "");
      setTimeout_(job.timeout?.toString() || "");
      setExpectedStatus(job.expectedStatus?.toString() || "");
      setSaveResponse(job.saveResponse);
    }
    setError(null);
    setMode("read");
  };

  const close = () => {
    cancelEdit();
    onOpenChange(false);
  };

  const toggleEnable = (id: number) => {
    setHeaders(
      headers.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h)),
    );
  };

  const addHeader = () => {
    const nextId = headers.reduce((max, h) => Math.max(max, h.id), 0) + 1;
    setHeaders([
      ...headers,
      { id: nextId, name: "", value: "", enabled: true },
    ]);
  };

  const updateHeader = (id: number, field: "name" | "value", value: string) => {
    setHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
  };

  const removeHeader = (id: number) => {
    setHeaders(headers.filter((h) => h.id !== id));
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={() => close()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#f1f1f4]">
          <div className="flex items-center gap-2.5 pr-16">
            <div className="h-7 w-7 rounded-lg bg-neutral-100 border border-[#f1f1f4] flex items-center justify-center shrink-0">
              <Globe className="h-3.5 w-3.5 text-neutral-600 stroke-[1.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-medium text-black">
                {job.name || "Untitled Schedule"}
              </DialogTitle>
              <DialogDescription className="text-md font-light text-gray-800 mt-0.5 truncate">
                {job.schedule}
                {formatSchedule(job.schedule) &&
                  ` — ${formatSchedule(job.schedule)}`}
              </DialogDescription>
            </div>
          </div>
          <div className="absolute right-14 top-6 flex items-center gap-1">
            {mode === "read" ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMode("edit")}
                title="Edit job"
                className="text-neutral-400 hover:text-black"
              >
                <Pencil className="h-4 w-4 stroke-[1.5]" />
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5">
                <Pencil className="h-3 w-3 stroke-[1.5]" />
                Editing
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-4 min-h-0">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50/50 border border-red-100 p-3 text-xs text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0 stroke-[1.5] mt-0.5" />
              <span className="font-light">{error}</span>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-neutral-100 p-1 rounded-xl h-9 border border-[#f1f1f4] inline-flex mb-6">
              <TabsTrigger
                value="general"
                className="rounded-lg text-xs font-light tracking-wide text-[#71717a] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-xs px-5 h-7"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="rounded-lg text-xs font-light tracking-wide text-[#71717a] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-xs px-5 h-7"
              >
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent
              value="general"
              className="space-y-5 focus-visible:outline-none"
            >
              {mode === "read" ? (
                <>
                  <div>
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Name
                    </Label>
                    <p className="mt-1 text-sm font-normal text-black">
                      {job.name || (
                        <span className="italic text-neutral-400">
                          Untitled Schedule
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Status
                    </Label>
                    <p className="mt-1">
                      {job.isActive ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-light text-[10px] rounded-full px-2.5 py-0.5 flex items-center gap-1 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-neutral-100 text-neutral-500 border-neutral-200 font-light text-[10px] rounded-full px-2.5 py-0.5 flex items-center gap-1 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                          Inactive
                        </Badge>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Schedule
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-black bg-neutral-50 border border-neutral-100 rounded-md py-0.5 px-2">
                        <Clock className="h-3 w-3 text-neutral-400 stroke-[1.5]" />
                        {job.schedule}
                      </span>
                      {formatSchedule(job.schedule) && (
                        <span className="text-xs font-light text-neutral-500">
                          ({formatSchedule(job.schedule)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Target URL
                    </Label>
                    <p className="mt-1 font-mono text-xs text-black break-all">
                      {extractUrl(job.command)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Next 5 Executions
                    </Label>
                    <div className="mt-1 space-y-0.5">
                      {getNextRunTimes(job.schedule).length > 0 ? (
                        getNextRunTimes(job.schedule).map((d, i) => (
                          <p key={i} className="text-xs font-mono text-neutral-600">
                            {d.toLocaleString()}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs font-light italic text-neutral-400">
                          Invalid cron expression
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleRunNow}
                      disabled={runningNow}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-light tracking-wide rounded-lg flex items-center gap-2 shadow-sm text-xs h-9"
                    >
                      {runningNow ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 stroke-[1.5]" />
                          Run Now
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <History className="h-4 w-4 text-neutral-400 stroke-[1.5]" />
                    <div>
                      <p className="text-xs font-normal text-black">
                        Save responses
                      </p>
                      <p className="text-[10px] font-light text-neutral-500">
                        {job.saveResponse
                          ? "Response body captured on each run"
                          : "Not saving responses"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#f1f1f4]">
                    <div>
                      <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                        Created
                      </Label>
                      <p className="mt-0.5 text-[11px] font-light text-neutral-600">
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                        Updated
                      </Label>
                      <p className="mt-0.5 text-[11px] font-light text-neutral-600">
                        {formatDate(job.updatedAt)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name" className={labelClass}>
                      Job Name{" "}
                      <span className="text-[#71717a] font-light">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="edit-name"
                      type="text"
                      placeholder="e.g. Database Ping"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-schedule" className={labelClass}>
                      Cron Schedule Expression
                    </Label>
                    <Input
                      id="edit-schedule"
                      type="text"
                      placeholder="*/5 * * * *"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      disabled={submitting}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-url" className={labelClass}>
                      Target Ping URL
                    </Label>
                    <Input
                      id="edit-url"
                      type="url"
                      placeholder="https://api.example.com/v1/backup"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={submitting}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </div>

                  <div className="rounded-xl border border-[#f1f1f4] bg-neutral-50/50 p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-white border border-[#f1f1f4] flex items-center justify-center">
                        <History className="h-3.5 w-3.5 text-neutral-500 stroke-[1.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="edit-save-response"
                          className="text-xs font-normal text-black cursor-pointer"
                        >
                          Save responses in job history
                        </Label>
                        <p className="text-[10px] font-light text-[#71717a] leading-relaxed">
                          Persist the full response body (up to 64 KB) for every
                          run.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="edit-save-response"
                      checked={saveResponse}
                      onCheckedChange={setSaveResponse}
                      disabled={submitting}
                      className="data-checked:bg-black data-unchecked:bg-neutral-300 mt-1"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent
              value="advanced"
              className="space-y-5 focus-visible:outline-none"
            >
              {mode === "read" ? (
                <>
                  <div>
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      HTTP Method
                    </Label>
                    <p className="mt-1">
                      <span className="inline-flex items-center text-[11px] font-mono font-medium text-black bg-neutral-50 border border-neutral-100 rounded-md px-2 py-0.5">
                        {job.method || "GET"}
                      </span>
                    </p>
                  </div>

                  {job.headers && job.headers.length > 0 ? (
                    <div>
                      <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                        Headers
                      </Label>
                      <div className="mt-1 space-y-1">
                        {job.headers.map((h, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 text-xs font-mono bg-neutral-50 border border-neutral-100 rounded-md px-2 py-1 ${
                              h.enabled ? "" : "opacity-40"
                            }`}
                          >
                            <span className="text-neutral-800">{h.name}</span>
                            <span className="text-neutral-400">:</span>
                            <span className="text-neutral-600">{h.value}</span>
                            {!h.enabled && (
                              <span className="text-[9px] text-neutral-400 ml-auto">
                                disabled
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                        Headers
                      </Label>
                      <p className="mt-1 text-xs font-light italic text-neutral-400">
                        No custom headers
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Request Body
                    </Label>
                    {job.body ? (
                      <pre className="mt-1 text-[11px] font-mono leading-relaxed text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-md p-3 whitespace-pre-wrap max-h-40 overflow-auto">
                        {job.body}
                      </pre>
                    ) : (
                      <p className="mt-1 text-xs font-light italic text-neutral-400">
                        No request body
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                        Timeout
                      </Label>
                      <p className="mt-0.5 text-xs font-mono text-black">
                        {job.timeout ? (
                          `${job.timeout}ms`
                        ) : (
                          <span className="italic text-neutral-400 font-light">
                            Default
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                        Expected Status
                      </Label>
                      <p className="mt-0.5 text-xs font-mono text-black">
                        {job.expectedStatus ?? (
                          <span className="italic text-neutral-400 font-light">
                            Default (200)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Save Response
                    </Label>
                    {job.saveResponse ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-light text-[10px] rounded-full px-2 py-0">
                        On
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-100 text-neutral-500 border-neutral-200 font-light text-[10px] rounded-full px-2 py-0">
                        Off
                      </Badge>
                    )}
                  </div>

                  <div className="border-t border-[#f1f1f4] pt-4 mt-4">
                    <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
                      Failure Alerts
                    </Label>
                    {job.alertConfig?.enabled ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className="bg-violet-50 text-violet-700 border-violet-100 font-light text-[10px] rounded-full px-2 py-0">
                          {job.alertConfig.type === "email" ? "📧 Email" : "🔗 Webhook"}
                        </Badge>
                        <span className="text-xs font-mono text-neutral-600">
                          {job.alertConfig.target}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs font-light italic text-neutral-400">No alerts configured</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-method" className={labelClass}>
                      HTTP Method
                    </Label>
                    <Select
                      value={method}
                      onValueChange={setMethod}
                      disabled={submitting}
                    >
                      <SelectTrigger
                        id="edit-method"
                        className={`${inputClass} w-full justify-between font-light`}
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClass}>Custom Headers</Label>
                    <div className="space-y-2">
                      {headers.map((header) => (
                        <div
                          key={header.id}
                          className={`flex items-center gap-2 ${
                            header.enabled ? "" : "opacity-50"
                          }`}
                        >
                          <Input
                            type="text"
                            placeholder="Header Name"
                            value={header.name}
                            onChange={(e) =>
                              updateHeader(header.id, "name", e.target.value)
                            }
                            disabled={submitting || !header.enabled}
                            className={inputClass}
                          />
                          <Input
                            type="text"
                            placeholder="Header Value"
                            value={header.value}
                            onChange={(e) =>
                              updateHeader(header.id, "value", e.target.value)
                            }
                            disabled={submitting || !header.enabled}
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() => toggleEnable(header.id)}
                            disabled={submitting}
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                              header.enabled
                                ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                : "bg-neutral-100 text-neutral-400 border-transparent hover:bg-neutral-200"
                            }`}
                          >
                            {header.enabled ? (
                              <CircleCheckBig className="size-4" />
                            ) : (
                              <Circle className="size-4" />
                            )}
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeHeader(header.id)}
                            disabled={submitting}
                            className="text-neutral-400 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={addHeader}
                      disabled={submitting}
                      className="mt-2 h-8 gap-1 bg-black hover:bg-black/90 text-white font-light tracking-wide rounded-lg text-xs shadow-sm"
                    >
                      <Plus className="size-3.5 stroke-[1.5]" />
                      Add Header
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-body" className={labelClass}>
                      Request Body
                    </Label>
                    <Textarea
                      id="edit-body"
                      placeholder="Type your request body here."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      disabled={submitting}
                      rows={6}
                      className={`${inputClass} h-auto py-2.5 font-light`}
                    />
                    <p className="text-[10px] font-light text-[#71717a]">
                      Only used for POST, PUT, DELETE. JSON or raw text.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-timeout" className={labelClass}>
                        Request Timeout
                      </Label>
                      <Input
                        id="edit-timeout"
                        type="number"
                        placeholder="e.g. 5000 (ms)"
                        value={timeout}
                        onChange={(e) => setTimeout_(e.target.value)}
                        disabled={submitting}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="edit-expected-status"
                        className={labelClass}
                      >
                        Expected Status Code
                      </Label>
                      <Input
                        id="edit-expected-status"
                        type="number"
                        placeholder="e.g. 200"
                        value={expectedStatus}
                        onChange={(e) => setExpectedStatus(e.target.value)}
                        disabled={submitting}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#f1f1f4] pt-6">
                    <Label className="text-xs font-normal text-neutral-600 mb-3 block">Failure Alerts</Label>

                    <div className="rounded-xl border border-[#f1f1f4] bg-neutral-50/50 p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-white border border-[#f1f1f4] flex items-center justify-center">
                          <Bell className="h-3.5 w-3.5 text-neutral-500 stroke-[1.5]" />
                        </div>
                        <div className="space-y-0.5">
                          <Label htmlFor="detail-alert-enabled" className="text-xs font-normal text-black cursor-pointer">
                            Enable failure alerts
                          </Label>
                          <p className="text-[10px] font-light text-[#71717a] leading-relaxed">
                            Notify when job fails.
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="detail-alert-enabled"
                        checked={alertConfig.enabled}
                        onCheckedChange={(v) => setAlertConfig({ ...alertConfig, enabled: v })}
                        disabled={submitting}
                        className="data-checked:bg-black data-unchecked:bg-neutral-300 mt-1"
                      />
                    </div>

                    {alertConfig.enabled && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                          <Label className={labelClass}>Alert Type</Label>
                          <Select
                            value={alertConfig.type}
                            onValueChange={(v: "email" | "webhook") => setAlertConfig({ ...alertConfig, type: v })}
                            disabled={submitting}
                          >
                            <SelectTrigger className={`${inputClass} w-full justify-between font-light`}>
                              <SelectValue placeholder="Select alert type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="webhook">Webhook</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="detail-alert-target" className={labelClass}>
                            {alertConfig.type === "email" ? "Email Address" : "Webhook URL"}
                          </Label>
                          <Input
                            id="detail-alert-target"
                            type={alertConfig.type === "email" ? "email" : "url"}
                            placeholder={alertConfig.type === "email" ? "you@example.com" : "https://hooks.example.com/alert"}
                            value={alertConfig.target}
                            onChange={(e) => setAlertConfig({ ...alertConfig, target: e.target.value })}
                            disabled={submitting}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer (edit mode only) */}
        {mode === "edit" && (
          <div className="px-6 py-4 border-t border-[#f1f1f4] flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={cancelEdit}
              disabled={submitting}
              className="border-[#e4e4e7] text-neutral-600 hover:bg-neutral-50 font-light rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="bg-black hover:bg-black/90 text-white font-light tracking-wide rounded-lg flex items-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 stroke-[1.5]" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CronJobDetailModal;
