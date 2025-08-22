import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { DeleteDialog } from "../ui/delete-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";

// Exercise set form schema
const exerciseSetSchema = z.object({
  weight: z.string(),
  reps: z.string(),
  notes: z
    .string()
    .max(255, "Notes must be no more than 255 characters")
    .optional(),
});

type ExerciseSetFormData = z.infer<typeof exerciseSetSchema>;
const DEFAULT_WEIGHT = "lbs";

interface ExerciseSetFormProps {
  exerciseSetId: Id<"exerciseSets">;
}

export function ExerciseSetForm({ exerciseSetId }: ExerciseSetFormProps) {
  // TODO: Show saved sets above the form
  // TODO: reset values when the form is submitted
  // TODO: add an is body weight option
  // TODO: When weight unit changes, convert the current weight value to the new unit
  const user = useQuery(api.users.current);
  const exerciseSet = useQuery(api.exerciseSets.get, {
    exerciseSetId,
  });
  const addSetMutation = useMutation(api.exerciseSets.addSet);
  const setActiveMutation = useMutation(api.exerciseSets.setActive);
  const deleteSetMutation = useMutation(api.exerciseSets.deleteSet);

  const [isPending, startTransition] = useTransition();

  const form = useForm<ExerciseSetFormData>({
    resolver: zodResolver(exerciseSetSchema),
    defaultValues: {
      weight: "", // TODO: Pre-populate weight default value with the last exercise set weight
      reps: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof exerciseSetSchema>) {
    const weight = Number(values.weight);
    const reps = Number(values.reps);
    const notes = values.notes;

    if (weight < 0) {
      form.setError("weight", { message: "Weight must be positive" });
      return;
    }

    if (reps < 1) {
      form.setError("reps", { message: "Reps must be at least 1" });
      return;
    }

    if (isNaN(weight) || isNaN(reps)) {
      form.setError("weight", { message: "Weight must be a number" });
      form.setError("reps", { message: "Reps must be a number" });
      return;
    }

    startTransition(async () => {
      await addSetMutation({
        exerciseSetId,
        weightUnit: user?.preferences?.defaultWeightUnit || DEFAULT_WEIGHT,
        set: {
          weight,
          reps,
          notes,
        },
      });
    });
  }

  const handleDeleteSet = async (setId: string) => {
    startTransition(async () => {
      await deleteSetMutation({
        exerciseSetId,
        setId,
      });
    });
  };

  return (
    <div className="space-y-3">
      {exerciseSet ? (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Set</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseSet.sets.map((set, i) => (
                <TableRow key={exerciseSet._id + i}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>
                    {set.weight}
                    {set.weightUnit}
                  </TableCell>
                  <TableCell>{set.reps}</TableCell>
                  <TableCell className="text-right">
                    <DeleteDialog
                      disabled={isPending}
                      onConfirm={() => handleDeleteSet(set.id)}
                      title="Delete Set"
                      description="Are you sure you want to delete this set? This action cannot be undone."
                      confirmButtonText="Delete Set"
                      triggerTitle="Delete set"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
      {exerciseSet?.isActive ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-[auto_1fr_1fr] gap-4"
          >
            <div className="text-lg  grow flex items-center">
              {exerciseSet?.sets.length ? exerciseSet.sets.length + 1 : 1}
            </div>

            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="weight"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Weight</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute right-4 border-l pl-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {user?.preferences?.defaultWeightUnit?.toLowerCase() ||
                            DEFAULT_WEIGHT}
                        </span>
                        <Input
                          min={0}
                          placeholder="0"
                          type="number"
                          inputMode="numeric"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="reps"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Reps</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="0"
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-2 col-start-2 col-span-2">
              <FormField
                control={form.control}
                name="notes"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes (optional)"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground text-right">
                      {field.value?.length || 0}/255
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2 col-start-1 col-span-3 justify-end">
              <Button
                variant="outline"
                disabled={isPending || !exerciseSet?.sets.length}
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await setActiveMutation({
                      exerciseSetId,
                      isActive: false,
                    });
                  });
                }}
              >
                Finish exercise
              </Button>

              <Button type="submit" disabled={isPending}>
                Save set
              </Button>
            </div>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
