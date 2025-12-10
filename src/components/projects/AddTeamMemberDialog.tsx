"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTeamMembers } from "@/hooks/useUsers";
import { useAddTeamMembers } from "@/hooks/useProjects";
import { toast } from "@/components/ui/use-toast";
import { getInitials } from "@/lib/utils";
import { IUser } from "@/types";

interface AddTeamMemberDialogProps {
  projectId: string;
  existingMemberIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeamMemberDialog({
  projectId,
  existingMemberIds,
  open,
  onOpenChange,
}: AddTeamMemberDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: allUsers, isLoading } = useTeamMembers();
  const addMembersMutation = useAddTeamMembers();

  const availableUsers =
    allUsers?.filter((u) => !existingMemberIds.includes(u._id)) || [];

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    try {
      await addMembersMutation.mutateAsync({ projectId, userIds: selectedIds });
      toast({
        title: "Members Added",
        description: `${selectedIds.length} member(s) added to project`,
      });
      setSelectedIds([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add members",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : availableUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            All available users are already in this project
          </p>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleUser(user._id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedIds.includes(user._id)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                  {selectedIds.includes(user._id) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={
                    selectedIds.length === 0 || addMembersMutation.isPending
                  }
                >
                  {addMembersMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Members
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
