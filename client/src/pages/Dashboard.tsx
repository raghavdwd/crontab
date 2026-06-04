import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Clock,
  Trash2,
  Plus,
  RotateCw,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/Modal";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface CronJob {
  _id: string;
  name?: string;
  schedule: string;
  command: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CronLog {
  _id: string;
  jobId: string;
  jobName: string;
  command: string;
  triggerTime: string;
  endTime?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  status: "running" | "success" | "failure";
}

export const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logsPerPage = 10;

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/cron");
      // Server response wrapper could be { jobs: [...] } or direct array
      const fetchedJobs = response.data?.jobs || response.data || [];
      setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
    } catch (err: any) {
      console.error(err);
      setError(
        "Failed to fetch cron jobs. Please make sure the backend is active.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page = 1) => {
    setLogsLoading(true);
    try {
      const response = await api.get(
        `/cron/logs?page=${page}&limit=${logsPerPage}`,
      );
      const fetchedLogs = response.data?.logs || [];
      setLogs(Array.isArray(fetchedLogs) ? fetchedLogs : []);
      setTotalPages(response.data?.pagination?.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchLogs(1);
  }, []);

  const handleToggleStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      await api.put(`/cron/${jobId}`, { isActive: !currentStatus });
      // Update local state smoothly
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, isActive: !currentStatus } : job,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this cron job?")) {
      return;
    }
    try {
      await api.delete(`/cron/${jobId}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  const extractUrlFromCommand = (command: string) => {
    // Backend creates: curl -X GET <url>
    if (command.startsWith("curl -X GET ")) {
      return command.replace("curl -X GET ", "");
    }
    return command;
  };

  const activeCount = jobs.filter((j) => j.isActive).length;
  const completedLogs = logs.filter(
    (l) => l.status === "success" || l.status === "failure",
  );
  const successLogsCount = logs.filter((l) => l.status === "success").length;
  const successRate =
    completedLogs.length > 0
      ? Math.round((successLogsCount / completedLogs.length) * 100)
      : 100;

  /**
   * We will open a modal when user will click on the endpoint icon in the jobs table, which will show the full curl command and endpoint URL in a more readable format, along with a copy button for easy copying of the command.
   * This is to improve the UX as some URLs might be long and get truncated in the table view. The modal will provide a clear and focused view of the command details.
   * Also we will display an Area Chart in the modal to show the historical latency of the selected cron job based on the logs data, giving users insights into the performance of their scheduled tasks over time.
   */

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] py-12 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-2xl font-normal text-black tracking-tight">
              Overview
            </h1>
            <p className="text-sm font-light text-[#71717a] mt-1">
              Monitor, schedule and analyze your active pings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                fetchDashboardData();
                fetchLogs();
              }}
              className="border-[#e4e4e7] bg-white text-black hover:bg-neutral-50 h-10 w-10 rounded-lg"
            >
              <RotateCw className="h-4 w-4 stroke-[1.5]" />
            </Button>
            <Link to="/create-job">
              <Button className="bg-black hover:bg-black/90 text-white font-light tracking-wide h-10 rounded-lg px-4 flex items-center gap-2 shadow-sm">
                <Plus className="h-4 w-4 stroke-[1.5]" />
                New Cron Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardDescription className="text-xs font-light text-[#71717a] uppercase tracking-wider">
                Total Scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex items-baseline justify-between">
              <span className="text-3xl font-light text-black">
                {jobs.length}
              </span>
              <span className="text-xs font-light text-[#71717a]">
                Jobs configured
              </span>
            </CardContent>
          </Card>

          <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardDescription className="text-xs font-light text-[#71717a] uppercase tracking-wider">
                Active Scheduler
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex items-baseline justify-between">
              <span className="text-3xl font-light text-emerald-600">
                {activeCount}
              </span>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 border-emerald-100 font-light text-[10px] rounded-full px-2 py-0.5">
                Live
              </Badge>
            </CardContent>
          </Card>

          <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardDescription className="text-xs font-light text-[#71717a] uppercase tracking-wider">
                Recent Success Rate
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex items-baseline justify-between">
              <span className="text-3xl font-light text-black">
                {successRate}%
              </span>
              <span className="text-xs font-light text-[#71717a]">
                Based on latest logs
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-8 flex items-start gap-2.5 rounded-xl bg-red-50/50 border border-red-100 p-4 text-sm text-red-600 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 shrink-0 stroke-[1.5] mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">Connection Error</span>
              <span className="font-light text-red-50/90 text-xs">{error}</span>
            </div>
          </div>
        )}
        {/* Modal */}
        {isModalOpen && <Modal />}

        {/* Tab section */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="bg-neutral-100 p-1 rounded-xl h-10 border border-[#f1f1f4] inline-flex">
            <TabsTrigger
              value="jobs"
              className="rounded-lg text-xs font-light tracking-wide text-[#71717a] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-xs px-5 h-8"
            >
              Active Schedules ({jobs.length})
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              onClick={() => fetchLogs()}
              className="rounded-lg text-xs font-light tracking-wide text-[#71717a] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-xs px-5 h-8"
            >
              Telemetry Logs
            </TabsTrigger>
          </TabsList>

          {/* Jobs List Tab */}
          <TabsContent value="jobs" className="focus-visible:outline-none">
            {loading ? (
              <div className="flex h-60 items-center justify-center bg-white border border-[#f1f1f4] rounded-xl shadow-xs">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <p className="text-xs font-light text-[#71717a]">
                    Fetching schedules...
                  </p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 bg-white border border-[#f1f1f4] rounded-xl text-center p-8 shadow-xs">
                <Clock className="h-8 w-8 text-neutral-300 stroke-[1.2] mb-4" />
                <h3 className="text-base font-normal text-black">
                  No scheduled jobs
                </h3>
                <p className="text-xs font-light text-[#71717a] mt-1 max-w-sm">
                  You haven't configured any cron triggers yet. Start automating
                  your endpoint checks in seconds.
                </p>
                <Link to="/create-job" className="mt-6">
                  <Button className="bg-black hover:bg-black/90 text-white font-light tracking-wide px-6 py-2 h-9 rounded-lg flex items-center gap-2">
                    <Plus className="h-4 w-4 stroke-[1.5]" />
                    Create First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-[#f1f1f4] rounded-xl shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow className="border-b border-[#f1f1f4] hover:bg-transparent">
                      <TableHead className="font-normal text-neutral-500 text-xs w-[200px] h-11 px-6">
                        Name
                      </TableHead>
                      <TableHead className="font-normal text-neutral-500 text-xs w-[140px] h-11 px-6">
                        Schedule
                      </TableHead>
                      <TableHead className="font-normal text-neutral-500 text-xs h-11 px-6">
                        Target Hook Endpoint
                      </TableHead>
                      <TableHead className="font-normal text-neutral-500 text-xs w-30 h-11 px-6">
                        Detail View
                      </TableHead>
                      <TableHead className="font-normal text-neutral-500 text-xs w-[120px] h-11 px-6">
                        Status
                      </TableHead>
                      <TableHead className="font-normal text-neutral-500 text-xs w-[120px] h-11 px-6 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => {
                      const endpointUrl = extractUrlFromCommand(job.command);
                      return (
                        <TableRow
                          key={job._id}
                          className="border-b border-[#f1f1f4] hover:bg-neutral-50/30 transition-colors"
                        >
                          <TableCell className="px-6 py-4 font-medium text-black text-sm">
                            {job.name || "Untitled Schedule"}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-mono bg-neutral-50 border border-neutral-100 rounded-md py-0.5 px-2 w-fit">
                              <Clock className="h-3 w-3 text-neutral-400 stroke-[1.5]" />
                              {job.schedule}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-mono text-xs text-[#71717a] max-w-[300px] truncate">
                            <span className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-neutral-400">
                                GET
                              </span>
                              <span className="truncate">{endpointUrl}</span>
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span onClick={handleModalOpen}>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline">
                                    <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <button
                              onClick={() =>
                                handleToggleStatus(job._id, job.isActive)
                              }
                              className="focus:outline-none flex items-center gap-2 hover:opacity-85 transition-opacity"
                            >
                              {job.isActive ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50 font-light text-[10px] rounded-full px-2.5 py-0.5 flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200/50 font-light text-[10px] rounded-full px-2.5 py-0.5 flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                  Inactive
                                </Badge>
                              )}
                            </button>
                          </TableCell>

                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleToggleStatus(job._id, job.isActive)
                                }
                                title={job.isActive ? "Pause Job" : "Start Job"}
                                className="p-1.5 text-neutral-400 hover:text-black transition-colors focus:outline-none"
                              >
                                {job.isActive ? (
                                  <ToggleRight className="h-5 w-5 stroke-[1.5] text-neutral-600" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5 stroke-[1.5] text-neutral-400" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job._id)}
                                title="Delete Job"
                                className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors focus:outline-none"
                              >
                                <Trash2 className="h-4 w-4 stroke-[1.5]" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="focus-visible:outline-none">
            {logsLoading ? (
              <div className="flex h-60 items-center justify-center bg-white border border-[#f1f1f4] rounded-xl shadow-xs">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <p className="text-xs font-light text-[#71717a]">
                    Streaming runtime logs...
                  </p>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 bg-white border border-[#f1f1f4] rounded-xl text-center p-8 shadow-xs">
                <Activity className="h-8 w-8 text-neutral-300 stroke-[1.2] mb-4" />
                <h3 className="text-base font-normal text-black">
                  No run history
                </h3>
                <p className="text-xs font-light text-[#71717a] mt-1 max-w-sm">
                  Run history logs will appear here once your active cron
                  schedules execute pings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-[#f1f1f4] rounded-xl shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader className="bg-neutral-50/50">
                      <TableRow className="border-b border-[#f1f1f4] hover:bg-transparent">
                        <TableHead className="font-normal text-neutral-500 text-xs w-[120px] h-11 px-6">
                          Timestamp
                        </TableHead>
                        <TableHead className="font-normal text-neutral-500 text-xs w-[120px] h-11 px-6">
                          Name
                        </TableHead>
                        <TableHead className="font-normal text-neutral-500 text-xs w-[100px] h-11 px-6">
                          Status
                        </TableHead>
                        <TableHead className="font-normal text-neutral-500 text-xs w-[100px] h-11 px-6">
                          Latency
                        </TableHead>
                        <TableHead className="font-normal text-neutral-500 text-xs h-11 px-6">
                          Execution Shell Output
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log: CronLog) => {
                        const latencyMs =
                          log.triggerTime && log.endTime
                            ? new Date(log.endTime).getTime() -
                              new Date(log.triggerTime).getTime()
                            : null;
                        const shellOutput = log.stdout || log.stderr || null;
                        return (
                          <TableRow
                            key={log._id}
                            className="border-b border-[#f1f1f4] hover:bg-neutral-50/30 transition-colors"
                          >
                            <TableCell className="px-6 py-3 text-xs text-neutral-500">
                              {log.triggerTime
                                ? new Date(log.triggerTime).toLocaleString()
                                : "—"}
                            </TableCell>
                            <TableCell className="px-6 py-3 text-xs text-neutral-500">
                              {log.jobName || "—"}
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              {log.status === "success" ? (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                  <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.5]" />{" "}
                                  Success
                                </span>
                              ) : log.status === "running" ? (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500">
                                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />{" "}
                                  Running
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                                  <XCircle className="h-3.5 w-3.5 stroke-[1.5]" />{" "}
                                  Failed
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-3 text-xs text-neutral-600 font-mono">
                              {latencyMs !== null ? `${latencyMs}ms` : "—"}
                            </TableCell>
                            <TableCell className="px-6 py-3 font-mono text-[11px] text-neutral-600 max-w-[400px] truncate">
                              {shellOutput || (
                                <span className="italic text-neutral-300">
                                  No output returned
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-light text-[#71717a]">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(currentPage - 1)}
                      disabled={currentPage === 1 || logsLoading}
                      className="h-8 w-8 p-0 border-[#f1f1f4]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(currentPage + 1)}
                      disabled={currentPage === totalPages || logsLoading}
                      className="h-8 w-8 p-0 border-[#f1f1f4]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
