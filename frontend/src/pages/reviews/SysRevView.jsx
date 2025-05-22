import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../../components/ui/card";
  import { Input } from "../../components/custom/input";
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"

  function SysRevView() {
    /*
    {
        ID
        Title
        Start Date
        End Date
        Status - bool traduce a finished o ongoing
    }
    */ 
   const dummyData =
   {
    "id": 1,
    "title": "Baby Yoda found dead in Miami: A systematic Review",
    "startdate": "1993-08-15",
    "enddate": "2025-05-22",
    "status": "Finished",
    }
    
    return(
        <div>
  <Card className="w-md h-60 m-20 bg-violet-200">
    <CardHeader className="p-4">
      <CardTitle className="font-bold">{dummyData.title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <div>
        <b>Start Date:</b> {dummyData.startdate}
      </div>
      <div>
        <b>End Date: </b> {dummyData.enddate}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <b>Status:</b>
          <Badge className="transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 shadow-sm border-violet-950 bg-violet-950 text-violet-50">
            {dummyData.status}
          </Badge>
        </div>
        <Button className="bg-violet-900 text-violet-50 text-xs hover:bg-violet-950">
          Edit Systematic Review
        </Button>
      </div>
    </CardContent>
  </Card>
</div>

    )
}
  export default SysRevView

