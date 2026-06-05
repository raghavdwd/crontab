import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollText, AlertTriangle } from "lucide-react";

interface ResponseBodyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobName?: string;
  triggerTime?: string;
  statusCode?: string;
  body?: string;
  truncated?: boolean;
}

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

const ResponseBodyModal = ({
  open,
  onOpenChange,
  jobName,
  triggerTime,
  statusCode,
  body,
  truncated,
}: ResponseBodyModalProps) => {
  const formatted = useMemo(() => {
    if (!body) return "";
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }, [body]);

  const isJson = useMemo(() => {
    if (!body) return false;
    try {
      JSON.parse(body);
      return true;
    } catch {
      return false;
    }
  }, [body]);

  const size = body ? new Blob([body]).size : 0;
  const lines = formatted ? formatted.split("\n").length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#f1f1f4]">
          <div className="flex items-center gap-2.5 pr-8">
            <div className="h-7 w-7 rounded-lg bg-neutral-100 border border-[#f1f1f4] flex items-center justify-center shrink-0">
              <ScrollText className="h-3.5 w-3.5 text-neutral-600 stroke-[1.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-medium text-black">
                Response Body
              </DialogTitle>
              <DialogDescription className="text-xs font-light text-[#71717a] mt-0.5 truncate">
                {jobName ? `${jobName}` : "Cron run"}
                {triggerTime ? ` · ${new Date(triggerTime).toLocaleString()}` : ""}
                {statusCode ? ` · HTTP ${statusCode}` : ""}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] font-light text-[#71717a]">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 border border-neutral-200 px-2 py-0.5 font-mono">
              {formatBytes(size)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 border border-neutral-200 px-2 py-0.5 font-mono">
              {lines} {lines === 1 ? "line" : "lines"}
            </span>
            {isJson && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-50 border border-violet-100 text-violet-600 px-2 py-0.5">
                JSON
              </span>
            )}
            {truncated && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5">
                <AlertTriangle className="h-3 w-3 stroke-[1.5]" />
                Truncated to 64 KB
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-neutral-50/50 px-6 py-4 min-h-0">
          {body ? (
            <pre className="text-[11.5px] font-mono leading-relaxed text-neutral-800 whitespace-pre-wrap break-words">
              {formatted}
            </pre>
          ) : (
            <p className="text-xs font-light text-[#71717a] italic text-center py-12">
              No response body was captured for this run.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseBodyModal;
