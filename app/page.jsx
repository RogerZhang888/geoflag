"use client";

import { columns } from "@/components/Columns";
import { FeaturesTable } from "@/components/FeaturesTable";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/Card";
import { MOCK_FEATURE_DATA } from "@/lib/mock";
import { ArrowUp, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";

export default function Home() {
  const position = [51.505, -0.09];

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        // eslint-disable-next-line react/no-unstable-nested-components
        loading: () => <p>A map is loading</p>,
        ssr: false
      }),
    []
  );

  return (
    <section
      id="main-page"
      className="flex flex-col justify-center size-full items-center gap-8"
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
              zoom={16}
            />
          </CardContent>
        </Card>
      </div>
      <div className="px-6 sm:px-16 max-w-screen-xl mx-auto size-full flex flex-col gap-4">
        <span className="flex gap-2 items-center justify-between size-full">
          <h2 className="font-bold text-xl">Features</h2>
          <Button variant="default" size="lg">
            <Plus /> Add New Feature
          </Button>
        </span>

        <FeaturesTable columns={columns} data={MOCK_FEATURE_DATA} />
      </div>
    </section>
  );
}
