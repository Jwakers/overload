import { Trash2 } from "lucide-react";
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
} from "./alert-dialog";
import { Button } from "./button";

interface DeleteDialogProps {
  disabled?: boolean;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText: string;
  triggerTitle?: string;
  triggerSize?: "sm" | "default" | "lg";
  triggerVariant?: "ghost" | "outline" | "destructive";
  children?: React.ReactNode;
}

export function DeleteDialog({
  disabled = false,
  onConfirm,
  title,
  description,
  confirmButtonText,
  triggerTitle = "Delete",
  children,
}: DeleteDialogProps) {
  return (
    <AlertDialog>
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" asChild>
            <AlertDialogAction onClick={onConfirm}>
              {confirmButtonText}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
