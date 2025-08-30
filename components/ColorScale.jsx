import { interpolateColor } from "@/lib/utils";
import chroma from "chroma-js";

export default function ColorScale() {
  const steps = 5; // number of squares
  const colors = Array.from({ length: steps }, (_, i) =>
    interpolateColor("#df1313", "#2ee30e", i / (steps - 1))
  );

  return (
    <div className="flex items-center gap-2 mt-3 text-xs">
      {/* Label Left */}
      <span className="text-gray-700 font-medium">None compliant</span>

      {/* Squares */}
      <div className="flex gap-2">
        {colors.map((c, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-xs"
            style={{
              backgroundColor: chroma(c).alpha(0.3).css(),
              border: `1.5px solid ${c}`,
            }}
          />
        ))}
      </div>

      {/* Label Right */}
      <span className="text-gray-700 font-medium">All compliant</span>
    </div>
  );
};