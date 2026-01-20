import { useEffect } from "react";


export default function DashboardView() {
    const reviewId = sessionStorage.getItem('review_id');
    useEffect(() => {
        if (!reviewId) {
            window.location.href = "/";
        }
    }, [reviewId]);

    return (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to the Dashboard!</p>
    </div>
    );
}