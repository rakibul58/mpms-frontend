"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAllSprintsByProject,
  useCreateSprint,
  useUpdateSprint,
  useDeleteSprint,
} from "@/hooks/useSprints";
import { useProjects } from "@/hooks/useProjects";
import { useAppSelector } from "@/store/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Target,
  MoreVertical,
  PlayCircle,
  CheckCircle,
  Clock,
  FolderKanban,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  SPRINT_STATUS,
  SPRINT_STATUS_LABELS,
  SPRINT_STATUS_COLORS,
  USER_ROLES,
} from "@/lib/constants";
import { ISprint } from "@/types";

function SprintCard({
  sprint,
  onEdit,
  onDelete,
}: {
  sprint: ISprint;
  onEdit: (sprint: ISprint) => void;
  onDelete: (sprint: ISprint) => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <PlayCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge className={SPRINT_STATUS_COLORS[sprint.status]}>
              {getStatusIcon(sprint.status)}
              <span className="ml-1">
                {SPRINT_STATUS_LABELS[sprint.status]}
              </span>
            </Badge>
            <span className="text-xs text-muted-foreground">
              Sprint #{sprint.sprintNumber}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(sprint)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Sprint
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(sprint)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Sprint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-lg font-semibold mb-2">{sprint.title}</h3>

        {sprint.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {sprint.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
          </span>
        </div>

        {sprint.goals && sprint.goals.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                GOALS
              </span>
            </div>
            <ul className="space-y-1">
              {sprint.goals.slice(0, 3).map((goal, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="flex-1">{goal}</span>
                </li>
              ))}
              {sprint.goals.length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{sprint.goals.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SprintDialog({
  isOpen,
  onClose,
  onSubmit,
  projects,
  editingSprint,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  projects: any[];
  editingSprint: ISprint | null;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "planned",
    goals: "",
  });

  useState(() => {
    if (editingSprint) {
      setFormData({
        title: editingSprint.title,
        projectId:
          typeof editingSprint.project === "string"
            ? editingSprint.project
            : editingSprint.project._id,
        description: editingSprint.description || "",
        startDate: editingSprint.startDate.split("T")[0],
        endDate: editingSprint.endDate.split("T")[0],
        status: editingSprint.status,
        goals: editingSprint.goals?.join(", ") || "",
      });
    } else {
      setFormData({
        title: "",
        projectId: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "planned",
        goals: "",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      goals: formData.goals
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSprint ? "Edit Sprint" : "Create New Sprint"}
          </DialogTitle>
          <DialogDescription>
            {editingSprint
              ? "Update sprint details and goals"
              : "Add a new sprint to your project"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) =>
                setFormData({ ...formData, projectId: value })
              }
              disabled={!!editingSprint}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Sprint Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Sprint 1 - Foundation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of sprint objectives"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SPRINT_STATUS).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {SPRINT_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Sprint Goals</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) =>
                setFormData({ ...formData, goals: e.target.value })
              }
              placeholder="Goal 1, Goal 2, Goal 3"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Separate goals with commas
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : editingSprint
                ? "Update Sprint"
                : "Create Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SprintsManagementPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isAdminOrManager =
    user?.role === (USER_ROLES.ADMIN as string) ||
    user?.role === USER_ROLES.MANAGER;

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<ISprint | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<ISprint | null>(null);

  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: sprints, isLoading: sprintsLoading } =
    useAllSprintsByProject(selectedProjectId);

  const createSprintMutation = useCreateSprint();
  const updateSprintMutation = useUpdateSprint();
  const deleteSprintMutation = useDeleteSprint();

  const projects = projectsData?.data || [];

  const handleCreateEdit = async (data: any) => {
    try {
      if (editingSprint) {
        await updateSprintMutation.mutateAsync({
          id: editingSprint._id,
          data,
        });
        toast({
          title: "Sprint Updated",
          description: "Sprint has been updated successfully",
        });
      } else {
        await createSprintMutation.mutateAsync(data);
        toast({
          title: "Sprint Created",
          description: "Sprint has been created successfully",
        });
      }
      setDialogOpen(false);
      setEditingSprint(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleDelete = async () => {
    if (!sprintToDelete) return;

    try {
      await deleteSprintMutation.mutateAsync({
        id: sprintToDelete._id,
        projectId: selectedProjectId,
      });
      toast({
        title: "Sprint Deleted",
        description: "Sprint has been deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSprintToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete sprint",
      });
    }
  };

  const openEditDialog = (sprint: ISprint) => {
    setEditingSprint(sprint);
    setDialogOpen(true);
  };

  const openDeleteDialog = (sprint: ISprint) => {
    setSprintToDelete(sprint);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sprint Management
          </h1>
          <p className="text-muted-foreground">
            Manage sprints across all projects
          </p>
        </div>
        {isAdminOrManager && (
          <Button
            onClick={() => {
              setEditingSprint(null);
              setDialogOpen(true);
            }}
            disabled={!selectedProjectId}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sprint
          </Button>
        )}
      </div>

      {/* Project Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>
            Choose a project to view and manage its sprints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projectsLoading ? (
                <div className="p-2 text-sm text-muted-foreground">
                  Loading projects...
                </div>
              ) : (
                projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sprints List */}
      {selectedProjectId ? (
        sprintsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sprints && sprints.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sprints.map((sprint) => (
              <SprintCard
                key={sprint._id}
                sprint={sprint}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sprints yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first sprint for this project
              </p>
              {isAdminOrManager && (
                <Button
                  onClick={() => {
                    setEditingSprint(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sprint
                </Button>
              )}
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Select a project to view sprints
            </h3>
            <p className="text-muted-foreground">
              Choose a project from the dropdown above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <SprintDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSprint(null);
        }}
        onSubmit={handleCreateEdit}
        projects={projects}
        editingSprint={editingSprint}
        isLoading={
          createSprintMutation.isPending || updateSprintMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sprint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{sprintToDelete?.title}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
