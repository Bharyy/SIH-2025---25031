"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const USE_MOCK = true; // Set to false for production

// Mock assigned issues data
const mockAssignedIssues = {
  "1234567890": [
    {
      id: "1",
      title: "Broken Streetlight on Main Street",
      description: "Streetlight has been flickering and completely went out last night. Located near the intersection with Oak Avenue.",
      status: "worker_assigned",
      priority: "high",
      submittedAt: "2024-01-15T10:30:00Z",
      assignedAt: "2024-01-15T11:15:00Z",
      location: {
        address: "123 Main Street, Downtown",
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      photo: "/api/placeholder/400/300", // Placeholder for demo
      reporter: {
        phone: "+1234567890",
        name: "John Doe"
      }
    },
    {
      id: "2",
      title: "Pothole on Oak Avenue",
      description: "Large pothole causing damage to vehicles. About 2 feet wide and 6 inches deep.",
      status: "worker_assigned",
      priority: "medium",
      submittedAt: "2024-01-14T14:20:00Z",
      assignedAt: "2024-01-14T15:00:00Z",
      location: {
        address: "456 Oak Avenue, Midtown",
        coordinates: { lat: 40.7589, lng: -73.9851 }
      },
      photo: "/api/placeholder/400/300",
      reporter: {
        phone: "+1234567891",
        name: "Jane Smith"
      }
    }
  ],
  "0987654321": [
    {
      id: "3",
      title: "Sidewalk Damage",
      description: "Cracked and uneven sidewalk creating tripping hazard. Needs immediate attention.",
      status: "worker_assigned",
      priority: "high",
      submittedAt: "2024-01-14T11:30:00Z",
      assignedAt: "2024-01-14T12:00:00Z",
      location: {
        address: "789 Pine Street, Uptown",
        coordinates: { lat: 40.7500, lng: -73.9900 }
      },
      photo: "/api/placeholder/400/300",
      reporter: {
        phone: "+1234567892",
        name: "Bob Johnson"
      }
    }
  ]
};

export default function WorkerDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);

  // Check if worker is already logged in
  useEffect(() => {
    const savedPhone = localStorage.getItem('workerPhone');
    if (savedPhone) {
      setPhoneNumber(savedPhone);
      setIsLoggedIn(true);
      loadAssignedIssues(savedPhone);
    }
  }, []);

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      // Store phone number in localStorage
      localStorage.setItem('workerPhone', phoneNumber);
      setIsLoggedIn(true);
      await loadAssignedIssues(phoneNumber);
      toast.success("Login successful!");
    } catch (err) {
      console.error('Login error:', err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('workerPhone');
    setIsLoggedIn(false);
    setPhoneNumber("");
    setAssignedIssues([]);
    toast.success("Logged out successfully");
  };

  const loadAssignedIssues = async (phone) => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const issues = mockAssignedIssues[phone] || [];
        setAssignedIssues(issues);
        
        if (issues.length === 0) {
          toast.info("No assigned issues found for this phone number");
        }
      } else {
        // Real API call
        const response = await fetch(`/api/workers/${phone}/issues`);
        if (!response.ok) {
          throw new Error(`Failed to fetch issues: ${response.status}`);
        }
        const data = await response.json();
        setAssignedIssues(data);
      }
    } catch (err) {
      console.error('Error loading assigned issues:', err);
      setError(err.message);
      toast.error(`Failed to load issues: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone, message) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const resolveIssue = async (issueId) => {
    try {
      setResolvingIssue(issueId);
      
      if (USE_MOCK) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state
        setAssignedIssues(prevIssues => 
          prevIssues.map(issue => 
            issue.id === issueId 
              ? { 
                  ...issue, 
                  status: 'resolved',
                  resolvedAt: new Date().toISOString()
                }
              : issue
          )
        );
        
        toast.success("Issue marked as resolved successfully!");
      } else {
        // Real API call
        const response = await fetch(`/api/workers/${phoneNumber}/issues/${issueId}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to resolve issue: ${response.status}`);
        }

        // Update local state with resolved issue
        setAssignedIssues(prevIssues => 
          prevIssues.map(issue => 
            issue.id === issueId 
              ? { 
                  ...issue, 
                  status: 'resolved',
                  resolvedAt: new Date().toISOString()
                }
              : issue
          )
        );
        
        toast.success("Issue marked as resolved successfully!");
      }
    } catch (err) {
      console.error('Error resolving issue:', err);
      toast.error(`Failed to resolve issue: ${err.message}`);
    } finally {
      setResolvingIssue(null);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center">Worker Login</CardTitle>
            <CardDescription className="text-center">
              Enter your phone number to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>
            
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Demo phone numbers: 1234567890, 0987654321
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Worker Dashboard</h1>
              <p className="text-muted-foreground">Assigned issues for {phoneNumber}</p>
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
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              <p className="text-muted-foreground">Loading assigned issues...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => loadAssignedIssues(phoneNumber)} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : assignedIssues.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Assigned Issues</CardTitle>
              <CardDescription>
                You don't have any assigned issues at the moment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => loadAssignedIssues(phoneNumber)} className="w-full">
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-foreground">{assignedIssues.length}</div>
                  <div className="text-sm text-muted-foreground">Total Assigned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-400">
                    {assignedIssues.filter(issue => issue.status === 'worker_assigned').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {assignedIssues.filter(issue => issue.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-400">
                    {assignedIssues.filter(issue => issue.priority === 'high' && issue.status !== 'resolved').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </CardContent>
              </Card>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Assigned Issues</h2>
              {assignedIssues.map((issue) => (
                <Card key={issue.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Issue ID: #{issue.id} • Assigned: {formatDate(issue.assignedAt)}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                        {issue.priority.toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Photo */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2">Photo</h3>
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-sm">Issue Photo</p>
                          <p className="text-xs">(Photo would be displayed here)</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 text-sm">{issue.description}</p>
                    </div>

                    {/* Location */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                      <p className="text-gray-600 text-sm">{issue.location.address}</p>
                    </div>

                    {/* Reporter Info */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Reporter</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">{issue.reporter.name}</p>
                          <p className="text-gray-500 text-xs">{issue.reporter.phone}</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openWhatsApp(
                            issue.reporter.phone,
                            `Hi ${issue.reporter.name}, I'm following up on issue #${issue.id}: ${issue.title}. I'm the assigned worker and would like to discuss the details.`
                          )}
                        >
                          💬 WhatsApp
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/track/${issue.id}`, '_blank')}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWhatsApp(
                            issue.reporter.phone,
                            `Hi ${issue.reporter.name}, I'm the worker assigned to issue #${issue.id}. I'm on my way to the location: ${issue.location.address}.`
                          )}
                        >
                          📍 Update Location
                        </Button>
                        {issue.status !== 'resolved' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => resolveIssue(issue.id)}
                            disabled={resolvingIssue === issue.id}
                          >
                            {resolvingIssue === issue.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                Resolving...
                              </>
                            ) : (
                              '✅ Mark as Resolved'
                            )}
                          </Button>
                        )}
                        {issue.status === 'resolved' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                            ✅ Resolved
                            {issue.resolvedAt && (
                              <span className="text-xs text-green-600">
                                {formatDate(issue.resolvedAt)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Worker Dashboard</span>
            {USE_MOCK && (
              <span className="text-blue-600">Mock data • Switch to production mode in code</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
