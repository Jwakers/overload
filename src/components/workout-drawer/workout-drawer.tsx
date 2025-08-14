import { DialogClose } from "@radix-ui/react-dialog";
import { Delete, Plus, PlusCircle, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { ScrollArea } from "../ui/scroll-area";

export function WorkoutDrawer() {
  const [selectExerciseDialogOpen, setSelectExerciseDialogOpen] =
    useState(false);

  return (
    <>
      <Drawer dismissible={false}>
        <DrawerTrigger asChild>
          <button
            className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
            title="Log workout"
            type="button"
          >
            <div className="p-4 rounded-full bg-brand text-brand-foreground shadow-lg">
              <Plus size={24} className={"text-brand-foreground"} />
            </div>
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New Workout</DrawerTitle>
            <DrawerDescription>Description goes here</DrawerDescription>
          </DrawerHeader>

          <div className="container grid gap-2">
            <button
              className="flex justify-between gap-2 rounded border border-dashed p-4"
              onClick={() => setSelectExerciseDialogOpen(true)}
            >
              <p className="font-semibold">Add first exercise</p>
              <PlusCircle className="text-brand" size={24} />
            </button>
          </div>

          <DrawerFooter className="flex flex-row gap-2 max-w-xl mx-auto w-full">
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={() => setSelectExerciseDialogOpen(false)}
              >
                <Delete />
                Cancel
              </Button>
            </DrawerClose>
            <Button className="grow" variant="primary">
              <Save />
              <span>Save Workout</span>
              {/* Timer starts when first exercise is added */}
              <span>{"(0 min)"}</span>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <SelectExerciseDialog
        open={selectExerciseDialogOpen}
        onClose={() => setSelectExerciseDialogOpen(false)}
      />
    </>
  );
}

function SelectExerciseDialog(props: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
          <DialogDescription>
            Select an exercise to add to your workout.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100dvh-200px)]">
          <ul className="grid gap-2 pb-1">
            <li>
              <button className="p-4 w-full rounded border flex justify-between items-center gap-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">Pull ups</div>
                  <ul className="flex gap-1 text-xs text-muted-foreground">
                    <li className="rounded-full bg-muted px-2 py-1">
                      Lower back
                    </li>
                    <li className="rounded-full bg-muted px-2 py-1">
                      Upper back
                    </li>
                    <li className="rounded-full bg-muted px-2 py-1">Core</li>
                  </ul>
                </div>
                <PlusCircle className="text-brand" size={32} />
              </button>
            </li>
            <li>
              <button className="p-4 w-full rounded border flex justify-between items-center gap-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">Bench press</div>
                  <ul className="flex gap-1 text-xs text-muted-foreground">
                    <li className="rounded-full bg-muted px-2 py-1">Chest</li>
                  </ul>
                </div>
                <PlusCircle className="text-brand" size={32} />
              </button>
            </li>
          </ul>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
