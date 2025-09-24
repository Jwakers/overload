import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type DeleteDialogProps = {
  disabled?: boolean;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText: string;
  triggerTitle?: string;
  children?: React.ReactNode;
};

export function DeleteDialog({
  disabled = false,
  onConfirm,
  title,
  description,
  confirmButtonText,
  triggerTitle = "Delete",
  children,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            title={triggerTitle}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <Button variant="destructive" asChild>
            <AlertDialogAction onClick={handleConfirm}>
              {confirmButtonText}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
