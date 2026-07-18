"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVerification } from "@/app/(protected)/(carrier)/verification/(verification)/VerificationLayOut";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const countryList = [
  "United States",
  "Canada",
  "United Kingdom",
  "Bangladesh",
  "India",
];

const GENDER_VALUES = ["male", "female", "other", ""] as const;

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(6, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(GENDER_VALUES).refine((val) => val !== "", {
    message: "Please select your gender",
  }),
  country: z.string().min(1, "Country is required"),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

// CHANGED: Renamed from PersonalInfo to PersonalInformation to fix the undefined render crash
export const PersonalInformation = () => {
  const { setStepComplete } = useVerification();
  const [openCountry, setOpenCountry] = useState(false);

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "", 
      country: "",
    },
  });

  const { isValid } = form.formState;

  useEffect(() => {
    setStepComplete(isValid);
  }, [isValid, setStepComplete]);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-5 w-full max-w-2xl mx-auto py-2">
        {/* Grid: First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="font-bold text-sm tracking-wide">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="font-bold text-sm tracking-wide">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} className="h-11" />
                </FormControl>
                  <FormMessage />
                </FormItem>
            )}
          />
        </div>

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="font-bold text-sm tracking-wide">Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 000-0000" {...field} className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid: Date of Birth & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="font-bold text-sm tracking-wide">Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-11 block w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="font-bold text-sm tracking-wide">Gender</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 capitalize">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male" className="cursor-pointer">Male</SelectItem>
                    <SelectItem value="female" className="cursor-pointer">Female</SelectItem>
                    <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Country Picker Popover */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="font-bold text-sm tracking-wide">Country</FormLabel>
              <Popover open={openCountry} onOpenChange={setOpenCountry}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal h-11 px-3",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Select country"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command className="w-full">
                    <CommandInput placeholder="Search country..." className="h-10" />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countryList.map((country) => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={() => {
                              field.onChange(country);
                              setOpenCountry(false);
                            }}
                            className="cursor-pointer"
                          >
                            {country}
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
      </form>
    </Form>
  );
};