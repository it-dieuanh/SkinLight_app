"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Camera, TrendingUp, Users, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    window.location.href = "/login";
  };

  // Array of 20 diverse face images for grid
  const faceImages = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
    "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80",
    "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80",
    "https://images.unsplash.com/photo-1502378735452-bc7d86632805?w=400&q=80",
    "https://images.unsplash.com/photo-1504199367641-aba8151af406?w=400&q=80",
    "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Asymmetric Layout */}
      <section className="min-h-screen flex items-center px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/15" />
        
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 
                className="text-5xl md:text-7xl font-bold tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <span className="block text-primary">SkinLight</span>
                <span className="block text-3xl md:text-4xl text-muted-foreground font-normal mt-4">
                  Your personalized skin analysis companion
                </span>
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleGoogleSignIn}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg group"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative h-[500px] hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] rotate-6" />
            <div className="absolute inset-0 bg-card rounded-[3rem] shadow-2xl p-8 flex items-center justify-center">
              <Camera className="w-32 h-32 text-primary opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* How SkinLight Works - Simple Grid Layout */}
      <section className="min-h-screen flex items-center px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              How SkinLight Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, effective, and personalized skin analysis in four easy steps
            </p>
          </div>
          
          {/* Simple 2x2 Grid Layout */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Capture */}
            <div className="bg-card rounded-3xl p-10 border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Capture</h3>
              <p className="text-muted-foreground">
                Take a clear photo of your skin. Our app guides you for the best results.
              </p>
            </div>

            {/* Analyze */}
            <div className="bg-card rounded-3xl p-10 border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Analyze</h3>
              <p className="text-muted-foreground">
                AI-powered assessment of your skin condition with detailed insights.
              </p>
            </div>

            {/* Track */}
            <div className="bg-card rounded-3xl p-10 border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Track</h3>
              <p className="text-muted-foreground">
                Monitor progress over time with detailed history and trends.
              </p>
            </div>

            {/* Improve */}
            <div className="bg-card rounded-3xl p-10 border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Improve</h3>
              <p className="text-muted-foreground">
                Receive personalized recommendations tailored to your skin's needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SkinLight is for Everyone - Split Layout */}
      <section className="min-h-screen flex items-center px-4 py-20 relative overflow-hidden">
        {/* Background Image Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 grid-rows-5 h-full w-full gap-0">
            {faceImages.map((src, index) => (
              <div key={index} className="relative w-full h-full overflow-hidden">
                <Image
                  src={src}
                  alt={`Person ${index + 1}`}
                  fill
                  className="object-cover blur-sm"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Heading */}
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                SkinLight is for <span className="text-primary">Everyone</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our AI technology is designed to work with all skin types, tones, and conditions. 
                Everyone deserves personalized skin care.
              </p>
              <Button 
                onClick={handleGoogleSignIn}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg group"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Right - Feature Cards Stack */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-lg transform md:translate-x-8">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-xl mb-3">All Skin Types</h3>
                <p className="text-muted-foreground">
                  Trained on diverse skin types and tones for accurate analysis
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-xl mb-3">Privacy First</h3>
                <p className="text-muted-foreground">
                  Your data is encrypted and never shared with third parties
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-border shadow-lg transform md:translate-x-8">
                <Sparkles className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-xl mb-3">Easy to Use</h3>
                <p className="text-muted-foreground">
                  Simple, intuitive interface with powerful AI technology
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}