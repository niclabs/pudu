"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/custom/table";
import { Input } from "@/components/custom/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, Plus, Trash2, Search } from "lucide-react";


const SEARCH_FIELDS = [
  { value: "title", label: "Title" },
  { value: "year", label: "Year" },
  { value: "authors", label: "Authors" },
  { value: "flags", label: "Status" },
  { value: "tags", label: "Tags" },
];

function crossColumnAndFilter(row, columnId, filterValue, addMeta) {
  if (!filterValue) return true;
  
  const searchTerms = filterValue
    .toString()
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  if (searchTerms.length === 0) return true;

  return searchTerms.every((term) => {
    return row.getAllCells().some((cell) => {
      const cellValue = cell.getValue();
      return (
        cellValue !== null &&
        cellValue !== undefined &&
        cellValue.toString().toLowerCase().includes(term)
      );
    });
  });
}

function advancedFilterFunction(row, filterConditions) {
  if (!filterConditions || filterConditions.length === 0) return true;

  let result = evaluateCondition(row, filterConditions[0]);

  for (let i = 1; i < filterConditions.length; i++) {
    const condition = filterConditions[i];
    const nextResult = evaluateCondition(row, condition);

    if (condition.operator === "AND") {
      result = result && nextResult;
    } else if (condition.operator === "OR") {
      result = result || nextResult;
    } else if (condition.operator === "NOT") {
      result = result && !nextResult;
    }
  }

  return result;
}

function evaluateCondition(row, condition) {
  const { field, value } = condition;
  if (!value) return true; 

  if (field === "everything") {
      return crossColumnAndFilter(row, null, value);
  }
  const cellValue = row.getValue(field);

  if (cellValue == null) return false;

  const stringCell = String(cellValue).toLowerCase();
  const stringSearch = String(value).toLowerCase();

  return stringCell.includes(stringSearch);
}


export function DataTable({ columns, data, filterBy }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(""); // Estado para la búsqueda simple
  
  const [searchConditions, setSearchConditions] = useState([
    { id: Date.now(), operator: "AND", field: "title", value: "" }
  ]);
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredData = useMemo(() => {
    if (!showAdvanced) return data; 

    return data.filter(item => {
        const mockRow = {
            getValue: (key) => item[key]
        };
        return advancedFilterFunction(mockRow, searchConditions);
    });
  }, [data, searchConditions, showAdvanced]);


  const table = useReactTable({
    data: showAdvanced ? filteredData : data, 
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), 
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter, 
    globalFilterFn: crossColumnAndFilter,  
    state: {
      sorting,
      globalFilter: showAdvanced ? "" : globalFilter, 
    },
  });

  const addCondition = () => {
    setSearchConditions([
      ...searchConditions,
      { id: Date.now(), operator: "AND", field: "title", value: "" }
    ]);
  };

  const removeCondition = (id) => {
    if (searchConditions.length === 1) return; 
    setSearchConditions(searchConditions.filter(c => c.id !== id));
  };

  const updateCondition = (id, key, newValue) => {
    setSearchConditions(searchConditions.map(c => 
      c.id === id ? { ...c, [key]: newValue } : c
    ));
  };
    useEffect(() => {
        if (filterBy && !showAdvanced) {
             table.setGlobalFilter(filterBy);
        }
    }, [filterBy, table, showAdvanced]);


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(
             <div className="relative max-w-sm w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search with terms separated by commas!"
                value={(table.getState().globalFilter) ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="pl-8"
                />
            </div>
        )}
        
        <Button 
            variant={showAdvanced ? "secondary" : "outline"}
            onClick={() => {
                setShowAdvanced(!showAdvanced);
                if (!showAdvanced) table.setGlobalFilter(""); 
            }}
            className="flex gap-2 "
        >
            <SlidersHorizontal size={16} />
            {showAdvanced ? "Simple Search" : "Advanced Search"}
        </Button>
      </div>

      {showAdvanced && (
        <div className="p-6 border rounded-md bg-violet-50/50 space-y-4 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-semibold text-lg text-violet-900 mb-4">Enter keywords and select fields </h3>
            
            {searchConditions.map((condition, index) => (
                <div key={condition.id} className="flex flex-col md:flex-row gap-3 items-end md:items-center p-3 bg-white rounded-md shadow-sm border border-violet-100">  
                              <div className="w-full md:w-24">
                                  <Select 
                                    value={condition.operator} 
                                    onValueChange={(val) => updateCondition(condition.id, "operator", val)}
                                  >
                                    <SelectTrigger className="bg-violet-50 border-violet-300 text-violet-900 font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-violet-50 border-violet-200 shadow-sm ">
                                      <SelectItem value="AND">AND</SelectItem>
                                      <SelectItem value="OR">OR</SelectItem>
                                      <SelectItem value="NOT">NOT</SelectItem>
                                    </SelectContent>
                                  </Select>
                                
                              </div>

                    <div className="w-full md:w-48">
                        <Select 
                            value={condition.field} 
                            onValueChange={(val) => updateCondition(condition.id, "field", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Field" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-md"> 
                                <SelectItem value="everything">All Metadata</SelectItem> 
                                {SEARCH_FIELDS.map(field => (
                                    <SelectItem key={field.value} value={field.value}>
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 w-full">
                        <Input 
                            placeholder={condition.field === "flags" ? "Search in all statuses..." : `Search in ${condition.field}...`}
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                        />
                    </div>


                    <div className="flex gap-2">
                        <Button 
                            title="Remove Condition"
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeCondition(condition.id)}
                            disabled={searchConditions.length === 1}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 size={18} />
                        </Button>
                         <Button 
                            title="Add Condition"
                            variant="outline" 
                            size="icon" 
                            onClick={addCondition}
                            className="text-violet-700 hover:bg-violet-50 border-violet-200"
                        >
                            <Plus size={18} />
                        </Button>
                    </div>

                </div>
            ))}
        </div>
      )}
      <div className="h-full max-h-full min-h-0 overflow-auto rounded-md">
        <Table className="min-w-full">
          <TableHeader className="text-purple-950 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="bg-violet-100 hover:bg-violet-200 sticky top-0 text-center"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="flex-grow"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-normal">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} studies.
        </div>
      </div>
    </div>
  );
}