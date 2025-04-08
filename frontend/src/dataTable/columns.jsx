"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

const deleteStudyData = async (id, fetchStudyData) => {
  const response = await fetch(`http://localhost:8000/api/studies/${id}/`, {
    method: "DELETE",
  });
  if (response.ok) {
    fetchStudyData(); // Trigger data re-fetch after deletion
  } else {
    console.error("Error deleting study:", response.statusText);
  }
};

export const columns = (fetchStudyData) => [
    {
      accessorKey: "title", // Property from the data object displayed
      header: ({ column }) => {
        return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },  
    },
    {
        accessorKey: "year", 
        header: ({ column }) => {
            return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Year
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },      
    },
    {
        accessorKey: "authors", 
        header: "Authors",      
    },
    {
        accessorKey: "categorized", 
        header: ({ column }) => {
            return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Categorized
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },     
    },
    {
        accessorKey: "tags", 
        header: "Tags",      
    },
    {
      id: "actions", // No accessorKey: doesn't map to a data property
      cell: ({ row }) => {
        const study = row.original; // The data object for this row
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={"bg-white"}>
              <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-violet-100"/>
              <DropdownMenuItem className="hover:bg-violet-100">Modify metadata</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-violet-100"/>
              <DropdownMenuItem className="hover:bg-violet-100">Attach PDF file</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-violet-100"/>
              <DropdownMenuItem className="hover:bg-violet-100"
                onClick={() => deleteStudyData(study.id, fetchStudyData)}
              >Remove from review</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];