"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";



const USE_MOCK = true; // Set to false for production

// Mock summary data
const mockSummaryData = {
  total: 156,
  pending: 23,
  resolved: 133,
  highPriority: 8,
  mediumPriority: 12,
  lowPriority: 3,
  lastUpdated: new Date().toISOString()
};

// Mock issues data
const mockIssues = [
  {
    id: "issue-1",
    title: "Broken Streetlight",
    description: "Streetlight flickering and went out near the park entrance. Needs immediate attention.",
    status: "submitted",
    category: "Infrastructure",
    priority: "high",
    submittedAt: "2024-01-20T10:30:00Z",
    location: {
      address: "123 Park Ave, New York, NY",
      latitude: 40.7128,
      longitude: -74.0060
    },
    photoUrl: "/placeholder-photo.jpg",
    reporter: { name: "Bob Smith", phone: "+15559876543" },
    assignedWorker: null
  },
  {
    id: "issue-2",
    title: "Pothole on Main Street",
    description: "Large pothole causing vehicle damage on Main Street near the intersection.",
    status: "worker_assigned",
    category: "Road Maintenance",
    priority: "high",
    submittedAt: "2024-01-19T14:20:00Z",
    location: {
      address: "456 Main St, New York, NY",
      latitude: 40.7200,
      longitude: -74.0100
    },
    photoUrl: "/placeholder-photo.jpg",
    reporter: { name: "Charlie Davis", phone: "+15551112233" },
    assignedWorker: { id: "worker-1", name: "Alice Johnson" }
  },
  {
    id: "issue-3",
    title: "Garbage Collection Issue",
    description: "Garbage not collected for 3 days in residential area.",
    status: "resolved",
    category: "Sanitation",
    priority: "medium",
    submittedAt: "2024-01-18T09:15:00Z",
    resolvedAt: "2024-01-20T16:30:00Z",
    location: {
      address: "789 Residential St, New York, NY",
      latitude: 40.7050,
      longitude: -74.0000
    },
    photoUrl: "/placeholder-photo.jpg",
    reporter: { name: "Diana Prince", phone: "+15554445566" },
    assignedWorker: { id: "worker-2", name: "Bob Williams" }
  },
  {
    id: "issue-4",
    title: "Broken Traffic Signal",
    description: "Traffic light stuck on red at busy intersection causing traffic jams.",
    status: "submitted",
    category: "Traffic",
    priority: "high",
    submittedAt: "2024-01-20T08:45:00Z",
    location: {
      address: "321 Traffic Ave, New York, NY",
      latitude: 40.7140,
      longitude: -74.0040
    },
    photoUrl: "/placeholder-photo.jpg",
    reporter: { name: "Eve Green", phone: "+15553334444" },
    assignedWorker: null
  },
  {
    id: "issue-5",
    title: "Sidewalk Damage",
    description: "Cracked and uneven sidewalk near school entrance.",
    status: "worker_assigned",
    category: "Infrastructure",
    priority: "medium",
    submittedAt: "2024-01-19T11:30:00Z",
    location: {
      address: "654 School St, New York, NY",
      latitude: 40.7100,
      longitude: -74.0080
    },
    photoUrl: "/placeholder-photo.jpg",
    reporter: { name: "Frank Hall", phone: "+15552223333" },
    assignedWorker: { id: "worker-1", name: "Alice Johnson" }
  }
];

// Mock workers data
const mockWorkers = [
  { id: "worker-1", name: "Alice Johnson", department: "Infrastructure", activeIssues: 2, resolvedToday: 3 },
  { id: "worker-2", name: "Bob Williams", department: "Sanitation", activeIssues: 1, resolvedToday: 5 },
  { id: "worker-3", name: "Charlie Brown", department: "Road Maintenance", activeIssues: 0, resolvedToday: 2 },
  { id: "worker-4", name: "Diana Smith", department: "Traffic", activeIssues: 1, resolvedToday: 4 }
];

