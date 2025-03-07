import { useQuery } from "@tanstack/react-query";
import { TaskList } from "@/components/task-list";
import { GanttChart } from "@/components/gantt-chart";
import { TaskForm } from "@/components/task-form";
import { Task } from "@shared/schema";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, logoutMutation } = useAuth();

  // Only fetch tasks if we have a user
  const { data: tasks, isLoading } = useQuery<Task[]>({ 
    queryKey: ["/api/tasks"],
    enabled: !!user, // Only run query if we have a user
  });

  // If we're loading or don't have a user, show loading state
  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Task Management
          </h1>
          <p className="text-muted-foreground mt-1">Welcome, {user?.username}</p>
        </div>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <TaskForm />
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <TaskList tasks={tasks || []} />
        </TabsContent>
        <TabsContent value="gantt">
          <GanttChart tasks={tasks || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}