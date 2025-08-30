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
import {
  cn,
  countComplianceByRegion,
  getFlagEmoji,
  interpolateColor,
  regionFullNames
} from "@/lib/utils";
import { supabaseClient } from "@/lib/supabase/client";
import { MASTER_COORDS } from "@/lib/openstreetmap/simplified/coords";
import ColorScale from "@/components/ColorScale";
import FlagIcon from "@/components/FlagIcon";

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

    const polygons = [];

    Object.entries(MASTER_COORDS).forEach(([reg, regPolygons]) => {
      const {
        compliant: { num: numCompliant, features: featuresCompliant },
        nonCompliant: { num: numNotCompliant, features: featuresNotCompliant },
        unknown: { num: numUnknown, features: featuresUnknown }
      } = numFeaturesCompliantForEachRegion[reg];

      const colorRatio = numCompliant / totalFeatures;
      const color = interpolateColor("#df1313", "#2ee30e", colorRatio);

      regPolygons.forEach((coords, polyIdx) => {
        polygons.push(
          <Polygon
            key={`polygon-${reg}-${polyIdx}`}
            positions={coords}
            pathOptions={{
              color,
              weight: 1.5,
              fillColor: color,
              fillOpacity: 0.3,
            }}
          >
            <Tooltip sticky>
              <div className="text-base flex gap-2 flex-row items-center">
                <FlagIcon place={reg}/> {regionFullNames[reg]} (
                {numCompliant} / {totalFeatures} features compliant)
              </div>
              <div className="text-sm mt-2">
                <strong>✅ Compliant ({numCompliant}):</strong>
                <ul className="list-disc list-inside">
                  {featuresCompliant.map((feature) => (
                    <li key={`comp-${feature.id}`}>{feature.feature}</li>
                  ))}
                </ul>
                <strong>❌ Non-Compliant ({numNotCompliant}):</strong>
                <ul className="list-disc list-inside">
                  {featuresNotCompliant.map((feature) => (
                    <li key={`noncomp-${feature.id}`}>{feature.feature}</li>
                  ))}
                </ul>
                <strong>❔ Unknown ({numUnknown}):</strong>
                <ul className="list-disc list-inside">
                  {featuresUnknown.map((feature) => (
                    <li key={`unkn-${feature.id}`}>{feature.feature}</li>
                  ))}
                </ul>
              </div>
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
            <ColorScale />
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
