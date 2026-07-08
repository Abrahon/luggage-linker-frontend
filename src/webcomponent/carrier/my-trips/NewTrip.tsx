"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Look for this type/interface inside your NewTrip.tsx file
export interface NewTripProps {
  setOpenDilog: React.Dispatch<React.SetStateAction<boolean>>;
  initialData?: any; // Add this line right here (change 'any' to 'TripDetails | null' if preferred)
}

const cities = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Singapore",
  "Dubai",
  "Kolkata",
  "London",
  "New York",
  "Paris",
  "Tokyo",
];

// ✅ Schema
const tripSchema = z.object({
  from: z.string().min(1, { message: "From location is required" }),
  to: z.string().min(1, { message: "Destination is required" }),
  date: z.date({ message: "Departure date is required" }),
  returnDate: z.date().optional(),
  carryWeight: z
    .number()
    .min(1, { message: "Weight must be at least 1 kg" })
    .refine((n) => !isNaN(n), { message: "Weight must be a number" }),
  transportType: z.string().min(1, { message: "Select transport type" }),
  price: z
    .number()
    .min(1, { message: "Price must be at least 1" })
    .refine((n) => !isNaN(n), { message: "Price must be a number" }),
  note: z.string().min(5, { message: "Please provide a trip note" }),
});


type TripFormValues = z.infer<typeof tripSchema>;

export const NewTrip = ({ setOpenDilog }: NewTripProps) => {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    mode: "onChange",
  });

  const onSubmit = (data: TripFormValues) => {
    console.log("Trip Created:", data);
    setOpenDilog(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid sm:grid-cols-2 gap-4 font-montserrat"
      >
        {/* 🏙️ FROM CITY - SEARCHABLE */}
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Search city"}
                      <Search className="w-4 h-4 ml-2 opacity-60" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-[250px]">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city) => (
                          <CommandItem
                            key={city}
                            onSelect={() => form.setValue("from", city)}
                          >
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 🏝️ TO CITY - SEARCHABLE */}
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Search city"}
                      <Search className="w-4 h-4 ml-2 opacity-60" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-[250px]">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city) => (
                          <CommandItem
                            key={city}
                            onSelect={() => form.setValue("to", city)}
                          >
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ⬇️ Keep all other fields same as before */}
        {/* Departure date, return date, weight, transportType, price, note, submit button */}
        {/* 🗓️ Departure Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "dd MMM yyyy") : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 🔁 Return Date */}
        <FormField
          control={form.control}
          name="returnDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Return Date (optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "dd MMM yyyy") : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        {/* ⚖️ Available Luggage */}
        <FormField
          control={form.control}
          name="carryWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Luggage Space (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 🚚 Transport Type */}
        <FormField
          control={form.control}
          name="transportType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transportation Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="sea">Sea</SelectItem>
                  <SelectItem value="road">Road</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 💰 Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (USD)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter price"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 📝 Trip Notes - Full Width */}
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Notes</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Add any additional trip details..."
                    className="w-full min-h-[100px] border rounded-md p-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 🚀 Submit Button */}
        <div className="sm:col-span-2 flex justify-end">
          <Button
            type="submit"
            disabled={!form.formState.isValid}
            className="w-full sm:w-auto"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};
