"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Form schema for creating splits
const createSplitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type CreateSplitFormData = z.infer<typeof createSplitSchema>;

type CreateSplitDialogProps = {
  onCreate: (splitId: Id<"splits">) => void;
  trigger?: React.ReactNode;
  className?: string;
};

export function CreateSplitDialog({
  onCreate,
  trigger,
  className,
}: CreateSplitDialogProps) {
  const [open, setOpen] = useState(false);
  const createSplitMutation = useMutation(api.splits.createSplit);

  const form = useForm<CreateSplitFormData>({
    resolver: zodResolver(createSplitSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateSplitFormData) => {
    toast.promise(
      createSplitMutation({
        name: data.name,
        description: data.description?.trim() || undefined,
        exercises: [],
      }),
      {
        loading: "Creating split...",
        success: (splitId) => {
          onCreate(splitId);
          form.reset();
          setOpen(false);
          return "Split created successfully!";
        },
        error: "Failed to create split",
      }
    );
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      className={className || "w-full"}
      onClick={() => setOpen(true)}
    >
      <Plus size={16} className="mr-2" />
      Create New Split
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Split</DialogTitle>
          <DialogDescription>
            Create a new workout split. You can add exercises to it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Split Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Push Day, Pull Day, Leg Day"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Give your split a descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your split, training focus, or any notes..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add details about your training approach or goals
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Split
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
