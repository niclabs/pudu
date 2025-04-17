"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,  
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/custom/table"
import { Input } from "@/components/custom/input"

// Filter function using AND logic, returns true when all search terms are present in a row
// dont delete columnId or addMeta, required by tanstacktable
// eslint-disable-next-line no-unused-vars
function crossColumnAndFilter(row, columnId, filterValue, addMeta) {
  if (!filterValue){
    return true
  } 

  // Split and clean search terms
  const searchTerms = filterValue
    .toString()
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)

  // If no search terms, return true
  if (searchTerms.length === 0) {
    return true
  }
  // For each search term, check if it exists in any column
  return searchTerms.every((term) => {
    // Check each column in the row
    return row.getAllCells().some((cell) => {
      const cellValue = cell.getValue()
      if (cellValue == null){
        return false
      } 
      return String(cellValue).toLowerCase().includes(term)
    })
  })
}

export function DataTable({ columns, data, selectedTag = "",filterBy =""}) {
  const [sorting, setSorting] = useState([{
    id: "year",
    desc: false,
  }])
  const [globalFilter, setGlobalFilter] = useState("")

  // If selectedTag and filterBy are not empty, append it to the global filter
  const combinedFilter = [globalFilter, selectedTag, filterBy]
  .filter(Boolean)
  .join(", ")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      crossColumnAnd: crossColumnAndFilter,
    },
    globalFilterFn: "crossColumnAnd",
    state: {
      sorting,
      globalFilter: combinedFilter, 
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex py-4 items-center">
        <Input
          placeholder="Search with terms separated by commas!"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
    <div className="h-full max-h-full min-h-0 overflow-auto rounded-md">
      <Table className="min-w-full">
          <TableHeader className="text-purple-950 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="bg-violet-100 hover:bg-violet-200 sticky top-0 text-center" key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="flex-grow">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-normal">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
