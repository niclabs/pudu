import { useEffect, useState } from "react";
import { AuthService } from "@/utils/authservice";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, CheckCircle, CircleDashed, AlertTriangle } from "lucide-react";

function StatCard({ title, value, icon, subtitle }) {
    return (
        <Card className="bg-violet-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col space-y-1">
                    <CardTitle className="text-xl font-medium">
                        {title}
                    </CardTitle>
                    <CardDescription className={`text-base text-muted-foreground ${!subtitle ? 'invisible' : ''}`}>
                        {subtitle || "Placeholder"}
                    </CardDescription>
                </div>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}

export default function DashboardView() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const reviewId = sessionStorage.getItem('review_id');

    const [yearRange, setYearRange] = useState({ start: '', end: '' });

    const fetchStats = async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams({ review_id: reviewId, ...filters });
            const response = await AuthService.fetchWithAuth(
                `http://127.0.0.1:8000/api/dashboard/stats/?${queryParams.toString()}`
            );
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reviewId) fetchStats();
    }, [reviewId]);

    const handleApplyFilters = () => {
        const filters = {};
        if (yearRange.start) filters.start_year = yearRange.start;
        if (yearRange.end) filters.end_year = yearRange.end;
        fetchStats(filters);
    };

    if (loading) return <div className="p-6">Cargando estadísticas...</div>;
    if (!stats) return <div className="p-6">No se encontraron datos.</div>;

    const pieOptions = {
        chart: { type: 'pie' },
        title: { text: 'Review Progress' },
        series: [{
            name: 'Estudios',
            data: [
                { name: 'Reviewed', y: stats.reviewed, color: '#4c1d95' },
                { name: 'Pending', y: stats.pending, color: '#ddd6fe' },
                { name: 'Flagged / Missing Data', y: stats.flagged + stats.missing_data, color: '#ffcf55ff' },
            ]
        }]
    };

    const lineOptions = {
        chart: { type: 'column' },
        title: { text: 'Studies by Publication Year' },
        xAxis: {
            categories: stats.years.map(y => y.year)
        },
        yAxis: { title: { text: 'Quantity' } },
        series: [{
            name: 'Publications',
            data: stats.years.map(y => y.count),
            color: '#6d28d9'
        }]
    };

    return (
        <div className="p-6 space-y-6 bg-violet-50 h-[calc(100vh-64px)]">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total"
                    subtitle="Studies can have more than one flag"
                    value={stats.total}
                    icon={<FileText className="h-6 w-6 text-gray-500" />}
                />
                <StatCard
                    title="Reviewed"
                    value={stats.reviewed}
                    icon={<CheckCircle className="h-6 w-6 text-green-500" />}
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<CircleDashed className="h-6 w-6 text-blue-500" />}
                />
                <StatCard
                    title="Flagged / Missing Data"
                    value={stats.flagged + stats.missing_data}
                    icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                <div className="lg:col-span-1 space-y-4">
                    <Card className="min-h-[560px]">
                        <CardHeader>
                            <CardTitle className="text-lg">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Year Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 border rounded text-sm"
                                        value={yearRange.start}
                                        onChange={(e) => setYearRange({ ...yearRange, start: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 border rounded text-sm"
                                        value={yearRange.end}
                                        onChange={(e) => setYearRange({ ...yearRange, end: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleApplyFilters}
                                className="w-full bg-violet-900 text-white px-4 py-2 rounded shadow hover:bg-violet-800 text-sm font-medium"
                            >
                                Apply Filters
                            </button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <Card className="p-2 shadow-sm h-full">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={{ ...lineOptions, chart: { ...lineOptions.chart, height: null } }}
                        />
                    </Card>
                    <Card className="p-2 shadow-sm h-full">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={{ ...pieOptions, chart: { ...pieOptions.chart, height: null } }}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}