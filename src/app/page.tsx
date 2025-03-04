"use client";
import { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import Link from "next/link";
import { WhatsappShareButton } from "next-share";
import Image from "next/image";

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
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [poopDetails, setPoopDetails] = useState<PoopDetails | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (timer) {
      const interval = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.round((Date.now() - startTime) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, startTime]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hrs, mins, secs].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const startPoop = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setTimer(setInterval(() => {}, 1000));
  };

  const stopPoop = () => {
    if (timer && startTime) {
      clearInterval(timer);
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
      duration: formatTime(elapsedTime),
      location: formData.get("location") as string,
      condition: formData.get("condition") as string,
    };

    await addDoc(collection(db, "poop_logs"), data);
    setPoopDetails(data);
    setSaving(false);
  };

  return (
    <div className="container">
      <div className="phone-frame">
        <h1 className="title">Let's Poop</h1>
        <h2 className="timer">
          ⏳ {formatTime(elapsedTime)}
        </h2>

        {!timer ? (
          <button onClick={startPoop} className="start-btn">
            START
          </button>
        ) : (
          <button onClick={stopPoop} className="stop-btn">
            STOP
          </button>
        )}

        {elapsedTime > 0 && !timer && (
          <form onSubmit={savePoopLog} className="poop-form">
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
            <p className="poop-log">
              Poop logged at {poopDetails.time} on {poopDetails.date}.
            </p>
            <WhatsappShareButton url="https://poop-tracker.app">
              <button className="share-btn">Share Poop Log</button>
            </WhatsappShareButton>
          </>
        )}

        <Link href="/map" className="map-link">🌍 View Global Poop Map</Link>
      </div>
    </div>
  );
}
