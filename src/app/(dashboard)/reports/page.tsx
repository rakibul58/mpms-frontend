'use client';

import { useDashboardStats } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
} from '@/lib/constants';
import { formatHours } from '@/lib/utils';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights</p>
        </div>
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data available</h3>
            <p className="text-muted-foreground">Start creating projects to see reports</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTasks = stats.overview.totalTasks || 1;
  const totalProjects = stats.overview.totalProjects || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Analytics and insights for your workspace</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.overview.completedTasks / totalTasks) * 100)}%
            </div>
            <Progress
              value={(stats.overview.completedTasks / totalTasks) * 100}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.overview.completedTasks} of {stats.overview.totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">
              of {stats.overview.totalProjects} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(stats.overview.totalHoursLogged)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-2">active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tasks by Status
            </CardTitle>
            <CardDescription>Distribution of tasks across statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{TASK_STATUS_LABELS[status] || status}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <Progress value={(count / totalTasks) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tasks by Priority
            </CardTitle>
            <CardDescription>Distribution of tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
              <div key={priority} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{TASK_PRIORITY_LABELS[priority] || priority}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <Progress value={(count / totalTasks) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projects by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Projects by Status
            </CardTitle>
            <CardDescription>Current state of all projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.projectsByStatus).map(([status, count]) => (
              <div key={status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{PROJECT_STATUS_LABELS[status] || status}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <Progress value={(count / totalProjects) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Total Projects</span>
                <span className="font-medium">{stats.overview.totalProjects}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Active Projects</span>
                <span className="font-medium">{stats.overview.activeProjects}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Total Tasks</span>
                <span className="font-medium">{stats.overview.totalTasks}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Completed Tasks</span>
                <span className="font-medium">{stats.overview.completedTasks}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Team Members</span>
                <span className="font-medium">{stats.overview.totalUsers}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Hours Logged</span>
                <span className="font-medium">{formatHours(stats.overview.totalHoursLogged)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
