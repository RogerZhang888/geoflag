"use client"

import { columns } from "@/components/columns"
import { FeaturesTable } from "@/components/FeaturesTable"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet"

export default function Home() {

   const position = [51.505, -0.09]

   return (
      <section id="main-page" className="m-5 flex flex-col justify-center items-center gap-8">
         <div className="max-h-screen">
         <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
               <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
               </Popup>
            </Marker>
         </MapContainer>
         </div>
         <div className="container mx-auto">
            <FeaturesTable 
               columns={columns} 
               data={
                  [
                     {
                        id: "728ed52f",
                        amount: 100,
                        status: "pending",
                        email: "m@example.com",
                     }
                  ]
               }
            />
         </div>
         <div>
            <Button
               variant="default"
               size="lg"
            >
               <ArrowUp/> Insert New Feature
            </Button>
         </div>
      </section>
   )
}
