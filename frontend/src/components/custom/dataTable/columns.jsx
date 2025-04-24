"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
      accessorKey: "flags",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        if (!Array.isArray(cellValue)) return false;
    
        const filters = Array.isArray(filterValue) ? filterValue : [filterValue];
        return filters.some((f) => cellValue.includes(f));
      },
      cell: ({ row }) => {
        const categorizedFlags = row.original.flags;
    
        return (
          <div className="flex gap-2 text-violet-50">
            {Array.isArray(categorizedFlags) && categorizedFlags.length > 0
              ? categorizedFlags.map((flag, index) => (
                  <Badge 
                    key={index} 
                    className={`px-2 py-1 text-sm font-semibold rounded-b-md ${
                      flag === "Reviewed"
                        ? "bg-emerald-400"
                        : flag === "Pending Review"
                          ? "bg-amber-400"
                          : flag === "Flagged"
                            ? "bg-orange-400"
                            : flag === "Missing Data"
                              ? "bg-red-400"
                              : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    {flag}
                  </Badge>
                ))
              : "No Status"}
          </div>
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
              <DropdownMenuItem className="hover:bg-violet-100">View Study</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-violet-100"/>
              <DropdownMenuItem className="hover:bg-violet-100">Modify Metadata</DropdownMenuItem>
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