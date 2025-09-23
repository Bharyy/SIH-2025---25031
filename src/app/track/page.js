"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function TrackIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = () => {
    try {
      const storedIssues = localStorage.getItem('civicIssues');
      if (storedIssues) {
        const parsedIssues = JSON.parse(storedIssues);
        setIssues(parsedIssues);
      }
    } catch (error) {
      console.error('Error loading issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500';
      case 'ai_processing': return 'bg-purple-500';
      case 'worker_assigned': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return '📝';
      case 'ai_processing': return '🤖';
      case 'worker_assigned': return '👷';
      case 'resolved': return '✅';
      default: return '❓';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (id) => {
    const updatedIssues = issues.filter((issue) => issue.id !== id);
    setIssues(updatedIssues);
    localStorage.setItem('civicIssues', JSON.stringify(updatedIssues));
    toast.success('Issue deleted');
  };

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">Track Issues</h1>
              <p className="text-muted-foreground mt-1">
                View and track all your reported issues
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline">
                  🏠 Home
                </Button>
              </Link>
              <Link href="/report">
                <Button>
                  📝 Report New Issue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {issues.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-card-foreground">No Issues Found</CardTitle>
              <CardDescription className="text-center">
                You haven't reported any issues yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/report">
                <Button>Report Your First Issue</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Your Issues ({issues.length})
              </h2>
              <Button variant="outline" onClick={loadIssues}>
                🔄 Refresh
              </Button>
            </div>
            
            <div className="grid gap-4">
              {issues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(issue.status)}`}></div>
                          <h3 className="font-semibold text-lg text-card-foreground">
                            {issue.title}
                          </h3>
                          <span className="text-2xl">{getStatusIcon(issue.status)}</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-foreground">Status:</span>
                            <p className="text-muted-foreground capitalize">
                              {issue.status.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Priority:</span>
                            <p className="text-muted-foreground capitalize">
                              {issue.priority || 'Medium'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Reported:</span>
                            <p className="text-muted-foreground">
                              {formatDate(issue.submittedAt)}
                            </p>
                          </div>
                        </div>
                        {issue.location?.address && (
                          <div className="mt-3">
                            <span className="font-medium text-foreground text-sm">Location:</span>
                            <p className="text-muted-foreground text-sm">
                              {issue.location.address}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px] w-full md:w-auto md:ml-4">
                        <Link href={`/track/${issue.id}`}>
                          <Button size="sm" className="w-full md:w-auto mb-1">
                            View Details
                          </Button>
                        </Link>
                        <Button size="sm" variant="destructive" className="w-full md:w-auto" onClick={() => handleDelete(issue.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}