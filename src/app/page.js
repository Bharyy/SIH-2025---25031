
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import Globe with no SSR to prevent hydration issues
const Globe = dynamic(() => import("@/components/ui/globe"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-background" />
  ),
});

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure component is mounted
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Globe Background */}
      {isLoaded && <Globe />}
      
      {/* Content overlay - positioned over the globe */}
      <div className="relative z-50 min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:p-8">
        {/* Title */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-b from-white to-gray-300/80 bg-clip-text text-transparent mb-4 break-words">
            Civic App
          </h1>
          <p className="text-center text-sm sm:text-base md:text-lg font-normal text-neutral-200 max-w-xs sm:max-w-md mx-auto">
            Report issues, track progress, and help build better communities.
          </p>
        </div>
        
        {/* Welcome Card
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-border/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-card-foreground text-center">Welcome to Civic App</CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              This is a sample card component from shadcn/ui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              You can use this card to display information, forms, or any other content.
            </p>
          </CardContent>
        </Card> */}

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-md">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center w-full">
            <Link href="/report" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full bg-card/90 backdrop-blur-sm border-border/50 hover:bg-accent/80">
                📝 Report Issue
              </Button>
            </Link>
            <Link href="/track" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full bg-card/90 backdrop-blur-sm border-border/50 hover:bg-accent/80">
                🔍 Track Issues
              </Button>
            </Link>
          </div>
          <div className="text-center space-y-2 w-full">
            <Link href="/map">
              <Button variant="outline" className="w-full bg-card/90 backdrop-blur-sm border-border/50 hover:bg-accent/80">
                🗺️ View Issues Map
              </Button>
            </Link>
            <Link href="/worker/dashboard">
              <Button variant="outline" className="w-full bg-card/90 backdrop-blur-sm border-border/50 hover:bg-accent/80">
                👷 Worker Dashboard
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" className="w-full bg-card/90 backdrop-blur-sm border-border/50 hover:bg-accent/80">
                🔐 Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



