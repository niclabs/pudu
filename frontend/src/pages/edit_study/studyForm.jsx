"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MultiSelect } from "@/components/custom/multiselect";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Calendar,
  Hash,
  Link,
  FileDigit,
  FileText,
  StickyNote,
  GraduationCap
} from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1),
  year: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().int().min(1000).max(9999).optional()),
  doi: z.string().min(1).optional(),
  URL: z.string().min(1).optional(),
  pages: z.string().min(1).optional(),
  abstract: z.string().optional(),
  notes: z.string().optional(),
  authors: z.array(z.string()).optional()
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      year: undefined,
      doi: "",
      URL: "",
      pages: "",
      abstract: "",
      notes: "",
      authors: []
    },
  });

  const authorsList = [
    { value: "John Smith", label: "John Smith" },
    { value: "Jane Doe", label: "Jane Doe" },
    { value: "Albert Einstein", label: "Albert Einstein" },
    { value: "Marie Curie", label: "Marie Curie" },
    { value: "Isaac Newton", label: "Isaac Newton" },
  ];

  function onSubmit(values) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Card className="max-w-3xl mx-auto bg-violet-50 ">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Article Metadata</CardTitle>
        <CardDescription>Enter the details of the academic publication</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">

            <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold">
                        <BookOpen className="h-4 w-4 text-violet-950" />
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="The title of study" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold">
                        <Calendar className="h-4 w-4 text-violet-950" />
                        Year
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="The year it was published" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                control={form.control}
                name="pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold">
                      <FileDigit className="h-4 w-4 text-violet-950" />
                      Pages
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Page numbers (e.g., 123-145)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="doi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold">
                        <Hash className="h-4 w-4 text-violet-950" />
                        DOI
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Digital Object Identifier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="URL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold">
                        <Link className="h-4 w-4 text-violet-950" />
                        URL
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="A web address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <FormField
                control={form.control}
                name="authors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold">
                      <GraduationCap className="h-4 w-4 text-violet-950" />
                      Authors
                    </FormLabel>
                    <FormControl>
                        <MultiSelect
                          options={authorsList}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder="Select authors"
                          variant="inverted"
                          maxCount={5}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="abstract"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold">
                      <FileText className="h-4 w-4 text-violet-950" />
                      Abstract
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief summary of the article."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold">
                      <StickyNote className="h-4 w-4 text-violet-950" />
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes, comments and observations on this article."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              
            </div>

            <div className="pt-4  flex justify-end">
              <Button type="submit"  className="bg-violet-900 text-violet-50 text-xs hover:bg-violet-950 flex">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
