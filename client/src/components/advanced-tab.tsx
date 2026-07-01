import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CircleCheckBig, Circle, Plus, Trash2 } from "lucide-react";

interface Header {
  id: number;
  name: string;
  value: string;
  enabled: boolean;
}

interface AdvancedTabProps {
  headers: Header[];
  method: string;
  body: string;
  timeout: string;
  expectedStatus: string;
  submitting?: boolean;
  onHeadersChange: (headers: Header[]) => void;
  onMethodChange: (method: string) => void;
  onBodyChange: (body: string) => void;
  onTimeoutChange: (timeout: string) => void;
  onExpectedStatusChange: (status: string) => void;
}

const inputClass =
  "h-10 border-[#e4e4e7] bg-[#fafafa]/50 focus-visible:ring-1 focus-visible:ring-[#18181b] rounded-lg text-sm font-light placeholder:text-neutral-400";

const labelClass = "text-xs font-normal text-neutral-600";

const helperClass = "text-[10px] font-light text-[#71717a]";

const AdvancedTab = ({
  headers,
  method,
  body,
  timeout,
  expectedStatus,
  submitting = false,
  onHeadersChange,
  onMethodChange,
  onBodyChange,
  onTimeoutChange,
  onExpectedStatusChange,
}: AdvancedTabProps) => {
  const toggleEnable = (id: number) => {
    onHeadersChange(
      headers.map((header) =>
        header.id === id ? { ...header, enabled: !header.enabled } : header,
      ),
    );
  };

  const duplicateHeaderField = () => {
    const nextId = headers.reduce((max, h) => Math.max(max, h.id), 0) + 1;
    onHeadersChange([
      ...headers,
      { id: nextId, name: "", value: "", enabled: true },
    ]);
  };

  const updateHeader = (id: number, field: "name" | "value", value: string) => {
    onHeadersChange(
      headers.map((header) =>
        header.id === id ? { ...header, [field]: value } : header,
      ),
    );
  };

  return (
    <Card className="border border-[#f1f1f4] bg-white shadow-xs rounded-xl overflow-hidden">
      <CardHeader className="p-4 pb-4">
        <CardTitle className="text-base font-medium text-black">
          Advanced Configuration
        </CardTitle>
        <CardDescription className="text-xs font-light text-[#71717a]">
          Define the headers, body, and other advanced options for your cron
          job's HTTP request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0">
        <div className="space-y-1.5">
          <Label className={labelClass}>Custom Headers</Label>
          <div className="space-y-2">
            {headers.map((header) => (
              <div
                key={header.id}
                className={`flex items-center gap-2 ${header.enabled ? "" : "opacity-50"}`}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleEnable(header.id)}
                      disabled={submitting}
                      aria-label={
                        header.enabled ? "Disable header" : "Enable header"
                      }
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                        header.enabled
                          ? "bg-success-bg text-success border-success-border/60 hover:bg-success-bg/70"
                          : "bg-muted text-muted-foreground border-transparent hover:bg-muted/70"
                      }`}
                    >
                      {header.enabled ? (
                        <CircleCheckBig className="size-4" />
                      ) : (
                        <Circle className="size-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{header.enabled ? "Disable" : "Enable"} Header</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() =>
                        onHeadersChange(
                          headers.filter((h) => h.id !== header.id),
                        )
                      }
                      disabled={submitting}
                      aria-label="Remove header"
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove Header</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={duplicateHeaderField}
            disabled={submitting}
            className="mt-2 h-9 gap-1.5 bg-black hover:bg-black/90 text-white font-light tracking-wide rounded-lg shadow-sm"
          >
            <Plus className="size-4 stroke-[1.5]" />
            Add Header
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="select-method" className={labelClass}>
            HTTP Method
          </Label>
          <Select
            value={method}
            onValueChange={onMethodChange}
            disabled={submitting}
          >
            <SelectTrigger
              id="select-method"
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
          <p className={helperClass}>HTTP method for the request.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="textarea-message" className={labelClass}>
            Request Body
          </Label>
          <Textarea
            id="textarea-message"
            placeholder="Type your request body here."
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            disabled={submitting}
            rows={10}
            className={`${inputClass} h-auto py-2.5 font-light`}
          />
          <p className={helperClass}>
            Only used for POST, PUT, DELETE. JSON or raw text.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timeout" className={labelClass}>
            Request Timeout
          </Label>
          <Input
            id="timeout"
            type="number"
            placeholder="e.g. 5000 (milliseconds)"
            value={timeout}
            onChange={(e) => onTimeoutChange(e.target.value)}
            disabled={submitting}
            className={inputClass}
          />
          <p className={helperClass}>
            Request timeout in milliseconds. Defaults to 5000.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expected-status" className={labelClass}>
            Expected Status Code
          </Label>
          <Input
            id="expected-status"
            type="number"
            placeholder="e.g. 200"
            value={expectedStatus}
            onChange={(e) => onExpectedStatusChange(e.target.value)}
            disabled={submitting}
            className={inputClass}
          />
          <p className={helperClass}>Defaults to 200.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedTab;
