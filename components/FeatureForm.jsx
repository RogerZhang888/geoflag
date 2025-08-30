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
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import TypingAnim from "./TypingAnim";

const minWords = 1;

// Zod schema
const FeatureSchema = z.object({
  title: z.string().nonempty("Feature is required"),
  description: z
    .string()
    .refine((val) => val.trim().split(/\s+/).length >= minWords, {
      message: `Must contain at least ${minWords} words`
    })
});

export default function FeatureForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FeatureSchema),
    defaultValues: {
      title: "",
      description: ""
    },
    mode: "onChange", // validate on every change
    reValidateMode: "onChange" // revalidate when input changes again
  });

  async function submithandler(data) {
    try {
      console.log(
        `Attempting to find compliance data for 
        feature "${data.title}" with description ${data.description}`
      );

      const res = await axios.post("/api/feature", data);

      const c = JSON.parse(res.data.isCompliant);

      toast.success("Compliance data has been generated");

      console.log("Compliance data:", c);

      router.push("/");
    } catch (error) {
      console.error("Error when finding compliance data for feature:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || error.message);
      } else {
        toast.error("Could not generate compliance data. Please try again.");
      }

      console.error("Error when finding compliance data for feature:", error);
    }
  }

  return (
    <div className="flex lg:flex-row gap-4 flex-col">
      <div className="lg:w-1/2 w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submithandler)}
            className="space-y-6 max-w-md"
          >
            {/* Feature input */}
            <FormField
              control={form.control}
              name="title"
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
              name="description"
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
              className="w-30 flex justify-center items-center hover:cursor-pointer disabled:cursor-default"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" strokeWidth={3} />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <div className="flex flex-row justify-start gap-2 lg:w-1/2 w-full">
        <div className="text-primary font-bold text-lg flex gap-2 whitespace-nowrap grayscale opacity-80">
          <span className="relative w-[30px] h-[30px]">
            <Image
              src="/logo/logo.png"
              alt="logo"
              sizes="40px"
              fill
              className="object-contain"
            />
          </span>
          GeoFlag AI:
        </div>

        <div className="text-md text-slate-500">
          <TypingAnim text="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Explicabo id, iure quas, recusandae voluptatem dolore distinctio nobis quae blanditiis magni eos mollitia accusantium eaque quisquam eius aliquam, nihil provident consequuntur?" />
        </div>
      </div>
    </div>
  );
}
