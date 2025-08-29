"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const minWords = 1;

// Zod schema
const FeatureSchema = z.object({
  feat: z.string().nonempty("Feature is required"),
  desc: z.string().refine((val) => val.trim().split(/\s+/).length >= minWords, {
    message: `Must contain at least ${minWords} words`
  })
});

export default function FeatureForm() {
  const form = useForm({
    resolver: zodResolver(FeatureSchema),
    defaultValues: {
      feat: "",
      desc: ""
    },
    mode: "onChange", // validate on every change
    reValidateMode: "onChange" // revalidate when input changes again
  });

  async function submithandler(data) {
    try {
      console.log(
        `Attempting to find compliance data for 
        feature "${data.feat}" with description ${data.desc}`
      );

      const res = await axios.post(
         "/api/feature", 
         data
      );

      toast.success(
         "Compliance data has been generated.", 
         // {
         //    action: {
         //       label: "Undo",
         //       onClick: () => console.log("Undo"),
         //    },
         // }
      )

      console.log("Response:", res);
    } catch (error) {
      console.error("Error when finding compliance data for feature:", error);
      toast.error(
         "Compliance data could not be generated. Try again.", 
         // {
         //    action: {
         //       label: "Undo",
         //       onClick: () => console.log("Undo"),
         //    },
         // }
      )
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submithandler)}
        className="space-y-6 max-w-md"
      >
        {/* Feature input */}
        <FormField
          control={form.control}
          name="feat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature</FormLabel>
              <FormControl>
                <Input placeholder="Enter feature name" {...field} />
              </FormControl>
              <FormDescription>The name of your feature.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description textarea */}
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" {...field} />
              </FormControl>
              <FormDescription>
                A short description of your planned feature.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
