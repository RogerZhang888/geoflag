"use client";

import {
  cleanIsCompliantData,
  getFlagEmoji,
  regionFullNames
} from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import FlagIcon from "./FlagIcon";

export const columns = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <code className="font-mono text-gray-600 bg-gray-200 px-2 py-1 rounded text-xs font-medium">
        {row.original.id}
      </code>
    )
  },
  {
    accessorKey: "feature",
    header: "Feature",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate" title={row.getValue("feature")}>
        {row.getValue("feature")}
      </div>
    )
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div
        className="max-w-[250px] truncate"
        title={row.getValue("description")}
      >
        {row.getValue("description")}
      </div>
    )
  },
  {
    accessorKey: "isCompliant",
    header: "Compliance",
    cell: ({ row }) => {
      const v = row.getValue("isCompliant");
      const compDat = cleanIsCompliantData(v);
      const isAllCompliant = Object.values(compDat).every((v) => v === true);
      const isNoneCompliant = Object.values(compDat).every((v) => v === false);

      return (
        <div className="max-w-[250px] text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className="w-15"
                variant={
                  isAllCompliant
                    ? "success"
                    : isNoneCompliant
                      ? "destructive"
                      : "warning"
                }
              >
                {isAllCompliant
                  ? "Total"
                  : isNoneCompliant
                    ? "None"
                    : "Partial"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="flex flex-col gap-2">
              {Object.entries(compDat)
                .sort((a, b) => b[0] - a[0])
                .map(([r, c], idx) => (
                  <div
                    key={idx}
                    className="text-sm flex flex-row items-center gap-2"
                  >
                    <FlagIcon place={r} /> {regionFullNames[r]}:{" "}
                    <span
                      className={
                        c === "true"
                          ? "text-green-600"
                          : c === "false"
                            ? "text-red-600"
                            : "text-gray-600"
                      }
                    />
                    <FlagIcon place={r} /> {regionFullNames[r]}:{" "}
                    <span
                      className={
                        c === "true"
                          ? "text-[#217005]"
                          : c === "false"
                            ? "text-[#c0123c]"
                            : "text-gray-600"
                      }
                    >
                      {c === "true"
                        ? "Compliant"
                        : c === "false"
                          ? "Non-Compliant"
                          : "Unknown"}
                    </span>
                  </div>
                ))}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate" title={row.getValue("reason")}>
        {row.getValue("reason")}
      </div>
    )
  }
];
