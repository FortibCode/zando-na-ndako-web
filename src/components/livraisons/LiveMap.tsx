"use client";

import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Bike, MapPin, Store } from "lucide-react";
import L from "leaflet";
import type { LucideIcon } from "lucide-react";
import type { LivraisonPosition } from "@/lib/types";

// Brazzaville — centre par défaut si aucune livraison active n'a de position connue.
const DEFAULT_CENTER: [number, number] = [-4.2634, 15.2429];

function divIcon(Icon: LucideIcon, bg: string) {
  const svg = renderToStaticMarkup(<Icon size={15} color="#fff" strokeWidth={2.5} />);
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:${bg};box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid white;">${svg}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

const COURIER_ICON = divIcon(Bike, "#1A2E5A");
const ORIGIN_ICON = divIcon(Store, "#2E7D32");
const DEST_ICON = divIcon(MapPin, "#C00000");

export function LiveMap({ livraisons }: { livraisons: LivraisonPosition[] }) {
  const center = useMemo<[number, number]>(() => {
    if (livraisons.length === 0) return DEFAULT_CENTER;
    return [livraisons[0].position.lat, livraisons[0].position.lng];
  }, [livraisons]);

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {livraisons.map((l) => (
        <div key={l.livraison_id}>
          <Marker position={[l.position.lat, l.position.lng]} icon={COURIER_ICON}>
            <Popup>
              <div className="text-xs">
                <p className="font-black">{l.numero_commande}</p>
                <p>{l.livreur?.nom ?? "Livreur"}</p>
                {l.client && <p className="text-slate-500">Pour {l.client}</p>}
              </div>
            </Popup>
          </Marker>
          {l.origine && <Marker position={[l.origine.lat, l.origine.lng]} icon={ORIGIN_ICON} />}
          {l.destination && <Marker position={[l.destination.lat, l.destination.lng]} icon={DEST_ICON} />}
          {l.origine && l.destination && (
            <Polyline
              positions={[[l.origine.lat, l.origine.lng], [l.position.lat, l.position.lng], [l.destination.lat, l.destination.lng]]}
              pathOptions={{ color: "#1A2E5A", weight: 2, dashArray: "6 6", opacity: 0.5 }}
            />
          )}
        </div>
      ))}
    </MapContainer>
  );
}
