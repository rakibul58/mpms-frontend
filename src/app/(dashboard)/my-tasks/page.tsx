"use client";

import { useState } from "react";
import { useMyTasks, useUpdateTaskStatus } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Timer,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatRelativeTime, formatHours } from "@/lib/utils";
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from "@/lib/constants";
import { ITask, TaskStatus, TaskPriority } from "@/types";

function TaskCard({
  task,
  onStatusChange,
}: {
  task: ITask;
  onStatusChange: (status: TaskStatus) => void;
}) {
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Timer className="h-4 w-4 text-blue-500" />;
      case "review":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        isOverdue ? "border-red-200 dark:border-red-800" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => {
              const nextStatus: Record<TaskStatus, TaskStatus> = {
                todo: "in_progress",
                in_progress: "review",
                review: "done",
                done: "todo",
              };
              onStatusChange(nextStatus[task.status]);
            }}
            className="mt-0.5 hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.status)}
          </button>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-medium ${
                  task.status === "done"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.title}
              </h3>
              <Badge
                className={TASK_PRIORITY_COLORS[task.priority]}
                variant="outline"
              >
                {TASK_PRIORITY_LABELS[task.priority]}
              </Badge>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {typeof task.project === "object" && (
                <span className="bg-muted px-2 py-1 rounded">
                  {task.project.title}
                </span>
              )}

              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 ${
                    isOverdue ? "text-red-500" : ""
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.dueDate, "MMM dd")}</span>
                </div>
              )}

              {task.estimate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatHours(task.estimate)} est.</span>
                </div>
              )}

              {task.timeLogged > 0 && (
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  <span>{formatHours(task.timeLogged)} logged</span>
                </div>
              )}

              {task.subtasks.length > 0 && (
                <span>
                  {task.subtasks.filter((s) => s.isCompleted).length}/
                  {task.subtasks.length} subtasks
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyTasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch all tasks for counts (no status filter)
  const { data: allTasksData } = useMyTasks({
    // Only apply search and priority to counts, not status
    searchTerm: searchTerm || undefined,
    priority:
      priorityFilter !== "all" ? (priorityFilter as TaskPriority) : undefined,
  });

  // Fetch filtered tasks for display
  const { data: tasksData, isLoading } = useMyTasks({
    searchTerm: searchTerm || undefined,
    priority:
      priorityFilter !== "all" ? (priorityFilter as TaskPriority) : undefined,
    status: activeTab !== "all" ? (activeTab as TaskStatus) : undefined,
  });

  const updateStatusMutation = useUpdateTaskStatus();

  const tasks = tasksData?.data || [];
  const allTasks = allTasksData?.data || [];

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: taskId, status });
      toast({
        title: "Status Updated",
        description: `Task moved to ${TASK_STATUS_LABELS[status]}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status",
      });
    }
  };

  // Calculate counts from all tasks (respecting search/priority but not status)
  const taskCounts = {
    all: allTasks.length,
    todo: allTasks.filter((t) => t.status === "todo").length,
    in_progress: allTasks.filter((t) => t.status === "in_progress").length,
    review: allTasks.filter((t) => t.status === "review").length,
    done: allTasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground">
          Track and manage your assigned tasks
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(TASK_PRIORITY).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {TASK_PRIORITY_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({taskCounts.all})</TabsTrigger>
          <TabsTrigger value="todo">To Do ({taskCounts.todo})</TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({taskCounts.in_progress})
          </TabsTrigger>
          <TabsTrigger value="review">Review ({taskCounts.review})</TabsTrigger>
          <TabsTrigger value="done">Done ({taskCounts.done})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <TaskSkeleton key={i} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || priorityFilter !== "all"
                    ? "Try adjusting your filters"
                    : activeTab === "done"
                    ? "No completed tasks yet"
                    : "You're all caught up!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={(status) =>
                    handleStatusChange(task._id, status)
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
