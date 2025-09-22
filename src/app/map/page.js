"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const USE_MOCK = true; // Set to false for production

// Mock issue data for the map
const mockIssues = [
  {
    id: "1",
    title: "Broken Streetlight",
    description: "Streetlight flickering and went out",
    status: "submitted",
    submittedAt: "2024-01-15T10:30:00Z",
    priority: "medium",
    coordinates: [40.7128, -74.0060]
  },
  {
    id: "2", 
    title: "Pothole on Main Street",
    description: "Large pothole causing vehicle damage",
    status: "worker_assigned",
    submittedAt: "2024-01-14T14:20:00Z",
    priority: "high",
    worker: "John Smith",
    coordinates: [40.7130, -74.0050]
  },
  {
    id: "3",
    title: "Garbage Collection Issue", 
    description: "Garbage not collected for 3 days",
    status: "resolved",
    submittedAt: "2024-01-13T09:15:00Z",
    priority: "low",
    resolvedAt: "2024-01-15T16:30:00Z",
    coordinates: [40.7110, -74.0070]
  },
  {
    id: "4",
    title: "Broken Traffic Signal",
    description: "Traffic light stuck on red", 
    status: "submitted",
    submittedAt: "2024-01-15T08:45:00Z",
    priority: "high",
    coordinates: [40.7140, -74.0040]
  },
  {
    id: "5",
    title: "Sidewalk Damage",
    description: "Cracked and uneven sidewalk",
    status: "worker_assigned", 
    submittedAt: "2024-01-14T11:30:00Z",
    priority: "medium",
    worker: "Mike Johnson",
    coordinates: [40.7100, -74.0080]
  },
  {
    id: "6",
    title: "Street Cleaning",
    description: "Street needs cleaning after construction",
    status: "resolved",
    submittedAt: "2024-01-12T15:20:00Z", 
    priority: "low",
    resolvedAt: "2024-01-14T10:00:00Z",
    coordinates: [40.7150, -74.0030]
  }
];

// Status color mapping
const statusColors = {
  submitted: "#ef4444", // red
  worker_assigned: "#eab308", // yellow
  resolved: "#22c55e" // green
};

// Status icons
const statusIcons = {
  submitted: "🔴",
  worker_assigned: "🟡",
  resolved: "🟢"
};

export default function MapPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIssues(mockIssues);
        } else {
          // Real API call
          const response = await fetch('/api/issues/map');
          if (!response.ok) {
            throw new Error(`Failed to fetch issues: ${response.status}`);
          }
          const data = await response.json();
          setIssues(data);
        }
      } catch (err) {
        console.error('Error loading issues:', err);
        setError(err.message);
        toast.error(`Failed to load issues: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  useEffect(() => {
    // Load Leaflet CSS
    const loadLeafletCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    };

    // Load Leaflet JS
    const loadLeafletJS = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    // Load MarkerCluster CSS
    const loadMarkerClusterCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
      document.head.appendChild(link);
      
      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
      document.head.appendChild(link2);
    };

    // Load MarkerCluster JS
    const loadMarkerClusterJS = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        loadLeafletCSS();
        loadMarkerClusterCSS();
        await loadLeafletJS();
        await loadMarkerClusterJS();
        
        // Wait a bit for everything to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading map libraries:', error);
        setError('Failed to load map libraries');
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !issues.length) return;

    // Initialize map
    const map = window.L.map('map').setView([40.7128, -74.0060], 13);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create marker cluster group
    const markers = window.L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    // Add markers for each issue
    issues.forEach(issue => {
      // Create custom icon
      const customIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${statusColors[issue.status]};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
          ">
            ${statusIcons[issue.status]}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Create marker
      const marker = window.L.marker([issue.coordinates[0], issue.coordinates[1]], {
        icon: customIcon
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">${issue.title}</h3>
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">${issue.description}</p>
          <div style="margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 500;">Status:</span>
            <span style="
              font-size: 11px; 
              padding: 2px 6px; 
              border-radius: 4px; 
              color: white; 
              background-color: ${statusColors[issue.status]};
              margin-left: 4px;
            ">
              ${statusIcons[issue.status]} ${issue.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 500;">Priority:</span>
            <span style="font-size: 12px; color: #6b7280; margin-left: 4px;">${issue.priority.toUpperCase()}</span>
          </div>
          ${issue.worker ? `
            <div style="margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 500;">Worker:</span>
              <span style="font-size: 12px; color: #6b7280; margin-left: 4px;">${issue.worker}</span>
            </div>
          ` : ''}
          <div style="margin-bottom: 12px;">
            <span style="font-size: 12px; font-weight: 500;">Submitted:</span>
            <span style="font-size: 12px; color: #6b7280; margin-left: 4px;">${new Date(issue.submittedAt).toLocaleDateString()}</span>
          </div>
          <button 
            onclick="window.open('/track/${issue.id}', '_blank')"
            style="
              width: 100%; 
              padding: 8px 12px; 
              background-color: #3b82f6; 
              color: white; 
              border: none; 
              border-radius: 6px; 
              font-size: 12px; 
              cursor: pointer;
              font-weight: 500;
            "
            onmouseover="this.style.backgroundColor='#2563eb'"
            onmouseout="this.style.backgroundColor='#3b82f6'"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.addLayer(marker);
    });

    map.addLayer(markers);

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 15);
        },
        (error) => {
          // Keep default view
        }
      );
    }

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapLoaded, issues]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-muted-foreground">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Issues Map</h1>
              <p className="text-muted-foreground">Interactive map showing all reported issues</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                🏠 Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                ← Back
              </Button>
              <Button
                onClick={() => window.location.href = '/report'}
              >
                📝 Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-card-foreground">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Worker Assigned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-140px)] w-full">
        <div id="map" className="h-full w-full"></div>
      </div>

      {/* Stats */}
      <div className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium text-card-foreground">
                Total Issues: {issues.length}
              </span>
              <span className="text-red-600">
                Submitted: {issues.filter(i => i.status === 'submitted').length}
              </span>
              <span className="text-yellow-600">
                Assigned: {issues.filter(i => i.status === 'worker_assigned').length}
              </span>
              <span className="text-green-600">
                Resolved: {issues.filter(i => i.status === 'resolved').length}
              </span>
            </div>
            {USE_MOCK && (
              <span className="text-xs text-blue-600">
                Mock data • Switch to production mode in code
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}