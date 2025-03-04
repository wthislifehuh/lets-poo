"use client";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import Link from "next/link";
import { WhatsappShareButton } from "next-share";

interface PoopDetails {
  date: string;
  time: string;
  duration: string;
  location: string;
  condition: string;
}

export default function Home() {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [poopDetails, setPoopDetails] = useState<PoopDetails | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const startPoop = () => {
    setStartTime(Date.now());
    setTimer(setInterval(() => {}, 1000));
  };

  const stopPoop = () => {
    if (timer && startTime) {
      clearInterval(timer);
      const poopDuration = Math.round((Date.now() - startTime) / 1000);
      setDuration(poopDuration);
      setTimer(null);
    }
  };

  const savePoopLog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const data: PoopDetails = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      duration: `${duration} sec`,
      location: formData.get("location") as string,
      condition: formData.get("condition") as string,
    };

    await addDoc(collection(db, "poop_logs"), data);
    setPoopDetails(data);
    setSaving(false);
  };

  return (
    <div className="container">
      <h1>Poop Tracker 🚽</h1>

      {!timer ? (
        <button onClick={startPoop} className="start-btn">
          Start Poop Timer
        </button>
      ) : (
        <button onClick={stopPoop} className="stop-btn">
          Stop Poop Timer
        </button>
      )}

      {duration !== null && (
        <form onSubmit={savePoopLog}>
          <h2>Log Poop Details</h2>
          <label>
            Location:
            <input type="text" name="location" required />
          </label>
          <label>
            Poop Condition:
            <select name="condition" required>
              <option value="Normal">💩 Normal</option>
              <option value="Watery">🚰 Watery</option>
              <option value="Hard">🪵 Hard</option>
            </select>
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save to Calendar"}
          </button>
        </form>
      )}

      {poopDetails && (
        <>
          <p>Poop logged at {poopDetails.time} on {poopDetails.date}.</p>
          <WhatsappShareButton url="https://poop-tracker.app">
            <button>Share Poop Log on WhatsApp</button>
          </WhatsappShareButton>
        </>
      )}

      <Link href="/map">🌍 View Global Poop Map</Link>
    </div>
  );
}
