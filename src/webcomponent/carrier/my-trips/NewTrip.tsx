"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { BackendTrip, createTripApi, updateTripApi } from "@/api/trip.api";

const tripSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    from_country: z.string().min(1, "From country is required"),
    from_city: z.string().min(1, "From city is required"),
    to_country: z.string().min(1, "To country is required"),
    to_city: z.string().min(1, "To city is required"),

    departure_date: z.date({
      errorMap: () => ({ message: "Departure date is required" }),
    }),
    arrival_date: z.date({
      errorMap: () => ({ message: "Arrival date is required" }),
    }),

    max_weight_kg: z.coerce.number().min(0.1, "Max weight must be greater than 0"),
    available_weight_kg: z.coerce.number().min(0, "Available weight must be 0 or higher"),
    reward_per_kg: z.coerce.number().min(0, "Reward must be 0 or higher"),
    currency: z.string().default("USD"),
    status: z.string().default("ACTIVE"),
    is_active: z.boolean().default(true),
    is_public: z.boolean().default(true),
  })
  .refine((data) => data.arrival_date >= data.departure_date, {
    message: "Arrival date cannot be before departure date",
    path: ["arrival_date"],
  })
  .refine((data) => data.available_weight_kg <= data.max_weight_kg, {
    message: "Available weight cannot exceed max weight",
    path: ["available_weight_kg"],
  });

export type TripFormValues = z.infer<typeof tripSchema>;

export interface NewTripProps {
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  initialData?: BackendTrip | null;
  onSuccess?: () => void;
}

const safeParseDate = (dateVal: any): Date | undefined => {
  if (!dateVal) return undefined;
  if (dateVal instanceof Date && isValid(dateVal)) return dateVal;
  if (typeof dateVal === "string") {
    const parsed = parseISO(dateVal);
    if (isValid(parsed)) return parsed;
    const directDate = new Date(dateVal);
    if (isValid(directDate)) return directDate;
  }
  return undefined;
};

export const NewTrip = ({ setOpenDialog, initialData, onSuccess }: NewTripProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      from_country: "Bangladesh",
      from_city: "Dhaka",
      to_country: "",
      to_city: "",
      departure_date: undefined,
      arrival_date: undefined,
      max_weight_kg: 30,
      available_weight_kg: 10,
      reward_per_kg: 35,
      currency: "USD",
      status: "ACTIVE",
      is_active: true,
      is_public: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        from_country: initialData.from_country || "Bangladesh",
        from_city: initialData.from_city || "Dhaka",
        to_country: initialData.to_country || "",
        to_city: initialData.to_city || "",
        departure_date: safeParseDate(initialData.departure_date),
        arrival_date: safeParseDate(initialData.arrival_date),
        max_weight_kg: Number(initialData.max_weight_kg) || 0,
        available_weight_kg: Number(initialData.available_weight_kg) || 0,
        reward_per_kg: Number(initialData.reward_per_kg) || 0,
        currency: initialData.currency || "USD",
        status: initialData.status || "ACTIVE",
        is_active: initialData.is_active ?? true,
        is_public: initialData.is_public ?? true,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        from_country: "Bangladesh",
        from_city: "Dhaka",
        to_country: "",
        to_city: "",
        departure_date: undefined,
        arrival_date: undefined,
        max_weight_kg: 30,
        available_weight_kg: 10,
        reward_per_kg: 35,
        currency: "USD",
        status: "ACTIVE",
        is_active: true,
        is_public: true,
      });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<TripFormValues> = async (values) => {
    setIsSubmitting(true);
    setApiError(null);

    const payload = {
      ...values,
      departure_date: format(values.departure_date, "yyyy-MM-dd"),
      arrival_date: format(values.arrival_date, "yyyy-MM-dd"),
      max_weight_kg: Number(values.max_weight_kg),
      available_weight_kg: Number(values.available_weight_kg),
      reward_per_kg: Number(values.reward_per_kg),
    };

    try {
      if (initialData?.id) {
        await updateTripApi(initialData.id, payload);
      } else {
        await createTripApi(payload);
      }

      setOpenDialog(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4 text-left">
        {apiError && (
          <div className="sm:col-span-2 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">
            {apiError}
          </div>
        )}

        {/* Title */}
        <div className="sm:col-span-2">
          <FormField
            control={form.control as any}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Trip Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Business Trip to London" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* From Country / City */}
        <FormField
          control={form.control as any}
          name="from_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">From Country</FormLabel>
              <FormControl>
                <Input placeholder="Bangladesh" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="from_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">From City</FormLabel>
              <FormControl>
                <Input placeholder="Dhaka" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* To Country / City */}
        <FormField
          control={form.control as any}
          name="to_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">To Country</FormLabel>
              <FormControl>
                <Input placeholder="Italy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="to_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">To City</FormLabel>
              <FormControl>
                <Input placeholder="Rome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Departure Date */}
        <FormField
          control={form.control as any}
          name="departure_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Departure Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {field.value ? format(field.value, "dd MMM yyyy") : "Pick departure"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Arrival Date */}
        <FormField
          control={form.control as any}
          name="arrival_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Arrival Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {field.value ? format(field.value, "dd MMM yyyy") : "Pick arrival"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weight Inputs */}
        <FormField
          control={form.control as any}
          name="max_weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Max Weight (kg)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="available_weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Available Weight (kg)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reward & Currency */}
        <FormField
          control={form.control as any}
          name="reward_per_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Reward / kg</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Dropdown */}
        <div className="sm:col-span-2">
          <FormField
            control={form.control as any}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Trip Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="PLANNED">PLANNED</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <FormField
            control={form.control as any}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Description</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Provide details about space and items..."
                    className="w-full min-h-[80px] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Trip" : "Create Trip"}
          </Button>
        </div>
      </form>
    </Form>
  );
};