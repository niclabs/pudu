"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  GraduationCap,
  Tag
} from "lucide-react"
import { TreeSelect } from "antd"

const formSchema = z.object({
  title: z.string().min(1),
  year: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().int().min(1000).max(9999).optional()),
  doi: z.string().optional(),
  url: z.string().optional(),
  pages: z.string().optional(),
  abstract: z.string().optional(),
  notes: z.string().optional(),
  authors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export default function StudyForm({ studyid = "" }) {
  const [studyDetail, setSelectedStudyDetail] = useState(null);
  const [authorsList, setAuthorsList] = useState(null);
  const [selectTreeData, setSelectTreeData] = useState(null);
  const { SHOW_CHILD } = TreeSelect;
  const [tags, setTags] = useState(null);

  const formatTreeData = (data) => {
    return data.map((item) => ({
      title: item.name,
      value: item.id,
      key: item.id,
      children: formatTreeData(item.children),
    }));
  };

  const fetchTreeData = async () => {
    const response = await fetch("http://localhost:8000/api/tags/");
    const data = await response.json();
    setTags(data);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      year: undefined,
      doi: "",
      url: "",
      pages: "",
      abstract: "",
      notes: "",
      authors: [],
      tags: [],
    },
  });

  const fetchStudyDetailed = async (id) => {
    const response = await fetch(`http://localhost:8000/api/studies/${id}/`);
    const data = await response.json();
    setSelectedStudyDetail(data);
  };

  const fetchAuthors = async () => {
    const response = await fetch(`http://localhost:8000/api/authors/`);
    const data = await response.json();
    const authorsList = data.map((author) => ({
      value: author.name,
      label: author.name,
    }));
    setAuthorsList(authorsList);
  };

  function onSubmit(values) {
    try {
      console.log('submitting: ', values);
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

  useEffect(() => {
    fetchTreeData();
  }, []);

  useEffect(() => {
    if (studyid) {
      fetchStudyDetailed(studyid);
    }
    fetchAuthors();
  }, [studyid]);

  useEffect(() => {
    if (tags) {
      const formattedData = formatTreeData(tags);
      setSelectTreeData(formattedData);
    }
  }, [tags]);

  useEffect(() => {
    if (studyDetail) {
      const tagIds = studyDetail.tags_display?.map(tag => String(tag.id)) || [];
      console.log("tagIds", tagIds);
      form.reset({
        title: studyDetail.title || "",
        year: studyDetail.year || undefined,
        doi: studyDetail.doi || "",
        url: studyDetail.url || "",
        pages: studyDetail.pages || "",
        abstract: studyDetail.abstract || "",
        notes: studyDetail.notes || "",
        authors: studyDetail.authors_display || [],
        tags: tagIds,
      });
    }
  }, [studyDetail]);

  return (
    <Card className="max-w-3xl mx-auto bg-indigo-100 ">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Article Metadata</CardTitle>
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
                        <Input placeholder="The year it was published." {...field} />
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
                      <Input placeholder="Relevant page numbers (e.g., 123-145)" {...field} />
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
                  name="url"
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
                      options={authorsList ?? []}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select authors"
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
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-bold">
                    <Tag className="h-4 w-4 text-violet-950" />
                    Tags
                  </FormLabel>
                  <FormControl>
                    <TreeSelect
                      treeData={selectTreeData}
                      value={field.value}
                      onChange={(newValue) => {
                        form.setValue("tags", newValue.map(v => v.value));
                      }}
                      treeCheckable
                      treeCheckStrictly
                      showCheckedStrategy={SHOW_CHILD}
                      placeholder="Select tags for this article"
                      style={{ width: "100%" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-violet-900 text-violet-50 text-xs hover:bg-violet-950 flex">
                Submit
              </Button>
            </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}