import { Task } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { addDays, differenceInDays, startOfDay, format } from "date-fns";

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  if (tasks.length === 0) return null;

  // Find the earliest start date and latest end date
  const startDate = new Date(Math.min(...tasks.map(t => new Date(t.startDate).getTime())));
  const endDate = new Date(Math.max(...tasks.map(t => new Date(t.endDate).getTime())));

  // Calculate total days for the chart
  const totalDays = differenceInDays(endDate, startDate) + 1;

  // Generate array of dates for the header
  const dates = Array.from({ length: totalDays }, (_, i) => addDays(startDate, i));

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      "Tournament": "bg-purple-500",
      "Community Event": "bg-green-500",
      "Special Mission": "bg-yellow-500",
      "Season Start": "bg-blue-500",
      "Update Release": "bg-red-500",
    };
    return colors[eventType] || "bg-gray-500";
  };

  return (
    <Card className="p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900">
      <div className="min-w-[800px]">
        {/* Header with dates */}
        <div className="grid grid-cols-[200px_1fr] mb-4">
          <div className="font-bold text-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-l">Event</div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(40px, 1fr))` }}>
            {dates.map((date, i) => (
              <div key={i} className="text-center text-sm border-l py-2 bg-gray-100 dark:bg-gray-800 font-medium">
                {format(date, "MMM d, yyyy")}
              </div>
            ))}
          </div>
        </div>

        {/* Task bars */}
        <div className="space-y-2">
          {tasks.map((task) => {
            const taskStart = startOfDay(new Date(task.startDate));
            const taskEnd = startOfDay(new Date(task.endDate));
            const offset = differenceInDays(taskStart, startDate);
            const duration = differenceInDays(taskEnd, taskStart) + 1;

            return (
              <div key={task.id} className="grid grid-cols-[200px_1fr] items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <div className="px-4 py-2">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-gray-500">
                    {task.gameType} • {task.eventType}
                  </div>
                </div>
                <div className="grid relative" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(40px, 1fr))` }}>
                  <div
                    className={`absolute h-8 rounded-lg shadow-md transition-all duration-200 ${
                      getEventColor(task.eventType)
                    } ${task.isComplete ? "opacity-50" : "opacity-80"}`}
                    style={{
                      left: `${(offset / totalDays) * 100}%`,
                      width: `${(duration / totalDays) * 100}%`,
                      top: "4px",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium px-2 truncate">
                      {task.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}