"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MultiSelect } from "@/components/custom/multiselect"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Calendar, Hash, Link, FileDigit, FileText, StickyNote, GraduationCap, Tag, Flag
 } from "lucide-react"
import { TreeSelect } from "antd"

const formSchema = z.object({
  title: z.string().min(1),
  year: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().int().min(1000).max(9999).optional()),
  doi: z.string().optional(),
  url: z.string().optional(),
  pages: z.string().optional(),
  abstract: z.string().optional(),
  summary: z.string().optional(),
  authors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  flags: z.array(z.string()).optional(),
})

export default function StudyForm({ studyid = "" }) {
  const [studyDetail, setSelectedStudyDetail] = useState(null)
  const [authorsList, setAuthorsList] = useState(null)
  const [selectTreeData, setSelectTreeData] = useState(null)
  const { SHOW_CHILD } = TreeSelect
  const [tags, setTags] = useState(null)
  const flagslist = ["Reviewed", "Pending Review", "Missing Data", "Flagged"]

  const formatTreeData = (data) => {
    return data.map((item) => ({
      title: item.name,
      value: item.id,
      key: item.id,
      children: item.children && item.children.length > 0 ? formatTreeData(item.children) : [],
    }))
  }

  const fetchTreeData = async () => {
    const response = await fetch("http://localhost:8000/api/tags/")
    const data = await response.json()
    setTags(data)
  }

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
    },
  })

  const fetchStudyDetailed = async (id) => {
    const response = await fetch(`http://localhost:8000/api/studies/${id}/`)
    const data = await response.json()
    setSelectedStudyDetail(data)
  }

  const saveStudy = async (studyid, form) => {
    const method = studyid ? "PATCH" : "POST";
    const url = studyid
      ? `http://127.0.0.1:8000/api/studies/${studyid}/`
      : "http://127.0.0.1:8000/api/studies/";
  
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to ${method === "POST" ? "create" : "update"} study`);
    }
  
    return response.json();
  };

  const fetchAuthors = async () => {
    const response = await fetch(`http://localhost:8000/api/authors/`)
    const data = await response.json()
    const authorsList = data.map((author) => ({
      value: String(author.id),  
      label: author.name,
    }))
    setAuthorsList(authorsList)
  }

  function onSubmit(values) {
    try {
      console.log("submitting: ", values)
      saveStudy(studyid, values)
    
    } catch (error) {
      console.error("Form submission error", error)

    }
  }

  useEffect(() => {
    fetchTreeData()
  }, [])

  useEffect(() => {
    if (studyid) {
      fetchStudyDetailed(studyid)
    }
    fetchAuthors()
  }, [studyid])

  useEffect(() => {
    if (tags) {
      const formattedData = formatTreeData(tags)
      setSelectTreeData(formattedData)
    }
  }, [tags])

  useEffect(() => {
    // Only reset form when both studyDetail and authorsList are ready
    if (studyDetail && authorsList) {
      const authorIds = studyDetail.authors_display?.map((name) => {
        const match = authorsList.find((a) => a.label === name)
        return match ? match.value : name // use ID, fallback to name if not found
      }) || []
  
      const tagIds = studyDetail.tags_display?.map((tag) => String(tag.id)) || []
  
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
        flags: Array.isArray(studyDetail.flags) ? studyDetail.flags : ["Pending Review"],
      })
    }
  }, [studyDetail, authorsList, form]) // Trigger effect when studyDetail or authorsList change

  return (
    <Card className="max-w-3xl mx-auto border-radius 0 bg-indigo-100 ">
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
                          )
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
              <div className="w-full pt-2 flex justify-between">
                <div className="w-xl pr-2 flex flex-col">
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
                            options={flagslist.map((flag) => ({ value: flag, label: flag }))}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select flags"
                            maxCount={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="pt-6">
                  <Button type="submit" className= "bg-violet-900 text-violet-50 text-xs hover:bg-violet-950">
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
