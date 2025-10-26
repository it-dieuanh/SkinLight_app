"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Camera, X, Check, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CapturePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [session, router]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      streamRef.current = mediaStream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage("");
    startCamera();
  };

  const handleUsePhoto = () => {
    if (!capturedImage) return;

    // Get lifestyle data from localStorage (optional)
    const lifestyleData = localStorage.getItem("currentLifestyleData");
    if (!lifestyleData) {
      toast.warning("Proceeding without lifestyle data. For better results, complete your profile questions first.");
    }

    // Get Google ID token from session
    const googleToken = (session as any)?.idToken;
    if (!googleToken) {
      toast.error("Authentication error. Please log in again.");
      router.push("/login");
      return;
    }

    // Store data in sessionStorage (not URL - too large!)
    sessionStorage.setItem("skinAnalysisImage", capturedImage);
    sessionStorage.setItem("skinAnalysisLifestyle", lifestyleData || "{}");
    sessionStorage.setItem("skinAnalysisToken", googleToken);

    // Navigate to results page without query params
    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Capture Your Skin</h1>
          <Button
            variant="outline"
            onClick={() => {
              stopCamera();
              router.push("/profile");
            }}
            size="sm"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Tips Card */}
        <Card className="p-6 bg-accent/20 border-accent">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-semibold">Tips for Best Results:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pull back your hair to expose your entire face</li>
                <li>• Take photos in good natural lighting</li>
                <li>• Best time: right after waking up or after exercise</li>
                <li>• Face the camera directly with a neutral expression</li>
                <li>• Ensure your face is clean and makeup-free</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Camera/Preview Area */}
        <Card className="p-6">
          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            {!isCameraActive && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={startCamera}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}

            {isCameraActive && !capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="mt-6 flex gap-4 justify-center">
            {isCameraActive && !capturedImage && (
              <Button
                onClick={capturePhoto}
                size="lg"
                className="bg-primary hover:bg-primary/90 px-12"
              >
                <Camera className="w-5 h-5 mr-2" />
                Capture
              </Button>
            )}

            {capturedImage && (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  <X className="w-5 h-5 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={handleUsePhoto}
                  disabled={loading}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}