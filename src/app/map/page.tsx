"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "leaflet/dist/leaflet.css";
import { LeafletMouseEvent } from "leaflet";
interface PoopLocation {
  lat: number;
  lng: number;
}

export default function PoopMap() {
  const [poopLocations, setPoopLocations] = useState<PoopLocation[]>([]);
  const [position, setPosition] = useState<PoopLocation | null>(null);

  useEffect(() => {
    const fetchPoopLocations = async () => {
      const querySnapshot = await getDocs(collection(db, "poop_locations"));
      setPoopLocations(querySnapshot.docs.map(doc => doc.data() as PoopLocation));
    };
    fetchPoopLocations();
  }, []);

  function MapClickHandler() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  const savePoopLocation = async () => {
    if (!position) return;
    await addDoc(collection(db, "poop_locations"), position);
    setPoopLocations([...poopLocations, position]);
  };

  return (
    <div>
      <h1>💩 Global Poop Map</h1>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />
        {poopLocations.map((poop, index) => (
          <Marker key={index} position={[poop.lat, poop.lng]}>
            <Popup>Someone pooped here! 💩</Popup>
          </Marker>
        ))}
        {position && (
          <Marker position={[position.lat, position.lng]}>
            <Popup>
              <button onClick={savePoopLocation}>Drop Poop Marker</button>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
