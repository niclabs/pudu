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
  import { BookText } from "lucide-react";
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
      localStorage.setItem('review_name', reviewData.find(review => review.id === reviewID).title);
      window.dispatchEvent(new Event("reviewNameUpdated") )
      
    }
  
    useEffect(() => {
      fetchSysRevData();
    }, []);

    return (
      <div className="bg-violet-50 h-[calc(100vh-65px)] flex flex-col">
  <div className="max-w-screen-xl w-full mx-auto px-4 lg:px-8 mb-4">
    <div className="flex items-center justify-between">
      <div className="mt-4">
        <h1 className="text-4xl font-bold text-left mb-1">Your Systematic Reviews</h1>
        <p className="text-left text-gray-600">Review selection and management.</p>
      </div>
      <Button className="bg-violet-900 text-violet-50 font-bold text-xl p-6 hover:bg-violet-950">
        <BookText className="mr-2" /> Create New Review
      </Button>
    </div>
  </div>

  <div className="flex-1 p-2 overflow-y-auto">
    <div className="max-w-screen-xl w-full mx-auto px-4 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-6">
      {reviewData.map((review) => (
        <Card
          key={review.id}
         className="h-[225px] min-h-[180px] flex flex-col justify-between transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-[1.01] duration-300 hover:shadow-lg cursor-pointer bg-violet-100 hover:bg-violet-200"
        >
          <div onClick={() => pickReview(review.id)} className="flex flex-col h-full cursor-pointer">
          <CardHeader className="p-2 items-cente text-center h-16">
          <CardTitle className=" h-18 font-semibold line-clamp-3 leading-snug" title={review.title}>
            {review.title}
          </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 p-4 gap-2">
  <div className="flex justify-between">
    <span className="font-semibold">Start Date:</span>
    <span>{review.start_date}</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold">End Date:</span>
    <span>{review.end_date || "-"}</span>
  </div>
  <div className="flex justify-between items-center mt-auto pt-2">
    <div className="flex items-center gap-2">
      <span className="font-semibold">Status:</span>
      <Badge
        className={`shadow-sm text-slate-100 ${
          review.status === "Ongoing" ? "bg-cyan-500" : "bg-emerald-600"
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
