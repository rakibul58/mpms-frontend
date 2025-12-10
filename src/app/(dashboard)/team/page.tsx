'use client';

import { useState } from 'react';
import { useUsers, useTeamMembers } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Users, Mail } from 'lucide-react';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { USER_ROLES, USER_ROLE_LABELS } from '@/lib/constants';
import { IUser, UserRole } from '@/types';

function TeamMemberCard({ member }: { member: IUser }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{member.name}</h3>
              {!member.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {member.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {USER_ROLE_LABELS[member.role]}
              </Badge>
              {member.department && (
                <Badge variant="secondary" className="text-xs">
                  {member.department}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {member.skills.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{member.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamMemberSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: usersData, isLoading } = useUsers({
    searchTerm: searchTerm || undefined,
    role: roleFilter !== 'all' ? (roleFilter as UserRole) : undefined,
  });

  const members = usersData?.data || [];

  // Count by role
  const roleCounts = {
    all: members.length,
    admin: members.filter((m) => (m.role as string) === 'admin').length,
    manager: members.filter((m) => m.role === 'manager').length,
    member: members.filter((m) => m.role === 'member').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Manage your team members</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.admin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.manager}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.member}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(USER_ROLES).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {USER_ROLE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <TeamMemberSkeleton key={i} />
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members found</h3>
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No team members available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <TeamMemberCard key={member._id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
