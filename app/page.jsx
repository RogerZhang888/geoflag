"use client";

import { columns } from "@/components/Columns";
import { COORDS } from "@/lib/openstreetmap/simplified/coords";
import { MOCK_DATA } from "@/lib/mock/data";
import { FeaturesTable } from "@/components/FeaturesTable";
import { Button, buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/Card";
import { MOCK_FEATURE_DATA } from "@/lib/mock";
import { Loader2, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false }
);

export default function Home() {
   const position = [52.28053, -43.56581];

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        // eslint-disable-next-line react/no-unstable-nested-components
        loading: () => <Loader2 className="h-8 w-8 mt-2 animate-spin" />,
        ssr: false
      }),
    []
  );

  const generatePolygons = (data) => {
    return data.flatMap((reg, idx) => {
      const allPolygons = [];

      const addPolygonWithTooltip = (coords, color, label, keyPrefix) => {
        allPolygons.push(
          <Polygon
            key={keyPrefix}
            positions={coords} // [lat, lon] array
            pathOptions={{ color, weight: 1.5 }}
          >
            {/* Tooltip in the middle of the polygon */}
            <Tooltip sticky>{label}</Tooltip>
          </Polygon>
        );
      };

      // Compliant regions
      if (reg.regionsCompliant?.length > 0) {
        reg.regionsCompliant.forEach((regionName, regionIdx) => {
          const polygons = COORDS[regionName];
          if (!polygons) return;

          polygons.forEach((coords, polyIdx) => {
            addPolygonWithTooltip(
              coords,
              "#2fba16",
              regionName, // text in tooltip
              `polygon-${idx}-compliant-${regionIdx}-${polyIdx}`
            );
          });
        });
      }

      // Non-compliant regions
      if (reg.regionsNotCompliant?.length > 0) {
        reg.regionsNotCompliant.forEach((regionName, regionIdx) => {
          const polygons = COORDS[regionName];
          if (!polygons) return;

          polygons.forEach((coords, polyIdx) => {
            addPolygonWithTooltip(
              coords,
              "#b91919",
              regionName, // text in tooltip
              `polygon-${idx}-noncompliant-${regionIdx}-${polyIdx}`
            );
          });
        });
      }

      return allPolygons;
    });
  };

  return (
    <section
      id="main-page"
      className="flex flex-col justify-center size-full items-center gap-8 my-8"
    >
      <div className="px-6 sm:px-16 max-w-screen-xl mx-auto size-full">
        <Card>
          <CardHeader>
            <CardTitle>Map View</CardTitle>
            <CardDescription>
              Powered by{" "}
              <code className="font-mono text-gray-500 text-xs font-medium">
                OpenStreetMap
              </code>{" "}
              and{" "}
              <code className="font-mono text-gray-500 text-xs font-medium">
                Leaflet.js
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Map
              className="w-full h-[400px] md:h-[600px] z-10 rounded"
              position={position}
              zoom={3}
            >
              {generatePolygons(MOCK_DATA)}
            </Map>
          </CardContent>
        </Card>
      </div>
      <div className="px-6 sm:px-16 max-w-screen-xl mx-auto size-full flex flex-col gap-4">
        <span className="flex gap-2 items-center justify-between size-full">
          <h2 className="font-bold text-xl">Features</h2>
          <Link
            variant="default"
            size="lg"
            href="/newFeature"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-fit"
            )}
          >
            <Plus /> Add New Feature
          </Link>
        </span>

        <FeaturesTable columns={columns} data={MOCK_FEATURE_DATA} />
      </div>
    </section>
  );
}
