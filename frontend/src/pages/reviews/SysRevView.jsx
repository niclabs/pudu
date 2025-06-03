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
  import { Calendar } from "lucide-react";
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
      <div className="bg-violet-50 p-4">
        <div>
         <h2 className="text-2xl font-bold text-center mb-4">Your Systematic Reviews</h2>
         <p className="text-center text-gray-600 mb-2">Review Selection.</p>
        </div>
      
        <div className="flex-1 h-full overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-60 h-[calc(100vh-170px)]">
          {reviewData.map((review) => (
            <Card key={review.id} 
              className=" transition mt-1 w-110 ease-in-out delay-150 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-lg cursor-pointer bg-violet-100 hover:bg-violet-200 h-full">
              <div onClick={() => pickReview(review.id)} className="cursor-pointer">
              <CardHeader className="p-2 pl-4 pr-4 h-20">
              <CardTitle className="font-semibold" title={review.title}>
                    {review.title}
                  </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div>
                  <b>Start Date:</b> {review.start_date}
                </div>
                <div>
                  {review.end_date ? (
                  <span> <b>End Date: </b> {review.end_date} </span>
                  )
                : <span>&nbsp;</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <b>Status:</b>
                    <Badge
                      className={`shadow-sm text-violet-200 border-violet-950 ${
                        review.status === "Ongoing" ? "bg-violet-400" : "bg-violet-950"
                      }`}
                    >
                      {review.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-violet-800 text-white hover:bg-violet-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Edit clicked for", review.id);
                    }}
                  >
                    Edit Review
                  </Button>
                </div>
              </CardContent>
              </div>
            </Card>
            
          ))}
          </div>
        </div>
      </div>
    );
  }
  
  export default SysRevView;
