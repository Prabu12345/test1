import { Task } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EditTaskForm } from "./edit-task-form";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ description: "Task deleted successfully" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isComplete }: { id: number; isComplete: boolean }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { isComplete });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">{task.title}</CardTitle>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <EditTaskForm task={task} />
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(task.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
            <div className="text-sm text-muted-foreground mb-2">
              {task.gameType} • {task.eventType}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>
                Starts: {formatDistanceToNow(new Date(task.startDate), { addSuffix: true })}
              </span>
              <Button
                variant={task.isComplete ? "destructive" : "default"}
                size="sm"
                onClick={() => toggleMutation.mutate({ id: task.id, isComplete: !task.isComplete })}
                disabled={toggleMutation.isPending}
              >
                {task.isComplete ? (
                  <X className="mr-2 h-4 w-4" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {task.isComplete ? "Mark Incomplete" : "Mark Complete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}