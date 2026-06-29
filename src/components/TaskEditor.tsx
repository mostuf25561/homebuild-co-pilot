import { useState } from "react";
import { useStore, type Task, type Priority, type Status } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { TaskColorPicker } from "./TaskColorPicker";
import { SubTaskAdder } from "./SubTaskAdder";

const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES: Status[] = ["Pending", "In_Progress", "DONE", "CANCELLED", "Flagged_Risk", "Delayed"];

export function TaskEditor({ task }: { task: Task }) {
  const updateTask = useStore((s) => s.updateTask);
  const recordAction = useStore((s) => s.recordAction);
  const allTasks = useStore((s) => s.tasks);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(task);

  const handleSave = () => {
    const changes: string[] = [];
    if (formData.Description !== task.Description) changes.push("תיאור");
    if (formData.Status !== task.Status) changes.push("סטטוס");
    if (formData.AI_Urgency_Level !== task.AI_Urgency_Level) changes.push("דחיפות");
    if (formData.parent_task_id !== task.parent_task_id) changes.push("משימת אב");

    updateTask(task.Task_ID, formData);
    if (changes.length > 0) {
      recordAction("update_task", `עדכון משימה ${task.Task_ID}: ${changes.join(", ")}`);
    }
    setOpen(false);
  };

  const parentCandidates = allTasks.filter((t) => t.Task_ID !== task.Task_ID);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs px-2"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-3" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>עריכת משימה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-xs">תיאור</Label>
              <Textarea
                value={formData.Description}
                onChange={(e) =>
                  setFormData({ ...formData, Description: e.target.value })
                }
                className="text-sm min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">סטטוס</Label>
                <Select value={formData.Status} onValueChange={(v) =>
                  setFormData({ ...formData, Status: v as Status })
                }>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">דחיפות</Label>
                <Select value={formData.AI_Urgency_Level} onValueChange={(v) =>
                  setFormData({ ...formData, AI_Urgency_Level: v as Priority })
                }>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">מועד הערכה</Label>
              <Input
                type="datetime-local"
                value={formData.Re_Evaluate_Timestamp.slice(0, 16)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Re_Evaluate_Timestamp: new Date(e.target.value).toISOString(),
                  })
                }
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs">צבע</Label>
              <div className="pt-1">
                <TaskColorPicker taskId={task.Task_ID} color={formData.color} />
              </div>
            </div>

            <div>
              <Label className="text-xs">משימת אב (לתת־משימות)</Label>
              <Select
                value={formData.parent_task_id ?? "__none__"}
                onValueChange={(v) =>
                  setFormData({ ...formData, parent_task_id: v === "__none__" ? undefined : v })
                }
              >
                <SelectTrigger className="h-8"><SelectValue placeholder="ללא" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">ללא משימת אב</SelectItem>
                  {parentCandidates.map((p) => (
                    <SelectItem key={p.Task_ID} value={p.Task_ID}>
                      {p.Description.slice(0, 40)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">תת־משימות</Label>
              <SubTaskAdder parentTask={task} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={handleSave}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
