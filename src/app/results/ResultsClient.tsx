"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Home,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Heart,
  Star,
  CheckCircle,
  Smile,
} from "lucide-react";
import Image from "next/image";

interface AnalysisResult {
  image?: string;
  aiAnalysis?: string;
  skinData?: {
    top_brightest_regions?: Array<{
      region: string;
      brightness: number;
    }>;
    acne?: {
      class: string;
      redness?: number;
      coverage?: number;
    };
    blackspot?: {
      class: string;
      darkness_level?: number;
      coverage_ratio?: number;
    };
  };
  timestamp?: string;
}

interface PhotoHistoryItem {
  id: string;
  imageUrl: string;
  date: string;
  analysis: AnalysisResult;
}

// Helper function to parse AI analysis into sections
function parseAIAnalysis(text: string) {
  const sections: Array<{ title: string; content: string; icon: any }> = [];

  // Split by common section patterns
  const lines = text.split("\n");
  let currentSection = { title: "", content: "", icon: MessageSquare };
  let hasStarted = false;

  lines.forEach((line, index) => {
    // Check if line is a section header (ends with : or starts with ##)
    const isHeader =
      line.trim().endsWith(":") ||
      line.trim().startsWith("##") ||
      /^\d+\./.test(line.trim()) ||
      line.trim().match(/^[A-Z][^.!?]*:$/);

    if (isHeader && line.trim().length > 0 && line.trim().length < 60) {
      // Save previous section
      if (hasStarted && currentSection.content.trim()) {
        sections.push({ ...currentSection });
      }

      // Start new section
      const title = line
        .trim()
        .replace(/^##\s*/, "")
        .replace(/^\d+\.\s*/, "")
        .replace(/:$/, "")
        .trim();
      const icon = getIconForSection(title);
      currentSection = { title, content: "", icon };
      hasStarted = true;
    } else if (hasStarted && line.trim()) {
      currentSection.content += line + "\n";
    } else if (!hasStarted) {
      // First content before any headers
      if (!currentSection.title) {
        currentSection.title = "Overview";
        currentSection.icon = Sparkles;
      }
      currentSection.content += line + "\n";
      hasStarted = true;
    }
  });

  // Add last section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  // If no sections were created, create a single overview section
  if (sections.length === 0) {
    sections.push({
      title: "Analysis",
      content: text,
      icon: Sparkles,
    });
  }

  return sections;
}

function getIconForSection(title: string) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("recommend") || lowerTitle.includes("suggest"))
    return Lightbulb;
  if (lowerTitle.includes("tip") || lowerTitle.includes("advice")) return Star;
  if (lowerTitle.includes("care") || lowerTitle.includes("routine"))
    return Heart;
  if (
    lowerTitle.includes("key") ||
    lowerTitle.includes("finding") ||
    lowerTitle.includes("result")
  )
    return CheckCircle;
  if (lowerTitle.includes("overview") || lowerTitle.includes("summary"))
    return Sparkles;
  return MessageSquare;
}

// Typing effect component
function TypingText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayedText}</span>;
}

