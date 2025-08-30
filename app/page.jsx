"use client";

import { columns } from "@/components/Columns";
import { FeaturesTable } from "@/components/FeaturesTable";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/Card";
import { Loader2, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn, countComplianceByRegion, interpolateColor } from "@/lib/utils";
import { supabaseClient } from "@/lib/supabase/client";
import { MASTER_COORDS } from "@/lib/openstreetmap/simplified/coords";

const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false }
);

const position = [52.28053, -43.56581];

export default function Home() {
  const [featureData, setFeatureData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await supabaseClient.from("features").select("*");
      console.log(response.data);
      setFeatureData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        // eslint-disable-next-line react/no-unstable-nested-components
        loading: () => <Loader2 className="h-8 w-8 mt-2 animate-spin" />,
        ssr: false
      }),
    []
  );

  function generatePolygons() {
    if (!featureData) return null;

    const totalFeatures = featureData.length;
    const numFeaturesCompliantForEachRegion =
      countComplianceByRegion(featureData);

      console.log(numFeaturesCompliantForEachRegion)

    const polygons = [];

    Object.entries(MASTER_COORDS).forEach(([regionName, regionPolygons]) => {
      const numCompliant = numFeaturesCompliantForEachRegion[regionName] || 0;
      const numNonCompliant = totalFeatures - numCompliant;

      // Calculate the color based on ratio: more compliant -> greener, more non-compliant -> redder
      const ratio = numCompliant / totalFeatures; // 0 = all non-compliant, 1 = all compliant
      const color = interpolateColor("#b91919", "#2fba16", ratio);

      regionPolygons.forEach((coords, polyIdx) => {
        polygons.push(
          <Polygon
            key={`polygon-${regionName}-${polyIdx}`}
            positions={coords}
            pathOptions={{ color, weight: 1.5 }}
          >
            <Tooltip sticky>
              {regionName} ({numCompliant}/{totalFeatures} compliant)
            </Tooltip>
          </Polygon>
        );
      });
    });

    return polygons;
  }

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
              {generatePolygons()}
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

        <FeaturesTable columns={columns} data={featureData} />
      </div>
    </section>
  );
}
