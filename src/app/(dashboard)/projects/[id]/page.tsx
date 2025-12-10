"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Loader2,
  FolderKanban,
  CheckSquare,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProject, useDeleteProject } from "@/hooks/useProjects";
import { useAllSprintsByProject } from "@/hooks/useSprints";
import { useKanbanTasks } from "@/hooks/useTasks";
import { useAppSelector } from "@/store/hooks";
import { toast } from "@/components/ui/use-toast";
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  SPRINT_STATUS_COLORS,
  SPRINT_STATUS_LABELS,
  TASK_STATUS_LABELS,
  USER_ROLES,
} from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { ITask } from "@/types";

import {
  CreateTaskDialog,
  CreateSprintDialog,
  AddTeamMemberDialog,
  EditProjectDialog,
} from "@/components/projects";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user } = useAppSelector((state) => state.auth);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<string | undefined>(
    undefined
  );

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: sprints, isLoading: sprintsLoading } =
    useAllSprintsByProject(projectId);
  const { data: kanbanTasks, isLoading: tasksLoading } = useKanbanTasks(
    projectId,
    selectedSprintId
  );
  const deleteProjectMutation = useDeleteProject();

  const isAdminOrManager =
    user?.role === (USER_ROLES.ADMIN as string) ||
    user?.role === (USER_ROLES.MANAGER as string);

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      toast({
        title: "Project Deleted",
        description: "Project has been deleted successfully",
      });
      router.push("/projects");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete project",
      });
    }
  };

  // Calculate stats
  const totalTasks = kanbanTasks
    ? kanbanTasks.todo.length +
      kanbanTasks.in_progress.length +
      kanbanTasks.review.length +
      kanbanTasks.done.length
    : 0;
  const completedTasks = kanbanTasks?.done.length || 0;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="text-muted-foreground mt-2">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.title}
            </h1>
            <Badge className={PROJECT_STATUS_COLORS[project.status]}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground ml-10">{project.client}</p>
        </div>

        {isAdminOrManager && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditProjectOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress}%</div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sprints</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sprints?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {sprints?.filter((s) => s.status === "active").length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.teamMembers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">members assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.budget ? `$${project.budget.toLocaleString()}` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">allocated budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Description
                    </h4>
                    <p className="mt-1">{project.description}</p>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Start Date
                    </h4>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(project.startDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      End Date
                    </h4>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {project.endDate
                        ? format(new Date(project.endDate), "MMM d, yyyy")
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Created By
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.createdBy?.avatar} />
                      <AvatarFallback>
                        {getInitials(project.createdBy?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{project.createdBy?.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">To Do</span>
                      <Badge variant="secondary">
                        {kanbanTasks?.todo.length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">In Progress</span>
                      <Badge variant="secondary">
                        {kanbanTasks?.in_progress.length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Review</span>
                      <Badge variant="secondary">
                        {kanbanTasks?.review.length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Done</span>
                      <Badge variant="secondary">
                        {kanbanTasks?.done.length || 0}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Filter by Sprint:
              </span>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={selectedSprintId || ""}
                onChange={(e) =>
                  setSelectedSprintId(e.target.value || undefined)
                }
              >
                <option value="">All Sprints</option>
                {sprints?.map((sprint) => (
                  <option key={sprint._id} value={sprint._id}>
                    {sprint.title}
                  </option>
                ))}
              </select>
            </div>
            {isAdminOrManager && (
              <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>

          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              {(["todo", "in_progress", "review", "done"] as const).map(
                (status) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {TASK_STATUS_LABELS[status]}
                      </h3>
                      <Badge variant="outline">
                        {kanbanTasks?.[status]?.length || 0}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {kanbanTasks?.[status]?.map((task: ITask) => (
                        <Card
                          key={task._id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm">
                              {task.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                              {task.assignees?.length > 0 && (
                                <div className="flex -space-x-2">
                                  {task.assignees
                                    .slice(0, 2)
                                    .map((assignee) => (
                                      <Avatar
                                        key={assignee._id}
                                        className="h-5 w-5 border-2 border-background"
                                      >
                                        <AvatarFallback className="text-xs">
                                          {getInitials(assignee.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </TabsContent>

        {/* Sprints Tab */}
        <TabsContent value="sprints" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Project Sprints</h3>
            {isAdminOrManager && (
              <Button size="sm" onClick={() => setCreateSprintOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sprint
              </Button>
            )}
          </div>

          {sprintsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sprints && sprints.length > 0 ? (
            <div className="space-y-3">
              {sprints.map((sprint) => (
                <Card key={sprint._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{sprint.title}</h4>
                          <Badge
                            className={SPRINT_STATUS_COLORS[sprint.status]}
                          >
                            {SPRINT_STATUS_LABELS[sprint.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sprint #{sprint.sprintNumber}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(sprint.startDate), "MMM d")} -{" "}
                          {format(new Date(sprint.endDate), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    {sprint.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {sprint.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No sprints yet. Create your first sprint to start organizing
                tasks.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Team Members</h3>
            {isAdminOrManager && (
              <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Managers */}
            {project.managers?.map((manager) => (
              <Card key={manager._id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={manager.avatar} />
                      <AvatarFallback>
                        {getInitials(manager.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{manager.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {manager.email}
                      </p>
                    </div>
                    <Badge>Manager</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Team Members */}
            {project.teamMembers?.map((member) => (
              <Card key={member._id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                    <Badge variant="outline">Member</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!project.managers?.length && !project.teamMembers?.length && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No team members assigned yet.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{project.title}&quot;? This
              action cannot be undone. All sprints and tasks associated with
              this project will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={project}
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        projectId={projectId}
        sprints={sprints}
        teamMembers={[
          ...(project.managers || []),
          ...(project.teamMembers || []),
        ]}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />

      {/* Create Sprint Dialog */}
      <CreateSprintDialog
        projectId={projectId}
        open={createSprintOpen}
        onOpenChange={setCreateSprintOpen}
      />

      {/* Add Team Member Dialog */}
      <AddTeamMemberDialog
        projectId={projectId}
        existingMemberIds={[
          ...(project.managers?.map((m) => m._id) || []),
          ...(project.teamMembers?.map((m) => m._id) || []),
        ]}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />
    </div>
  );
}
