"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MultiSelect } from "@/components/custom/multiselect";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Calendar,
  Hash,
  Link,
  FileDigit,
  FileText,
  StickyNote,
  GraduationCap,
  Tag,
  Flag,
  X,
  FilePlus,
  Info,
} from "lucide-react";
import { TreeSelect } from "antd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/custom/tooltip";

const formSchema = z.object({
  title: z.string().min(1),
  year: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().min(1000).max(9999).optional(),
  ),
  doi: z.string().optional(),
  url: z.string().optional(),
  pages: z.string().optional(),
  abstract: z.string().optional(),
  summary: z.string().optional(),
  authors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  flags: z.array(z.string()).optional(),
  pathto_pdf: z.string().optional(),
});

export default function StudyForm({ studyid = "", refreshPdf }) {
  const [studyDetail, setSelectedStudyDetail] = useState(null);
  const [authorsList, setAuthorsList] = useState(null);
  const [selectTreeData, setSelectTreeData] = useState(null);
  const [authorOpen, setAuthorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { SHOW_CHILD } = TreeSelect;
  const [tags, setTags] = useState(null);
  const flagslist = ["Reviewed", "Pending Review", "Missing Data", "Flagged"];
  const [addedAuthor, setAddedAuthor] = useState("");

  const reviewId = localStorage.getItem('review_id');


  const handleAuthorSubmit = async () => {
    const authorName = addedAuthor.trim();

    if (!authorName) {
      console.error("Author name cannot be empty");
      return;
    }

    await addAuthor(authorName);
  };

  const addAuthor = async (authorName) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/authors/?review_id=${reviewId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authorName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add author");
      }

      const newAuthor = await response.json();
      console.log("Added author:", newAuthor);
      setAddedAuthor("");
      await fetchAuthors();
      setAuthorOpen(false);
    } catch (error) {
      console.error("Error adding author:", error.message);
    }
  };

  const formatTreeData = (data) => {
    return data.map((item) => ({
      title: item.name,
      value: item.id,
      key: item.id,
      children:
        item.children && item.children.length > 0
          ? formatTreeData(item.children)
          : [],
    }));
  };

  const fetchTreeData = async () => {
    const response = await fetch(`http://localhost:8000/api/tags/?review_id=${reviewId}`);
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
      summary: "",
      authors: [],
      tags: [],
      flags: ["Pending Review"],
      pathto_pdf: "",
    },
  });

  const fetchStudyDetailed = async (id) => {
    const response = await fetch(`http://localhost:8000/api/studies/${id}/?review_id=${reviewId}`);
    const data = await response.json();
    setSelectedStudyDetail(data);
    console.log(data);
  };

  async function deleteAuthors() {
    try {
      const authorIds = form.getValues("authors");
      const response = await fetch(`http://127.0.0.1:8000/api/authors/?review_id=${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authors: authorIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete authors");
      }

      const data = await response.json();
      console.log("Deleted authors:", data.deleted);

      await fetchAuthors();
      form.setValue("authors", []);
      setDeleteOpen(false);
      setSelectedStudyDetail((prev) => ({
        ...prev,
        authors_display: [],
      }));

      return data.deleted;
    } catch (error) {
      console.error("Error deleting authors:", error.message);
      throw error;
    }
    
  }

  const saveStudy = async (studyid, form) => {
    const method = studyid ? "PATCH" : "POST";
    const url = studyid
      ? `http://127.0.0.1:8000/api/studies/${studyid}/?review_id=${reviewId}`
      : `http://127.0.0.1:8000/api/studies/?review_id=${reviewId}`;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to ${method === "POST" ? "create" : "update"} study`,
      );
    }

    return response.json();
  };

  const fetchAuthors = async () => {
    const response = await fetch(`http://localhost:8000/api/authors/?review_id=${reviewId}`);
    const data = await response.json();
    const authorsList = data.map((author) => ({
      value: String(author.id),
      label: author.name,
    }));
    authorsList.sort((a, b) => a.label.localeCompare(b.label));
    setAuthorsList(authorsList);
  };

  async function onSubmit(values) {
    try {
      console.log("submitting: ", values);
      await saveStudy(studyid, values);
      if (refreshPdf) {
        refreshPdf();
      }
    } catch (error) {
      console.error("Form submission error", error);
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
    // Only reset form when both studyDetail and authorsList are ready
    if (studyDetail && authorsList) {
      const authorIds =
        studyDetail.authors_display?.map((name) => {
          const match = authorsList.find((a) => a.label === name);
          return match ? match.value : name; // use ID, fallback to name if not found
        }) || [];

      const tagIds =
        studyDetail.tags_display?.map((tag) => String(tag.id)) || [];

      form.reset({
        title: studyDetail.title || "",
        year: studyDetail.year || undefined,
        doi: studyDetail.doi || "",
        url: studyDetail.url || "",
        pages: studyDetail.pages || "",
        abstract: studyDetail.abstract || "",
        summary: studyDetail.summary || "",
        authors: authorIds,
        tags: tagIds,
        flags: Array.isArray(studyDetail.flags)
          ? studyDetail.flags
          : ["Pending Review"],
        pathto_pdf: studyDetail.pathto_pdf || "", // Make sure to load the existing filename
      });
    }
  }, [studyDetail, authorsList, form]); // Trigger effect when studyDetail or authorsList change

  return (
    <Card className="max-w-4xl m-4 mb-4 mx-auto border-0 bg-indigo-100 ">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Article Metadata</CardTitle>
        <Button
          type="submit"
          form="study-form"
          className=" font-bold bg-violet-900 text-violet-50 hover:bg-violet-950"
        >
          Submit
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="study-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
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
                      <Input
                        placeholder="The title of study"
                        type="text"
                        {...field}
                      />
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
                        <Input
                          placeholder="The year it was published."
                          type="number"
                          {...field}
                        />
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
                        <Input
                          placeholder="Relevant page numbers (e.g., 123-145)"
                          {...field}
                        />
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
                        <Input
                          placeholder="Digital Object Identifier"
                          {...field}
                        />
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
                    <div className="flex flex-row items-center justify-between">
                      <FormLabel className="flex items-center gap-2 font-bold">
                        <GraduationCap className="h-4 w-4 text-violet-950" />
                        Authors
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Dialog open={authorOpen} onOpenChange={setAuthorOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-violet-900 text-violet-50 font-bold h-6 hover:bg-violet-950">
                              Add Authors
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-violet-50">
                            <DialogHeader>
                              <DialogTitle>Add Authors</DialogTitle>
                              <DialogDescription>
                                Makes a new entry to the authors list for this
                                systematic review.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="col-span-4 bg-violet">
                                  <Input
                                    type="text"
                                    placeholder="Author name"
                                    className="cursor-pointer"
                                    value={addedAuthor}
                                    onChange={(e) =>
                                      setAddedAuthor(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
                            <Button
                                variant="outline"
                                onClick={() => setAuthorOpen(false)}
                                className="border-violet-700 text-violet-700 hover:bg-violet-100"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAuthorSubmit}
                                className="bg-violet-900 text-violet-50 hover:bg-violet-950 "
                              >
                                Confirm
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          className="bg-red-600 text-violet-50 h-6 hover:bg-red-800 font-bold"
                          type="button"
                          onClick={() => setDeleteOpen(true)}
                        >
                          Delete Selected Authors
                        </Button>
                      </div>
                    </div>
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
                name="summary"
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
                          form.setValue(
                            "tags",
                            newValue.map((v) => v.value),
                          );
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
              <div className="grid grid-cols-2 gap-4 pt-2">
                <FormField
                  control={form.control}
                  name="flags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold">
                        <Flag className="h-4 w-4 text-violet-950" />
                        Status
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={flagslist.map((flag) => ({
                            value: flag,
                            label: flag,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select flags"
                          maxCount={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pathto_pdf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold">
                        <FilePlus className="h-4 w-4 text-violet-950" />
                        PDF file
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-violet-950" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              sideOffset={5}
                              className="bg-violet-100 text-violet-950 border-violet-200"
                            >
                              <p>
                                Link the study to a PDF in the tool&apos;s
                                public folder
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {field.value && (
                          <span className="ml-2 font-normal text-sm text-gray-600">
                            {field.value}
                          </span>
                        )}
                        {field.value && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            className="bg-red-600 hover:bg-red-800"
                            onClick={() => form.setValue("pathto_pdf", "")}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        )}
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                form.setValue("pathto_pdf", file.name);
                              }
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogContent className="  bg-violet-50 p-8 ">
                    <DialogHeader>
                      <DialogTitle>Deleting Authors</DialogTitle>
                    </DialogHeader>
                        {form.getValues("authors").map((id) => {
                          const author = authorsList.find((a) => a.value === id);
                          return <li key={id}>{author?.label || `ID ${id}`}</li>;
                        })}
                        These authors are being deleted. This action cannot be undone.
                        <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
                        <Button
                        variant="outline"
                        onClick={() => setDeleteOpen(false)}
                        className="border-violet-700 text-violet-700 hover:bg-violet-100"
                      >
                        Close
                      </Button>
                        <Button className="bg-red-600 text-violet-50 hover:bg-red-800"
                          onClick={() => deleteAuthors()}>
                          Delete Authors
                        </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    
  );
}
