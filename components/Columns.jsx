"use client";

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
    header: "Is Compliant"
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    }
  }
];