// Mock analytics data
const mockAnalytics = {
  issuesPerDay: [
    { date: "2024-01-15", count: 12 },
    { date: "2024-01-16", count: 8 },
    { date: "2024-01-17", count: 15 },
    { date: "2024-01-18", count: 10 },
    { date: "2024-01-19", count: 18 },
    { date: "2024-01-20", count: 14 }
  ],
  resolutionTimes: [
    { category: "Infrastructure", avgHours: 24 },
    { category: "Road Maintenance", avgHours: 12 },
    { category: "Sanitation", avgHours: 8 },
    { category: "Traffic", avgHours: 6 }
  ]
};

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    worker: 'all',
    dateRange: 'all'
  });
  
  // Assignment states
  const [assigningIssue, setAssigningIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);

      if (USE_MOCK) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add some randomness to mock data to show updates
        const randomVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const updatedSummaryData = {
          ...mockSummaryData,
          total: mockSummaryData.total + randomVariation,
          pending: Math.max(0, mockSummaryData.pending + Math.floor(Math.random() * 3) - 1),
          resolved: Math.max(0, mockSummaryData.resolved + Math.floor(Math.random() * 3) - 1),
          lastUpdated: new Date().toISOString()
        };
        
        setSummaryData(updatedSummaryData);
        setIssues(mockIssues);
        setWorkers(mockWorkers);
        setAnalytics(mockAnalytics);
        setLastRefresh(new Date());
      } else {
        // Real API calls
        const adminToken = localStorage.getItem('adminToken');
        const headers = {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        };

        const [summaryResponse, issuesResponse, workersResponse, analyticsResponse] = await Promise.all([
          fetch('/api/admin/issues/summary', { headers }),
          fetch('/api/admin/issues', { headers }),
          fetch('/api/admin/workers/leaderboard', { headers }),
          fetch('/api/admin/analytics', { headers })
        ]);

        if (!summaryResponse.ok) throw new Error(`Failed to fetch summary: ${summaryResponse.status}`);
        if (!issuesResponse.ok) throw new Error(`Failed to fetch issues: ${issuesResponse.status}`);
        if (!workersResponse.ok) throw new Error(`Failed to fetch workers: ${workersResponse.status}`);
        if (!analyticsResponse.ok) throw new Error(`Failed to fetch analytics: ${analyticsResponse.status}`);

        const [summaryData, issuesData, workersData, analyticsData] = await Promise.all([
          summaryResponse.json(),
          issuesResponse.json(),
          workersResponse.json(),
          analyticsResponse.json()
        ]);

        setSummaryData(summaryData);
        setIssues(issuesData);
        setWorkers(workersData);
        setAnalytics(analyticsData);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Worker assignment function
  const assignWorker = async (issueId, workerId) => {
    try {
      setAssigningIssue(issueId);
      
      if (USE_MOCK) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state
        setIssues(prevIssues => 
          prevIssues.map(issue => 
            issue.id === issueId 
              ? { 
                  ...issue, 
                  status: 'worker_assigned',
                  assignedWorker: workers.find(w => w.id === workerId)
                }
              : issue
          )
        );
        
        toast.success("Worker assigned successfully!");
      } else {
        // Real API call
        const adminToken = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/issues/${issueId}/assign/${workerId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to assign worker: ${response.status}`);
        }

        // Refresh data
        fetchDashboardData();
        toast.success("Worker assigned successfully!");
      }
    } catch (err) {
      console.error('Error assigning worker:', err);
      toast.error(`Failed to assign worker: ${err.message}`);
    } finally {
      setAssigningIssue(null);
      setSelectedWorker('');
    }
  };

  // Filter issues based on current filters
  const filteredIssues = issues.filter(issue => {
    if (filters.status !== 'all' && issue.status !== filters.status) return false;
    if (filters.category !== 'all' && issue.category !== filters.category) return false;
    if (filters.worker !== 'all') {
      if (filters.worker === 'unassigned' && issue.assignedWorker) return false;
      if (filters.worker !== 'unassigned' && issue.assignedWorker?.id !== filters.worker) return false;
    }
    return true;
  });

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem('isAdmin');
    const adminToken = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (isAdmin !== 'true' && !adminToken) {
      router.push('/admin/login');
      return;
    }

    if (userData) {
      setAdminUser(JSON.parse(userData));
    }

    // Fetch initial data
    fetchDashboardData();
  }, [router]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success("Logged out successfully");
    router.push('/admin/login');
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
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
              <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {adminUser.username}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                ← Home
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
        <div className="space-y-6">
          {/* Header with Refresh Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Issue Summary</h2>
              <p className="text-sm text-muted-foreground">
                {lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                  Refreshing...
                </>
              ) : (
                '🔄 Refresh'
              )}
            </Button>
          </div>

          {/* Issue Counters */}
          {loading && !summaryData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchDashboardData} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : summaryData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Issues */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                      <p className="text-3xl font-bold text-foreground">{summaryData.total}</p>
                    </div>
                    <div className="text-3xl">📊</div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Issues */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold text-orange-400">{summaryData.pending}</p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>
                </CardContent>
              </Card>

              {/* Resolved Issues */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-green-400">{summaryData.resolved}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Priority Breakdown */}
          {summaryData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Priority</p>
                      <p className="text-2xl font-bold text-red-600">{summaryData.highPriority}</p>
                    </div>
                    <div className="text-2xl">🔴</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                      <p className="text-2xl font-bold text-yellow-600">{summaryData.mediumPriority}</p>
                    </div>
                    <div className="text-2xl">🟡</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Low Priority</p>
                      <p className="text-2xl font-bold text-green-600">{summaryData.lowPriority}</p>
                    </div>
                    <div className="text-2xl">🟢</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
              <CardDescription>
                Welcome to the admin dashboard with real-time issue tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Admin Information</h3>
                  <p className="text-sm text-gray-600">Username: {adminUser?.username}</p>
                  <p className="text-sm text-gray-600">
                    Login Time: {adminUser ? new Date(adminUser.loginTime).toLocaleString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">System Status</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Auto-refresh: Every 15 seconds</li>
                    <li>• Real-time data: {USE_MOCK ? 'Mock data' : 'Live API'}</li>
                    <li>• Last update: {lastRefresh ? lastRefresh.toLocaleString() : 'Never'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-medium">Analytics</h3>
                <p className="text-sm text-gray-600">View system analytics</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">👷</div>
                <h3 className="font-medium">Workers</h3>
                <p className="text-sm text-gray-600">Manage workers</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-medium">Issues</h3>
                <p className="text-sm text-gray-600">Manage issues</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="font-medium">Settings</h3>
                <p className="text-sm text-gray-600">System settings</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Filters</CardTitle>
              <CardDescription>Filter issues by status, category, worker, or date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="worker_assigned">Worker Assigned</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="all">All Categories</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Road Maintenance">Road Maintenance</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Traffic">Traffic</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Worker</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    value={filters.worker}
                    onChange={(e) => setFilters(prev => ({ ...prev, worker: e.target.value }))}
                  >
                    <option value="all">All Workers</option>
                    <option value="unassigned">Unassigned</option>
                    {workers.map(worker => (
                      <option key={worker.id} value={worker.id}>{worker.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>Issues ({filteredIssues.length})</CardTitle>
              <CardDescription>Manage and assign issues to workers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{issue.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                            issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.priority.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            issue.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            issue.status === 'worker_assigned' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{issue.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Location:</span>
                            <p className="text-gray-600">{issue.location.address}</p>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <p className="text-gray-600">{issue.category}</p>
                          </div>
                          <div>
                            <span className="font-medium">Reporter:</span>
                            <p className="text-gray-600">{issue.reporter.name}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className="font-medium">Photo:</span>
                          <div className="w-24 h-16 bg-gray-200 rounded mt-1 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">📷</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        {issue.assignedWorker ? (
                          <div className="text-sm">
                            <span className="font-medium">Assigned to:</span>
                            <p className="text-gray-600">{issue.assignedWorker.name}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <select 
                              className="p-2 border border-gray-300 rounded-md text-sm"
                              value={selectedWorker}
                              onChange={(e) => setSelectedWorker(e.target.value)}
                            >
                              <option value="">Select Worker</option>
                              {workers.map(worker => (
                                <option key={worker.id} value={worker.id}>{worker.name}</option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              onClick={() => assignWorker(issue.id, selectedWorker)}
                              disabled={!selectedWorker || assigningIssue === issue.id}
                            >
                              {assigningIssue === issue.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                  Assigning...
                                </>
                              ) : (
                                'Assign Worker'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Worker Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Leaderboard</CardTitle>
              <CardDescription>Top performing workers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workers.map((worker, index) => (
                  <div key={worker.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{worker.name}</h3>
                        <p className="text-sm text-gray-600">{worker.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{worker.resolvedToday} resolved today</p>
                      <p className="text-sm text-gray-600">{worker.activeIssues} active issues</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Charts */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issues Per Day</CardTitle>
                  <CardDescription>Daily issue submission trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.issuesPerDay.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(day.count / 20) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{day.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Resolution Times</CardTitle>
                  <CardDescription>Resolution time by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.resolutionTimes.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(item.avgHours / 30) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">{item.avgHours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
