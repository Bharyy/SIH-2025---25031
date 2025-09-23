"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const USE_MOCK = true; // Set to false for production

export default function Report() {
  const [formData, setFormData] = useState({
    photo: null,
    phoneNumber: "",
    description: "",
    location: null,
    manualLocation: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);
    setLocationError(null);

    // Check if we're on HTTPS or localhost
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setLocationError("Location access requires HTTPS. Please use localhost or deploy with HTTPS.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        }));
        setIsLoading(false);
        toast.success("Location captured successfully!");
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your GPS settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        setLocationError(errorMessage);
        setIsLoading(false);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Don't use cached location
      }
    );
  };

  const handlePhotoChange = (event, source) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB.");
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
      toast.success(`Photo selected from ${source}`);
    }
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitReport = async () => {
    if (!formData.photo) {
      toast.error("Please select a photo.");
      return;
    }

    if (!formData.location && !formData.manualLocation.trim()) {
      toast.error("Please capture your location or enter it manually.");
      return;
    }

    setIsLoading(true);

    try {
      if (USE_MOCK) {
        // Save to localStorage with proper structure for issue tracking
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        const issueId = `issue_${Date.now()}`;
        const currentTimestamp = new Date().toISOString();
        
        // Generate title from description (first 50 chars)
        const title = formData.description.trim() 
          ? formData.description.substring(0, 50) + (formData.description.length > 50 ? '...' : '')
          : 'Civic Issue Report';
        
        const newIssue = {
          id: issueId,
          title: title,
          description: formData.description || 'No description provided',
          status: 'submitted',
          priority: 'medium',
          submittedAt: currentTimestamp,
          location: {
            address: formData.manualLocation || 'Location captured',
            coordinates: formData.location ? {
              lat: formData.location.latitude,
              lng: formData.location.longitude,
              accuracy: formData.location.accuracy
            } : null
          },
          reporter: {
            phone: formData.phoneNumber || 'Anonymous',
            name: 'Reporter'
          },
          photo: formData.photo ? formData.photo.name : null,
          assignedWorker: null,
          timeline: [
            {
              status: 'submitted',
              timestamp: currentTimestamp,
              message: 'Issue submitted by citizen',
              user: 'System'
            }
          ]
        };
        
        // Save to civicIssues instead of civicReports
        const existingIssues = JSON.parse(localStorage.getItem('civicIssues') || '[]');
        existingIssues.push(newIssue);
        localStorage.setItem('civicIssues', JSON.stringify(existingIssues));
        
        toast.success("Report submitted successfully!");
        setFormData({ photo: null, phoneNumber: "", description: "", location: null, manualLocation: "" });
        setRetryCount(0);
      } else {
        // Real API submission
        const formDataToSend = new FormData();
        formDataToSend.append('photo', formData.photo);
        formDataToSend.append('phoneNumber', formData.phoneNumber);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('latitude', formData.location.latitude);
        formDataToSend.append('longitude', formData.location.longitude);
        formDataToSend.append('accuracy', formData.location.accuracy);

        const response = await fetch('/webhook/simple-issue', {
          method: 'POST',
          body: formDataToSend
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        toast.success("Report submitted successfully!");
        setFormData({ photo: null, phoneNumber: "", description: "", location: null, manualLocation: "" });
        setRetryCount(0);
      }
    } catch (error) {
      console.error('Submission error:', error);
      
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        toast.error(`Submission failed. Retrying... (${retryCount + 1}/3)`);
        
        // Retry after 2 seconds
        setTimeout(() => {
          submitReport();
        }, 2000);
      } else {
        toast.error("Failed to submit report after 3 attempts. Please try again later.");
        setRetryCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {/* Header with Home Button */}
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="mb-4"
          >
            🏠 Home
          </Button>
          <h1 className="text-4xl font-bold text-center">Report Issue</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Submit a Report</CardTitle>
            <CardDescription>
              Report civic issues with photo and location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Photo *</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isLoading}
                >
                  📷 Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  📁 File
                </Button>
              </div>
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoChange(e, 'camera')}
                className="hidden"
                multiple={false}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'file')}
                className="hidden"
              />
              
              {formData.photo && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">✓ Photo selected: {formData.photo.name}</p>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Location *</label>
              <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="w-full"
              >
                📍 {isLoading ? "Getting Location..." : "Capture Location"}
              </Button>
              
              {formData.location && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-600">
                    ✓ Location captured: {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Accuracy: ±{Math.round(formData.location.accuracy)}m
                  </p>
                </div>
              )}
              
              {locationError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">⚠️ {locationError}</p>
                </div>
              )}

              {/* Manual Location Fallback */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Or enter location manually:</label>
                <Input
                  type="text"
                  placeholder="e.g., 123 Main St, City, State"
                  value={formData.manualLocation}
                  onChange={(e) => handleInputChange('manualLocation', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Use this if GPS location capture fails
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number (Optional)</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={4}
                placeholder="Describe the issue..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitReport}
              disabled={isLoading || !formData.photo || (!formData.location && !formData.manualLocation.trim())}
              className="w-full"
            >
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>

            {retryCount > 0 && (
              <p className="text-sm text-orange-600 text-center">
                Retry attempt {retryCount}/3
              </p>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            This page works offline once cached
          </p>
          {USE_MOCK && (
            <p className="text-xs text-blue-600 mt-2">
              Mock mode: Reports saved locally
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
