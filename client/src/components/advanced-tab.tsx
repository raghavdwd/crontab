import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Field, FieldLabel } from "./ui/field";
import { CircleCheckBig } from "lucide-react";
import { Input } from "./ui/input";

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
  onHeadersChange: (headers: Header[]) => void;
  onMethodChange: (method: string) => void;
  onBodyChange: (body: string) => void;
  onTimeoutChange: (timeout: string) => void;
  onExpectedStatusChange: (status: string) => void;
}

const AdvancedTab = ({
  headers,
  method,
  body,
  timeout,
  expectedStatus,
  onHeadersChange,
  onMethodChange,
  onBodyChange,
  onTimeoutChange,
  onExpectedStatusChange,
}: AdvancedTabProps) => {
  const [headersCount, setHeadersCount] = React.useState(1);

  const toggleEnable = (id: number) => {
    onHeadersChange(
      headers.map((header) =>
        header.id === id ? { ...header, enabled: !header.enabled } : header,
      ),
    );
  };

  const duplicateHeaderField = () => {
    setHeadersCount((prev) => prev + 1);
    onHeadersChange([
      ...headers,
      { id: headersCount + 1, name: "", value: "", enabled: true },
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
      <CardContent className="p-4 pt-0">
        <div className="space-y-1.5">
          <Field>
            <FieldLabel
              htmlFor="custom-headers"
              className="flex items-center gap-1"
            >
              Custom Headers
            </FieldLabel>
            {headers.map((header) => (
              <div key={header.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Header Name"
                  value={header.name}
                  onChange={(e) =>
                    updateHeader(header.id, "name", e.target.value)
                  }
                  className="flex-1 rounded-md border border-[#e5e5e7] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cbd5e1]"
                />
                <input
                  type="text"
                  placeholder="Header Value"
                  value={header.value}
                  onChange={(e) =>
                    updateHeader(header.id, "value", e.target.value)
                  }
                  className="flex-1 rounded-md border border-[#e5e5e7] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cbd5e1]"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleEnable(header.id)}
                      className={`rounded-md ${header.enabled ? "bg-green-300" : ""} cursor-pointer transition-colors`}
                    >
                      <CircleCheckBig width={22} height={22} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{header.enabled ? "Disable" : "Enable"} Header</p>
                  </TooltipContent>
                </Tooltip>
                <button
                  type="button"
                  onClick={() =>
                    onHeadersChange(headers.filter((h) => h.id !== header.id))
                  }
                  className="bg-red-500 px-3 py-2 text-sm border-2 border-red-700 rounded-md text-black transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={duplicateHeaderField}
              className="mt-2 rounded-md bg-gray-950 px-3 py-2 text-sm text-white transition-colors"
            >
              Add Header
            </button>
          </Field>
        </div>
        <div className="space-y-1.5 mt-3">
          <Field>
            <FieldLabel htmlFor="select-method">HTTP Method</FieldLabel>
            <select
              id="select-method"
              value={method}
              onChange={(e) => onMethodChange(e.target.value)}
              className="w-full rounded-md border border-[#e5e5e7] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cbd5e1]"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </Field>
        </div>
        <div className="space-y-1.5 mt-3">
          <Field>
            <FieldLabel htmlFor="textarea-message">Request Body</FieldLabel>
            <Textarea
              cols={30}
              rows={10}
              id="textarea-message"
              placeholder="Type your request body here."
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
            />
          </Field>
        </div>
        <div className="space-y-1.5 mt-3">
          <Field>
            <FieldLabel htmlFor="timeout">Request Timeout</FieldLabel>
            <Input
              id="timeout"
              type="number"
              placeholder="e.g. 5000 (milliseconds)"
              value={timeout}
              onChange={(e) => onTimeoutChange(e.target.value)}
            />
          </Field>
        </div>
        <div className="space-y-1.5 mt-3">
          <Field>
            <FieldLabel htmlFor="expected-status">
              Expected Status Code
            </FieldLabel>
            <Input
              id="expected-status"
              type="number"
              placeholder="e.g. 200"
              value={expectedStatus}
              onChange={(e) => onExpectedStatusChange(e.target.value)}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedTab;
