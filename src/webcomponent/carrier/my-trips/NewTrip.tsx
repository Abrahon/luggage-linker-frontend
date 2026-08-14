"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, City, ICountry, ICity } from "country-state-city";

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
import { CalendarIcon, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { format, parseISO, isValid, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { BackendTrip, createTrip, updateTripApi, deleteTripApi } from "@/api/trip.api";

// Fetch all countries in the world
const allCountries = Country.getAllCountries();

// Helper to look up country ISO code by country name
const getCountryIsoByName = (countryName: string): string | undefined => {
  const match = allCountries.find(
    (c) => c.name.toLowerCase() === countryName.trim().toLowerCase()
  );
  return match?.isoCode;
};

// ---------------------------------------------------------------------------
// Zod Schema Aligned with DRF TripSerializer & React Hook Form Types
// ---------------------------------------------------------------------------
export const tripSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Trip title is required.")
      .min(5, "Title must be at least 5 characters.")
      .max(200, "Title cannot exceed 200 characters."),

    description: z
      .string()
      .trim()
      .refine((val) => !val || val.length >= 20, {
        message: "Description must contain at least 20 characters.",
      })
      .optional()
      .or(z.literal("")),

    from_country: z.string().trim().min(1, "Departure country is required."),
    from_city: z.string().trim().min(1, "Departure city is required."),
    to_country: z.string().trim().min(1, "Destination country is required."),
    to_city: z.string().trim().min(1, "Destination city is required."),

    departure_date: z.custom<Date>(
      (val) => val instanceof Date && !isNaN(val.getTime()),
      { message: "Departure date is required." }
    ),

    arrival_date: z.custom<Date>(
      (val) => val instanceof Date && !isNaN(val.getTime()),
      { message: "Arrival date is required." }
    ),

    max_weight_kg: z.coerce
      .number({ message: "Max weight must be a number." })
      .gt(0, "Maximum weight must be greater than zero.")
      .lte(100, "Maximum allowed weight is 100 KG."),

    reward_per_kg: z.coerce
      .number({ message: "Reward must be a number." })
      .min(0, "Reward cannot be negative."),

    currency: z.string().min(1, "Currency is required.").default("USD"),
    is_public: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.from_country && data.to_country && data.from_city && data.to_city) {
        return !(
          data.from_country.toLowerCase() === data.to_country.toLowerCase() &&
          data.from_city.toLowerCase() === data.to_city.toLowerCase()
        );
      }
      return true;
    },
    {
      message: "Destination cannot be the same as departure city.",
      path: ["to_city"],
    }
  )
  .refine(
    (data) => {
      if (data.departure_date && data.arrival_date) {
        return data.arrival_date >= data.departure_date;
      }
      return true;
    },
    {
      message: "Arrival date must be after departure date.",
      path: ["arrival_date"],
    }
  );

export type TripFormValues = z.infer<typeof tripSchema>;

export interface NewTripProps {
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  initialData?: BackendTrip | null;
  onSuccess?: () => void;
}

