"use client";

import { useAppSelector } from "@/store/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderKanban,
  CheckSquare,
  Users,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatDate, formatHours } from "@/lib/utils";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  USER_ROLES,
} from "@/lib/constants";
import Link from "next/link";
import { useDashboardStats, useMyReport } from "@/hooks";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`h-3 w-3 mr-1 ${
                trend.positive ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={`text-xs ${
                trend.positive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.positive ? "+" : "-"}
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdminOrManager =
    user?.role === (USER_ROLES.ADMIN as string) ||
    user?.role === (USER_ROLES.MANAGER as string);

  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: myReport, isLoading: reportLoading } = useMyReport();

  const isLoading = statsLoading || reportLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      {isAdminOrManager && dashboardStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Projects"
            value={dashboardStats.overview.totalProjects}
            description={`${dashboardStats.overview.activeProjects} active`}
            icon={FolderKanban}
          />
          <StatCard
            title="Total Tasks"
            value={dashboardStats.overview.totalTasks}
            description={`${dashboardStats.overview.completedTasks} completed`}
            icon={CheckSquare}
          />
          <StatCard
            title="Team Members"
            value={dashboardStats.overview.totalUsers}
            icon={Users}
          />
          <StatCard
            title="Hours Logged"
            value={formatHours(dashboardStats.overview.totalHoursLogged)}
            icon={Clock}
          />
        </div>
      )}

      {/* Member Stats */}
      {!isAdminOrManager && myReport && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Assigned Tasks"
            value={myReport.stats.assignedTasks}
            icon={CheckSquare}
          />
          <StatCard
            title="Completed"
            value={myReport.stats.completedTasks}
            description={`${myReport.stats.completionRate}% completion rate`}
            icon={TrendingUp}
          />
          <StatCard
            title="In Progress"
            value={myReport.stats.inProgressTasks}
            icon={Clock}
          />
          <StatCard
            title="Hours Logged"
            value={formatHours(myReport.stats.totalHoursLogged)}
            icon={Clock}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Projects */}
        {isAdminOrManager && dashboardStats && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest active projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardStats.recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects yet
                </p>
              ) : (
                dashboardStats.recentProjects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress
                            value={project.progress}
                            className="h-2 w-24"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(project.progress)}%
                          </span>
                        </div>
                      </div>
                      <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* My Projects (for members) */}
        {!isAdminOrManager && myReport && (
          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Projects you&apos;re working on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {myReport.tasksByProject.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects assigned
                </p>
              ) : (
                myReport.tasksByProject.map((project) => (
                  <Link
                    key={project.projectId}
                    href={`/projects/${project.projectId}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {project.projectTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {project.completedCount}/{project.taskCount} tasks
                          completed
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">
                          {project.taskCount > 0
                            ? Math.round(
                                (project.completedCount / project.taskCount) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Deadlines */}
        {isAdminOrManager && dashboardStats && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardStats.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming deadlines
                </p>
              ) : (
                dashboardStats.upcomingDeadlines.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.project.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={TASK_STATUS_COLORS[task.status]}>
                        {TASK_STATUS_LABELS[task.status]}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(task.dueDate, "MMM dd")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Task Distribution */}
        {isAdminOrManager && dashboardStats && (
          <Card>
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
              <CardDescription>Tasks by status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(dashboardStats.tasksByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={TASK_STATUS_COLORS[status]}>
                        {TASK_STATUS_LABELS[status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          dashboardStats.overview.totalTasks > 0
                            ? (count / dashboardStats.overview.totalTasks) * 100
                            : 0
                        }
                        className="h-2 w-24"
                      />
                      <span className="text-sm font-medium w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
