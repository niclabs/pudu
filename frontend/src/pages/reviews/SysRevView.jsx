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
    const dummyData = [
      {
        id: 1,
        title: "Baby Yoda found dead in Miami: A Systematic Review",
        startdate: "1993-08-15",
        enddate: "2025-05-22",
        status: "Finished",
      },
      {
        id: 2,
        title: "The Return of Baby Yoda: Yet another Systematic Review",
        startdate: "2023-01-10",
        enddate: "2024-12-15",
        status: "Ongoing",
      },
      {
        id: 3,
        title: "Systematic Review of Force-Sensitive Objects",
        startdate: "2015-04-01",
        enddate: "2019-07-22",
        status: "Finished",
      },
      {
        id: 4,
        title: "A Meta-Analysis on Mandalorian Parenting Styles",
        startdate: "2019-03-14",
        enddate: "2021-09-10",
        status: "Finished",
      },
      {
        id: 5,
        title: "Space Travel and Health Outcomes: A Systematic Review",
        startdate: "2020-11-11",
        enddate: "2023-05-01",
        status: "Ongoing",
      },
      {
        id: 6,
        title: "The Impact of Lightsaber Use on Public Safety",
        startdate: "2018-06-30",
        enddate: "2020-01-20",
        status: "Finished",
      },
      {
        id: 7,
        title: "Data transmission protocols in Rebel Alliance Communications",
        startdate: "2021-01-01",
        enddate: "2022-12-31",
        status: "Ongoing",
      },
      {
        id: 8,
        title: "The Dark Side of Peer Review: A Galactic Perspective",
        startdate: "2017-08-19",
        enddate: "2021-04-04",
        status: "Finished",
      },
      {
        id: 9,
        title: "Systematic Review of Droid Workforce Efficiency",
        startdate: "2016-02-15",
        enddate: "2018-08-09",
        status: "Finished",
      },
      {
        id: 10,
        title: "Evaluating the Effectiveness of imperial training programs",
        startdate: "2014-10-01",
        enddate: "2020-02-28",
        status: "Finished",
      },
    ];
  
    return (
      <div className="flex flex-wrap gap-6 justify-center m-10 overflow-y-auto h-[calc(100vh-150px)]">
        {dummyData.map((review) => (
          <Card key={review.id} className="w-md h-60 bg-violet-200 hover:bg-violet-300">
            <CardHeader className="p-4 h-20">
              <CardTitle className="font-bold">{review.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div>
                <b>Start Date:</b> {review.startdate}
              </div>
              <div>
                <b>End Date: </b> {review.enddate}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <b>Status:</b>
                  <Badge className="transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 shadow-sm text-violet-50 border-violet-950 bg-violet-950 ">
                    {review.status}
                  </Badge>
                </div>
                <Button className="bg-violet-900 text-violet-50 text-xs hover:bg-violet-950">
                  Edit Systematic Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  export default SysRevView;