export default function ResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photoId = searchParams.get("photoId");

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasSavedToHistory = useRef(false);

  useEffect(() => {
    // If photoId exists, load from history
    if (photoId) {
      const savedHistory = localStorage.getItem("photoHistory");
      if (savedHistory) {
        const history: PhotoHistoryItem[] = JSON.parse(savedHistory);
        const photo = history.find((p) => p.id === photoId);
        if (photo) {
          setAnalysis(photo.analysis);
          setLoading(false);
          return;
        }
      }
      setError("Photo not found in history");
      setLoading(false);
      return;
    }

    // Otherwise, analyze new image
    const analyzeImage = async () => {
      try {
        const image = sessionStorage.getItem("skinAnalysisImage");
        const lifestyleData = sessionStorage.getItem("skinAnalysisLifestyle");

        if (!image || !lifestyleData) {
          setError("Missing required data. Please capture a photo first.");
          setLoading(false);
          return;
        }

        // Convert base64 to blob
        const blob = await fetch(image).then((r) => r.blob());
        const file = new File([blob], "skin-analysis.jpg", {
          type: "image/jpeg",
        });

        // Prepare form data
        const formData = new FormData();
        formData.append("image", file);
        formData.append("lifestyleData", lifestyleData);

        // Call API
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Analysis failed");
        }

        const data = await response.json();
        setAnalysis(data.analysis);

        // Save to photo history - ONLY ONCE
        if (!hasSavedToHistory.current) {
          hasSavedToHistory.current = true;

          const historyItem: PhotoHistoryItem = {
            id: Date.now().toString(),
            imageUrl: data.analysis.image,
            date: new Date().toISOString(),
            analysis: data.analysis,
          };

          const savedHistory = localStorage.getItem("photoHistory");
          const history: PhotoHistoryItem[] = savedHistory
            ? JSON.parse(savedHistory)
            : [];

          // Check for duplicate (same imageUrl within last 5 seconds)
          const isDuplicate = history.some(
            (item) =>
              item.imageUrl === historyItem.imageUrl &&
              Math.abs(
                new Date(item.date).getTime() -
                  new Date(historyItem.date).getTime()
              ) < 5000
          );

          if (!isDuplicate) {
            history.unshift(historyItem);
            localStorage.setItem("photoHistory", JSON.stringify(history));
          }
        }

        // Clear sessionStorage after successful analysis
        sessionStorage.removeItem("skinAnalysisImage");
        sessionStorage.removeItem("skinAnalysisLifestyle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to analyze");
      } finally {
        setLoading(false);
      }
    };

    analyzeImage();
  }, [photoId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Analysis Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            onClick={() => router.push("/profile")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Return to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1
            className="text-4xl font-bold text-primary"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your Skin Analysis
          </h1>
          <p className="text-muted-foreground">
            Personalized insights and recommendations
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Photo + Technical Analysis */}
          <div className="space-y-6">
            {loading ? (
              <div className="bg-card rounded-2xl p-6 shadow-lg">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted animate-pulse" />
              </div>
            ) : (
              <>
                {/* Image Preview */}
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <h2
                    className="text-2xl font-bold mb-4 text-primary"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Your Photo
                  </h2>
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={analysis?.image || ""}
                      alt="Skin analysis photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Technical Data - Detail Analysis */}
                {analysis?.skinData && (
                  <div className="bg-card rounded-2xl p-6 shadow-lg space-y-4">
                    <h2
                      className="text-2xl font-bold text-primary"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Detail Analysis
                    </h2>

                    {/* Most Oily Regions */}
                    {(analysis?.skinData?.top_brightest_regions?.length ?? 0) >
                      0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground">
                          Most Oily Regions:
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {analysis!.skinData!.top_brightest_regions!.map(
                            (region, idx) => (
                              <div
                                key={idx}
                                className="bg-muted rounded-lg p-3 text-center"
                              >
                                <p className="font-medium text-sm">
                                  {region.region}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Acne Analysis */}
                    {analysis.skinData.acne && (
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground">
                          Acne Analysis:
                        </h3>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm">
                            <span className="font-medium">
                              Classification:
                            </span>{" "}
                            {analysis.skinData.acne.class}
                          </p>
                          {analysis.skinData.acne.redness !== undefined && (
                            <p className="text-sm">
                              <span className="font-medium">
                                Redness Level:
                              </span>{" "}
                              {analysis.skinData.acne.redness.toFixed(1)}
                            </p>
                          )}

                          {analysis.skinData.acne.coverage !== undefined && (
                            <p className="text-sm">
                              <span className="font-medium">Coverage:</span>{" "}
                              {analysis.skinData.acne.coverage.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Blackspot Analysis */}
                    {analysis.skinData.blackspot && (
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground">
                          Dark Spots Analysis:
                        </h3>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm">
                            <span className="font-medium">
                              Classification:
                            </span>{" "}
                            {analysis.skinData.blackspot.class}
                          </p>
                          {analysis.skinData.blackspot.darkness_level !==
                            undefined && (
                            <p className="text-sm">
                              <span className="font-medium">
                                Darkness Level:
                              </span>{" "}
                              {analysis.skinData.blackspot.darkness_level.toFixed(
                                1
                              )}
                            </p>
                          )}

                          {analysis.skinData.blackspot.coverage_ratio !==
                            undefined && (
                            <p className="text-sm">
                              <span className="font-medium">Coverage:</span>{" "}
                              {(
                                analysis.skinData.blackspot.coverage_ratio *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: AI Chat Section */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2
                className="text-3xl font-bold text-primary flex items-center justify-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <Sparkles className="w-7 h-7" />
                AI Recommendations
              </h2>
            </div>

            {loading ? (
              /* Loading State - "SkinLight is analyzing" */
              <div className="flex justify-center">
                <div className="bg-card rounded-xl p-8 shadow-lg border border-primary/10 w-full md:w-[85%]">
                  <div className="flex items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-primary">
                        SkinLight is analyzing
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please wait while we analyze your skin and generate
                        personalized recommendations...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Analysis Results with Typing Effect */
              analysis?.aiAnalysis && (
                <div className="space-y-6">
                  {parseAIAnalysis(analysis.aiAnalysis).map(
                    (section, index) => {
                      const Icon = section.icon;
                      const isLeft = index % 2 === 0;

                      return (
                        <div
                          key={index}
                          className={`flex ${
                            isLeft ? "justify-start" : "justify-end"
                          } animate-in fade-in ${
                            isLeft
                              ? "slide-in-from-left-8"
                              : "slide-in-from-right-8"
                          } duration-700`}
                          style={{
                            animationDelay: `${index * 150}ms`,
                            animationFillMode: "backwards",
                          }}
                        >
                          <div className="bg-card rounded-xl p-5 shadow-lg border border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300 w-full md:w-[85%]">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <h3
                                className="font-bold text-foreground text-xl"
                                style={{
                                  fontFamily: "'Playfair Display', serif",
                                }}
                              >
                                {section.title}
                              </h3>
                            </div>

                            {/* Section Content with Typing Effect */}
                            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              <TypingText
                                text={section.content.trim()}
                                speed={15}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Thank You Section - Only show after loading */}
        {!loading && (
          <section className="px-4 py-16 relative mt-12">
            <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background rounded-3xl" />

            <div className="max-w-3xl mx-auto w-full relative z-10">
              <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
                <Smile className="w-16 h-16 text-primary mx-auto animate-pulse" />
                <h2
                  className="text-3xl md:text-4xl font-bold text-primary"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Thank You!
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  We appreciate you taking care of your skin with SkinLight.
                  Come back tomorrow to track your progress and continue your
                  journey to healthier, more radiant skin.
                </p>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground italic">
                    See you tomorrow! 👋
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 max-w-md mx-auto">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
          <Button
            onClick={() => router.push("/profile")}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Back to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
