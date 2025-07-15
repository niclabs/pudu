"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/custom/switch"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "../../components/custom/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookText } from "lucide-react"
import { AuthService } from '/src/utils/authservice.jsx';
import { Toaster, toast } from 'sonner'


function SysRevView() {
  const [reviewData, setReviewData] = useState([])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [deleteReviewOpen, setDeleteReviewOpen] = useState(false)
  const [editingReviewName, setEditingReviewName] = useState("")
  const [editingReviewID, setEditingReviewID] = useState(null)
  const [editingReviewStartDate, setEditingReviewStartDate] = useState(null)
  const [editingReviewEndDate, setEditingReviewEndDate] = useState(null)
  const [editingReviewStatus, setEditingReviewStatus] = useState(false)


  const fetchSysRevData = async () => {
    const token = AuthService.getAccessToken();
    const response = await fetch("http://localhost:8000/api/reviews/", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      console.error("Failed to fetch reviews:", response.statusText);
      return;
    }
  
    const data = await response.json();
    console.log(data);
    const formattedData = data.map((item) => ({
      id: item.id,
      title: item.name,
      start_date: item.start_date?.split("T")[0],
      end_date: item.end_date?.split("T")[0],
      status: item.status,
    }));
    setReviewData(formattedData);
  };

  const createReview = async () => {
    try {
      const token = AuthService.getAccessToken();
      const reviewData = {
        name: "Untitled Review",
      };
  
      const response = await fetch("http://localhost:8000/api/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify(reviewData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        throw new Error("Failed to create review");
      }
  
      const newReview = await response.json();
      await fetchSysRevData();
  
      // Set current review to open for editing
      setEditingReviewName(newReview.name || "");
      setEditingReviewStartDate(newReview.start_date?.split("T")[0] || null);
      setEditingReviewEndDate(newReview.end_date?.split("T")[0] || null);
      setEditingReviewStatus(newReview.status);
      setEditingReviewID(newReview.id);
      setReviewOpen(true);
  
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };
  const saveReview = async () => {
    try {
      const reviewData = {
        name: editingReviewName,
        start_date: editingReviewStartDate,
        end_date: editingReviewEndDate,
        status: editingReviewStatus,
      }

      const response = await fetch(`http://localhost:8000/api/reviews/${editingReviewID}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        throw new Error("Failed to update review")
      }

      // Refresh the data and close modal
      await fetchSysRevData()
      setReviewOpen(false)
    } catch (error) {
      console.error("Error saving review:", error)
    }
  }

  const deleteReview = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/reviews/${editingReviewID}/`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete review")
      }

      // Refresh the data and close modals
      await fetchSysRevData()
      setDeleteReviewOpen(false)
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }



  const pickReview = (reviewID) => {
    localStorage.setItem("review_id", reviewID)
    localStorage.setItem("review_name", reviewData.find((review) => review.id === reviewID).title)
    window.dispatchEvent(new Event("reviewNameUpdated"))
    toast.success("Review Picked!")

  }

  useEffect(() => {
    fetchSysRevData()
  }, [])

  return (
    <div className="bg-violet-50 h-[calc(100vh-65px)] flex flex-col">
      <Toaster richColors />
      <div className="max-w-screen-xl w-full mx-auto px-4 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <div className="mt-4">
            <h1 className="text-4xl font-bold text-left mb-1">Your Systematic Reviews</h1>
            <p className="text-left text-gray-600">Review selection and management.</p>
          </div>
          <Button
            className="bg-violet-900 text-violet-50 font-bold text-xl p-6 hover:bg-violet-950"
            onClick={createReview}
          >
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
                      <Badge className={`shadow-sm text-slate-100 ${review.status ? "bg-emerald-600" : "bg-cyan-500"}`}>
                        {review.status ? "Finished" : "Ongoing"}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="bg-violet-800 text-white hover:bg-violet-900"
                      onClick={(e) => {
                        e.stopPropagation()
                        setReviewOpen(true)
                        setEditingReviewName(review.title)
                        setEditingReviewStartDate(review.start_date || null)
                        setEditingReviewEndDate(review.end_date || null)
                        setEditingReviewID(review.id)
                        setEditingReviewStatus(review.status)
                      }}
                    >
                      Edit Details
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}

          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogContent className="bg-indigo-100 border-violet-200 max-w-md">
              <DialogHeader className="space-y-3">
                <DialogTitle className=" font-bold">Edit Review</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Update the details for your systematic review.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className=" font-bold">Review Name</label>
                  <Input
                    value={editingReviewName}
                    onChange={(e) => setEditingReviewName(e.target.value)}
                    placeholder="Enter review name"
                    className="focus:border-violet-950 focus:ring-violet-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className=" font-bold">Start Date</label>
                    <Input
                      type="date"
                      value={editingReviewStartDate}
                      onChange={(e) => setEditingReviewStartDate(e.target.value)}
                      className="focus:border-violet-950 focus:ring-violet-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className=" font-bold">End Date</label>
                    <Input
                      type="date"
                      value={editingReviewEndDate}
                      onChange={(e) => setEditingReviewEndDate(e.target.value)}
                      className=" focus:border-violet-950 focus:ring-violet-950"
                    />
                  </div>
                </div>
                <label className=" font-bold">Status</label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      
                    <Badge
                        className={`text-sm font-medium ${!editingReviewStatus ? "bg-cyan-500 text-slate-100" : "text-black"}`}
                      >
                        Ongoing
                      </Badge>
                      <Switch
                        checked={editingReviewStatus}
                        onCheckedChange={setEditingReviewStatus}
                      />
                      <Badge
                        className={`text-sm font-medium ${editingReviewStatus ? "bg-emerald-600 text-slate-100" : "text-black"}`}
                      >
                        Finished
                      </Badge>
                     
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
              <Button
                  variant="destructive"
                  onClick={() => {
                    setReviewOpen(false)
                    setDeleteReviewOpen(true)
                  }}
                  className="bg-red-600 text-violet-50 hover:bg-red-800 font-bold"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setReviewOpen(false)}
                  className=" text-violet-700 hover:bg-violet-200"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950 font-bold"
                  onClick={async () => {
                    await saveReview();
                    setReviewOpen(false);
                  }}
                >
                  Update
                </Button>
                
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteReviewOpen} onOpenChange={setDeleteReviewOpen}>
            <DialogContent className=" bg-violet-50">
              <DialogHeader>
                <DialogTitle>Deleting Review</DialogTitle>
              </DialogHeader>
              <b>{editingReviewName}</b>
              <div>This review and all of its content is being deleted.</div>
              <div>This action cannot be undone.</div>
              <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
                <Button
                  variant="outline"
                  onClick={() => setDeleteReviewOpen(false)}
                  className="border-violet-700 text-violet-700 hover:bg-violet-200"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-violet-50 hover:bg-red-800"
                  onClick={() => {
                    deleteReview();
                    setDeleteReviewOpen(false);
                  }}
                >
                  Delete Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default SysRevView
