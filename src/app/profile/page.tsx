"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Camera,
  Frown,
  Meh,
  Smile,
  Angry,
  Laugh,
  Droplets,
  Sparkles,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
}

interface PhotoHistory {
  id: string;
  imageUrl: string;
  date: string;
  analysis?: any;
}

const stressLevels = [
  { label: "Stressed", icon: Angry, value: 1 },
  { label: "Sad", icon: Frown, value: 2 },
  { label: "Normal", icon: Meh, value: 3 },
  { label: "Happy", icon: Smile, value: 4 },
  { label: "Very Happy", icon: Laugh, value: 5 },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [photoHistory, setPhotoHistory] = useState<PhotoHistory[]>([]);
  const [sleepTime, setSleepTime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [stressLevel, setStressLevel] = useState(3);
  const [exerciseMinutes, setExerciseMinutes] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch weather data for Hanoi with UV index and humidity
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=uv_index_max&timezone=Asia/Bangkok"
        );
        const data = await response.json();
        
        console.log("Weather API Response:", data);
        
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m,
          humidity: data.current.relative_humidity_2m,
          uvIndex: data.daily.uv_index_max[0],
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    fetchWeather();
    // Fetch every hour
    const interval = setInterval(fetchWeather, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load photo history from localStorage
    const loadHistory = () => {
      const savedHistory = localStorage.getItem("photoHistory");
      if (savedHistory) {
        setPhotoHistory(JSON.parse(savedHistory));
      }
    };

    loadHistory();

    // Refresh history when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadHistory();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", loadHistory);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadHistory);
    };
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return Sun;
    if (code <= 3) return Cloud;
    if (code <= 67) return CloudRain;
    if (code <= 77) return CloudSnow;
    return Wind;
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { label: "Low", color: "text-green-600" };
    if (uvIndex <= 5) return { label: "Moderate", color: "text-yellow-600" };
    if (uvIndex <= 7) return { label: "High", color: "text-orange-600" };
    if (uvIndex <= 10) return { label: "Very High", color: "text-red-600" };
    return { label: "Extreme", color: "text-purple-600" };
  };

  const handlePhotoClick = (photo: PhotoHistory) => {
    // Navigate to results page with photo data
    router.push(`/results?photoId=${photo.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCapture = () => {
    // Save current lifestyle data to localStorage WITH weather data
    const lifestyleData = {
      sleepTime,
      wakeTime,
      stressLevel,
      exerciseMinutes: parseInt(exerciseMinutes) || 0,
      weather: weather
        ? {
            temperature: weather.temperature,
            humidity: weather.humidity,
            uvIndex: weather.uvIndex,
          }
        : undefined,
      date: new Date().toISOString(),
    };
    localStorage.setItem("currentLifestyleData", JSON.stringify(lifestyleData));
    router.push("/capture");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/15">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode) : Cloud;
  const uvLevel = weather ? getUVLevel(weather.uvIndex) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Hero Dashboard Grid - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Large User Profile Card - Takes 5 columns */}
          <Card className="lg:col-span-5 p-8 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border-primary/30 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[280px]">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity" />
                    <div className="w-20 h-20 rounded-full relative ring-4 ring-background bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sun className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {session?.user?.name}
                    </h1>
                    <p className="text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="w-4 h-4 text-primary-foreground" />
                    <p className="text-xs text-foreground/80">Total Scans</p>
                  </div>
                  <p className="text-2xl font-bold">{photoHistory.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary-foreground" />
                    <p className="text-xs text-foreground/80">This Month</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {photoHistory.filter(p => {
                      const photoDate = new Date(p.date);
                      const now = new Date();
                      return photoDate.getMonth() === now.getMonth() && 
                             photoDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Weather Dashboard - Takes 7 columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Large Temperature Card - Spans 2 columns */}
            {weather && (
              <>
                <Card className="col-span-2 row-span-2 p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border-primary/30 hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl translate-y-24 translate-x-24 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Weather</p>
                      <p className="text-xs text-muted-foreground">Hanoi, Vietnam</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-7xl font-bold mb-2">{weather.temperature}°</p>
                        <div className="flex items-center gap-2">
                          <WeatherIcon className="w-6 h-6 text-primary" />
                          <p className="text-sm text-muted-foreground">
                            {weather.weatherCode === 0 ? "Clear" : 
                             weather.weatherCode <= 3 ? "Cloudy" : 
                             weather.weatherCode <= 67 ? "Rainy" : "Stormy"}
                          </p>
                        </div>
                      </div>
                      <WeatherIcon className="w-20 h-20 text-primary/20" />
                    </div>
                  </div>
                </Card>

                {/* UV Index Card */}
                <Card className="col-span-1 p-4 bg-gradient-to-br from-primary/15 via-card to-accent/15 border-primary/30 hover:shadow-xl transition-all duration-300">
                  <Sun className="w-8 h-8 text-orange-500 mb-3" />
                  <p className="text-xs text-muted-foreground mb-1">UV Index</p>
                  <p className={`text-3xl font-bold ${uvLevel?.color}`}>
                    {weather.uvIndex}
                  </p>
                  <p className={`text-xs mt-1 ${uvLevel?.color}`}>{uvLevel?.label}</p>
                </Card>

                {/* Humidity Card */}
                <Card className="col-span-1 p-4 bg-gradient-to-br from-primary/15 via-card to-accent/15 border-primary/30 hover:shadow-xl transition-all duration-300">
                  <Droplets className="w-8 h-8 text-blue-500 mb-3" />
                  <p className="text-xs text-muted-foreground mb-1">Humidity</p>
                  <p className="text-3xl font-bold">{weather.humidity}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Moisture</p>
                </Card>

                {/* Wind Speed Card */}
                <Card className="col-span-2 p-4 bg-gradient-to-r from-primary/10 to-accent/15 border-primary/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Wind Speed</p>
                      <p className="text-3xl font-bold">{weather.windSpeed}</p>
                      <p className="text-xs text-muted-foreground">km/h</p>
                    </div>
                    <Wind className="w-12 h-12 text-primary/30" />
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Photo History - Takes 2 columns */}
          <Card className="xl:col-span-2 p-8 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Skin Analysis History
                  </h2>
                  <p className="text-sm text-muted-foreground">Track your skin journey</p>
                </div>
              </div>
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            
            {photoHistory.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex p-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/20 mb-6">
                  <Camera className="w-20 h-20 text-primary/40" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground mb-6">Start your skin care journey by taking your first photo</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {photoHistory.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoClick(photo)}
                    className="relative aspect-square rounded-2xl overflow-hidden hover:ring-4 ring-primary/50 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:z-10"
                  >
                    <Image
                      src={photo.imageUrl}
                      alt={`Photo from ${photo.date}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-[10px] font-medium leading-tight">
                        {formatDate(photo.date)}
                      </p>
                    </div>
                    <div className="absolute top-1 right-1 p-1 rounded-full bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Lifestyle Form - Takes 1 column, Stack of Cards */}
          <div className="space-y-4">
            {/* Header Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border-primary/30">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Daily Check-in
                  </h2>
                  <p className="text-xs text-muted-foreground">Track your lifestyle today</p>
                </div>
              </div>
            </Card>

            {/* Sleep Schedule Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30 hover:shadow-lg transition-all duration-300">
              <Label className="text-sm font-semibold mb-4 block">Sleep Schedule</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="sleepTime" className="text-xs text-muted-foreground">Bed Time</Label>
                  <Input
                    id="sleepTime"
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="wakeTime" className="text-xs text-muted-foreground">Wake Up</Label>
                  <Input
                    id="wakeTime"
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            </Card>

            {/* Stress Level Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30 hover:shadow-lg transition-all duration-300">
              <Label className="text-sm font-semibold mb-4 block">Mood & Stress</Label>
              <div className="grid grid-cols-5 gap-2">
                {stressLevels.map((level) => {
                  const Icon = level.icon;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setStressLevel(level.value)}
                      className={`aspect-square p-2 rounded-xl border-2 transition-all duration-300 ${
                        stressLevel === level.value
                          ? "border-primary bg-primary/10 scale-110 shadow-lg"
                          : "border-border hover:border-primary/50 hover:scale-105"
                      }`}
                    >
                      <Icon
                        className={`w-full h-full ${
                          stressLevel === level.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                {stressLevels.find(l => l.value === stressLevel)?.label}
              </p>
            </Card>

            {/* Exercise Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30 hover:shadow-lg transition-all duration-300">
              <Label htmlFor="exercise" className="text-sm font-semibold mb-3 block">Exercise Duration</Label>
              <Input
                id="exercise"
                type="number"
                placeholder="Minutes"
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(e.target.value)}
                className="h-11"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-2">How long did you exercise today?</p>
            </Card>
          </div>
        </div>

        {/* Capture CTA - Full Width Hero Button */}
        <div className="mt-6 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <Button
            onClick={handleCapture}
            size="lg"
            className="relative w-full bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-8 text-xl rounded-2xl transition-all duration-500 hover:scale-[1.02] shadow-2xl"
          >
            <Camera className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold">Start New Skin Analysis</span>
            <Sparkles className="w-6 h-6 ml-3 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}