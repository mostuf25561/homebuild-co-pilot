import { useStore } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReturnButton() {
  const stack = useStore((s) => s.return_stack);
  const popReturn = useStore((s) => s.popReturn);
  const navigate = useNavigate();
  if (stack.length === 0) return null;
  const top = stack[stack.length - 1];

  const onClick = () => {
    const entry = popReturn();
    if (!entry) return;
    // Use string route for flexibility (encoded with hash anchor for task)
    const url = entry.task_id ? `${entry.route}#task-${entry.task_id}` : entry.route;
    navigate({ to: url as never });
  };

  return (
    <div className="fixed bottom-4 start-4 z-40">
      <Button
        onClick={onClick}
        variant="default"
        size="lg"
        className="shadow-lg gap-2"
        title={`חזרה אל: ${top.label}`}
      >
        <Undo2 className="size-4" />
        חזור למשימה הקודמת
        <span className="text-xs opacity-75 max-w-[180px] truncate">· {top.label}</span>
      </Button>
    </div>
  );
}
