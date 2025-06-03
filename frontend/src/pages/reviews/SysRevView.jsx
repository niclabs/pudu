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
    const [reviewData, setReviewData] = useState([]);

    const fetchSysRevData = async () => {
      const response = await fetch("http://localhost:8000/api/reviews/");
      const data = await response.json();
      console.log(data)

      const formattedData = data.map((item) => ({
        id: item.id,
        title: item.name,
        start_date: item.start_date?.split("T")[0],
        end_date: item.end_date?.split("T")[0],
        status: item.status ?  "Ongoing" : "Finished",
      }));
      setReviewData(formattedData);
    }
    
    const pickReview = (reviewID) => {
      console.log("AAA", reviewID);
      localStorage.setItem('review_id', reviewID);
    }
  
    useEffect(() => {
      fetchSysRevData();
    }, []);

    return (
      <div className="flex flex-wrap gap-6 justify-center m-10 overflow-y-auto h-[calc(100vh-150px)]">
        {reviewData.map((review) => (
          <Card key={review.id} className="w-md h-60 bg-violet-200 hover:bg-violet-300">
            <div onClick={() => pickReview(review.id)} className="cursor-pointer">
            <CardHeader className="p-4 h-20">
              <CardTitle className="font-bold">{review.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div>
                <b>Start Date:</b> {review.start_date}
              </div>
              <div>
                {review.end_date && (
                <span> <b>End Date: </b> {review.end_date} </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <b>Status:</b>
                  <Badge className="transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 shadow-sm text-violet-50 border-violet-950 bg-violet-950 ">
                    {review.status}
                  </Badge>
                </div>
                <Button
                  className="bg-violet-900 text-violet-50 text-xs hover:bg-violet-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    // llenar con logica dps
                    console.log("Edit clicked for", review.id);
                  }}
                >
                  Edit Systematic Review
                </Button>
              </div>
            </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  export default SysRevView;