const formatApiError = (errData: any): string => {
  if (!errData) return "An unexpected error occurred.";
  if (typeof errData === "string") return errData;
  if (errData.errors && typeof errData.errors === "object") return formatApiError(errData.errors);
  if (errData.detail) return formatApiError(errData.detail);

  if (typeof errData === "object") {
    return Object.entries(errData)
      .map(([key, val]) => {
        const fieldName = key.replace(/_/g, " ").toUpperCase();
        if (Array.isArray(val)) return `${fieldName}: ${val.join(", ")}`;
        if (typeof val === "object" && val !== null) return `${fieldName}: ${formatApiError(val)}`;
        return `${fieldName}: ${val}`;
      })
      .join("\n");
  }
  return String(errData);
};

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: "",
      description: "",
      from_country: "Bangladesh",
      from_city: "Dhaka",
      to_country: "",
      to_city: "",
      departure_date: undefined,
      arrival_date: undefined,
      max_weight_kg: 25,
      reward_per_kg: 35,
      currency: "USD",
      is_public: true,
    },
  });

  const selectedFromCountryName = form.watch("from_country");
  const selectedToCountryName = form.watch("to_country");

  // Get ISO codes to fetch cities from package
  const fromIsoCode = getCountryIsoByName(selectedFromCountryName);
  const toIsoCode = getCountryIsoByName(selectedToCountryName);

  // Fetch all cities dynamically based on selected country's ISO code
  const availableFromCities = fromIsoCode ? City.getCitiesOfCountry(fromIsoCode) || [] : [];
  const availableToCities = toIsoCode ? City.getCitiesOfCountry(toIsoCode) || [] : [];

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
        max_weight_kg: Number(initialData.max_weight_kg) || 25,
        reward_per_kg: Number(initialData.reward_per_kg) || 0,
        currency: initialData.currency || "USD",
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
        max_weight_kg: 25,
        reward_per_kg: 35,
        currency: "USD",
        is_public: true,
      });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<TripFormValues> = async (values) => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    if (!initialData && values.departure_date < startOfDay(new Date())) {
      form.setError("departure_date", {
        type: "manual",
        message: "Departure date cannot be in the past.",
      });
      setIsSubmitting(false);
      return;
    }

    if (initialData && initialData.available_weight_kg !== undefined) {
      const availWeight = Number(initialData.available_weight_kg);
      if (Number(values.max_weight_kg) < availWeight) {
        form.setError("max_weight_kg", {
          type: "manual",
          message: "Maximum weight cannot be less than available weight.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      title: values.title.trim(),
      from_country: values.from_country.trim(),
      from_city: values.from_city.trim(),
      to_country: values.to_country.trim(),
      to_city: values.to_city.trim(),
      departure_date: format(values.departure_date, "yyyy-MM-dd"),
      arrival_date: format(values.arrival_date, "yyyy-MM-dd"),
      max_weight_kg: Number(values.max_weight_kg),
      reward_per_kg: Number(values.reward_per_kg),
      currency: values.currency,
      is_public: values.is_public,
      description: values.description?.trim() ? values.description.trim() : "",
    };

    try {
      if (initialData?.id) {
        await updateTripApi(initialData.id, payload);
        setSuccessMessage("Trip updated successfully!");
      } else {
        await createTrip(payload);
        setSuccessMessage("Trip created successfully!");
      }

      if (onSuccess) onSuccess();
      setTimeout(() => setOpenDialog(false), 1200);
    } catch (err: any) {
      console.error("Backend Error Response:", err?.response?.data);
      const errData = err?.response?.data;
      setApiError(errData ? formatApiError(errData) : err?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      await deleteTripApi(initialData.id);
      setSuccessMessage("Trip deleted successfully!");
      if (onSuccess) onSuccess();
      setTimeout(() => setOpenDialog(false), 1000);
    } catch (err: any) {
      console.error("Delete Error Response:", err?.response?.data);
      const errData = err?.response?.data;
      setApiError(errData ? formatApiError(errData) : err?.message || "Failed to delete trip.");
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4 text-left">
        {apiError && (
          <div className="sm:col-span-2 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100 whitespace-pre-line">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="sm:col-span-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {showConfirmDelete && (
          <div className="sm:col-span-2 bg-red-50 border border-red-200 p-3 rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs text-red-700 font-medium">Are you sure you want to delete this trip?</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowConfirmDelete(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" size="sm" className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm Delete"}
              </Button>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
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

        {/* Departure Country */}
        <FormField
          control={form.control}
          name="from_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">From Country</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("from_city", ""); // Reset selected city
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Departure Country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {allCountries.map((country: ICountry) => (
                    <SelectItem key={country.isoCode} value={country.name}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Departure City */}
        <FormField
          control={form.control}
          name="from_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">From City</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedFromCountryName || availableFromCities.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue
                      placeholder={
                        selectedFromCountryName
                          ? availableFromCities.length > 0
                            ? "Select Departure City"
                            : "No cities found for this country"
                          : "Select Country First"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {availableFromCities.map((city: ICity, idx) => (
                    <SelectItem key={`${city.name}-${idx}`} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Destination Country */}
        <FormField
          control={form.control}
          name="to_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">To Country</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("to_city", ""); // Reset selected city
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Destination Country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {allCountries.map((country: ICountry) => (
                    <SelectItem key={country.isoCode} value={country.name}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Destination City */}
        <FormField
          control={form.control}
          name="to_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">To City</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedToCountryName || availableToCities.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue
                      placeholder={
                        selectedToCountryName
                          ? availableToCities.length > 0
                            ? "Select Destination City"
                            : "No cities found for this country"
                          : "Select Country First"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {availableToCities.map((city: ICity, idx) => (
                    <SelectItem key={`${city.name}-${idx}`} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Departure Date */}
        <FormField
          control={form.control}
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
                      className={cn(
                        "w-full justify-start text-left font-normal text-xs",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {field.value ? format(field.value, "dd MMM yyyy") : "Pick departure"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => !initialData && date < startOfDay(new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Arrival Date */}
        <FormField
          control={form.control}
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
                      className={cn(
                        "w-full justify-start text-left font-normal text-xs",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {field.value ? format(field.value, "dd MMM yyyy") : "Pick arrival"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < (form.getValues("departure_date") || startOfDay(new Date()))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Capacity Input */}
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="max_weight_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Luggage Capacity (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g. 25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reward & Currency */}
        <FormField
          control={form.control}
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
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">
                  Description <span className="text-slate-400 font-normal">(Min 20 chars if provided)</span>
                </FormLabel>
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
        <div className="sm:col-span-2 flex justify-between items-center pt-2 border-t border-slate-100">
          <div>
            {initialData?.id && !showConfirmDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isSubmitting || isDeleting || !!successMessage}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Trip
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDialog(false)}
              disabled={isSubmitting || isDeleting || !!successMessage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting || !!successMessage}
              className="bg-amber-400 hover:bg-amber-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Trip" : "Create Trip"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};