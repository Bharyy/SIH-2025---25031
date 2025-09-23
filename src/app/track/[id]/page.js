"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const USE_MOCK = true; // Set to false for production

// Mock issue data
const mockIssues = {
  "1": {
    id: "1",
    title: "Broken Streetlight on Main Street",
    description: "Streetlight has been flickering and completely went out last night",
    status: "worker_assigned",
    submittedAt: "2024-01-15T10:30:00Z",
    timeline: [
      {
        status: "submitted",
        timestamp: "2024-01-15T10:30:00Z",
        description: "Issue reported and submitted for review"
      },
      {
        status: "ai_processing",
        timestamp: "2024-01-15T10:32:00Z",
        description: "AI analysis completed - classified as infrastructure issue"
      },
      {
        status: "worker_assigned",
        timestamp: "2024-01-15T11:15:00Z",
        description: "Worker assigned to address the issue"
      }
    ],
    worker: {
      name: "John Smith",
      phone: "+1234567890",
      department: "Public Works"
    },
    location: {
      address: "123 Main Street, Downtown",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    }
  },
  "2": {
    id: "2",
    title: "Pothole on Oak Avenue",
    description: "Large pothole causing damage to vehicles",
    status: "resolved",
    submittedAt: "2024-01-14T14:20:00Z",
    timeline: [
      {
        status: "submitted",
        timestamp: "2024-01-14T14:20:00Z",
        description: "Issue reported and submitted for review"
      },
      {
        status: "ai_processing",
        timestamp: "2024-01-14T14:22:00Z",
        description: "AI analysis completed - classified as road maintenance issue"
      },
      {
        status: "worker_assigned",
        timestamp: "2024-01-14T15:00:00Z",
        description: "Worker assigned to address the issue"
      },
      {
        status: "resolved",
        timestamp: "2024-01-15T09:30:00Z",
        description: "Issue has been resolved and verified"
      }
    ],
    worker: {
      name: "Mike Johnson",
      phone: "+1234567891",
      department: "Road Maintenance"
    },
    location: {
      address: "456 Oak Avenue, Midtown",
      coordinates: { lat: 40.7589, lng: -73.9851 }
    }
  }
};

const statusConfig = {
  submitted: {
    label: "Submitted",
    description: "Issue has been reported and is under review",
    color: "bg-blue-500",
    icon: "📝"
  },
  ai_processing: {
    label: "AI Processing",
    description: "AI is analyzing the issue and determining priority",
    color: "bg-yellow-500",
    icon: "🤖"
  },
  worker_assigned: {
    label: "Worker Assigned",
    description: "A worker has been assigned to address this issue",
    color: "bg-orange-500",
    icon: "👷"
  },
  resolved: {
    label: "Resolved",
    description: "Issue has been successfully resolved",
    color: "bg-green-500",
    icon: "✅"
  }
};

export default function TrackIssue({ params }) {
  const resolvedParams = use(params);
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          // Load from localStorage instead of mock data
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const storedIssues = localStorage.getItem('civicIssues');
          if (!storedIssues) {
            throw new Error("No issues found in storage");
          }
          
          const issues = JSON.parse(storedIssues);
          const issueData = issues.find(issue => issue.id === resolvedParams.id);
          
          if (!issueData) {
            throw new Error("Issue not found");
          }
          setIssue(issueData);
        } else {
          // Real API call
          const response = await fetch(`/api/issues/${resolvedParams.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch issue: ${response.status}`);
          }
          const issueData = await response.json();
          setIssue(issueData);
        }
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError(err.message);
        toast.error(`Failed to load issue: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [resolvedParams.id]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIndex = (status) => {
    const statusOrder = ['submitted', 'ai_processing', 'worker_assigned', 'resolved'];
    return statusOrder.indexOf(status);
  };

  const openWhatsApp = (phone, message) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          <p className="text-muted-foreground">Loading issue details...</p>
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

  if (!issue) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Issue Not Found</CardTitle>
            <CardDescription className="text-muted-foreground">The requested issue could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-foreground">Issue Tracking</h1>
          <p className="text-muted-foreground mt-2">Track the progress of your reported issue</p>
        </div>

        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {statusConfig[issue.status]?.icon} {issue.title}
            </CardTitle>
            <CardDescription>
              Issue ID: #{issue.id} • Submitted: {formatDate(issue.submittedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Description</h3>
              <p className="text-muted-foreground mt-1">{issue.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground">Location</h3>
              <p className="text-muted-foreground mt-1">{issue.location.address}</p>
            </div>

            {/* Current Status */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusConfig[issue.status]?.color}`}></div>
                <div>
                  <p className="font-semibold text-foreground">
                    Current Status: {statusConfig[issue.status]?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {statusConfig[issue.status]?.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Timeline</CardTitle>
            <CardDescription>Track the progress of your issue through each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issue.timeline.map((event, index) => {
                const isLast = index === issue.timeline.length - 1;
                const isCompleted = getStatusIndex(event.status) <= getStatusIndex(issue.status);
                
                return (
                  <div key={index} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                        isCompleted ? statusConfig[event.status]?.color : 'bg-muted'
                      }`}>
                        {isCompleted ? statusConfig[event.status]?.icon : '⏳'}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-16 ${
                          isCompleted ? 'bg-muted-foreground' : 'bg-muted'
                        }`}></div>
                      )}
                    </div>
                    
                    {/* Event details */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {statusConfig[event.status]?.label}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">{event.message || event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Worker Information */}
        {issue.worker && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👷 Assigned Worker
              </CardTitle>
              <CardDescription>
                Contact information for the worker assigned to your issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Name</h3>
                  <p className="text-gray-600">{issue.worker.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Department</h3>
                  <p className="text-gray-600">{issue.worker.department}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => openWhatsApp(
                    issue.worker.phone,
                    `Hi ${issue.worker.name}, I'm following up on issue #${issue.id}: ${issue.title}`
                  )}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  💬 WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${issue.worker.phone}`)}
                >
                  📞 Call
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            ← Go Back
          </Button>
          <Button
            onClick={() => window.location.href = '/report'}
          >
            📝 Report New Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
