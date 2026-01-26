import { useEffect, useState } from "react";
import { AuthService } from "@/utils/authservice";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, CheckCircle, CircleDashed, AlertTriangle } from "lucide-react";
import CustomChartWidget from "./CustomChartWidget";

function StatCard({ title, value, icon, subtitle }) {
    return (
        <Card className="bg-violet-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col space-y-1">
                    <CardTitle className="text-sm font-medium">
                        {title}
                    </CardTitle>
                    <CardDescription className={`text-xs text-muted-foreground ${!subtitle ? 'invisible' : ''}`}>
                        {subtitle || "Placeholder"}
                    </CardDescription>
                </div>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}

export default function DashboardView() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const reviewId = sessionStorage.getItem('review_id');

    const [yearRange, setYearRange] = useState({ start: '', end: '' });
    const [selectedTag, setSelectedTag] = useState('');

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
        if (!reviewId) return;

        const timer = setTimeout(() => {
            const filters = {};
            if (yearRange.start) filters.start_year = yearRange.start;
            if (yearRange.end) filters.end_year = yearRange.end;
            fetchStats(filters);
        }, 500);

        return () => clearTimeout(timer);
    }, [reviewId, yearRange]);



    if (loading) return <div className="p-6">Cargando estadísticas...</div>;
    if (!stats) return <div className="p-6">No se encontraron datos.</div>;

    const availableTags = stats.tag_stats ? Array.from(new Set(stats.tag_stats.map(t => t.tags__name))).sort() : [];

    let chartCategories = stats.years.map(y => y.year);
    let chartData = stats.years.map(y => y.count);
    let chartTitle = 'Studies by Publication Year';

    if (selectedTag && stats.tag_stats) {
        chartTitle = `Studies with tag "${selectedTag}" by Year`;
        const tagData = stats.tag_stats.filter(t => t.tags__name === selectedTag);
        const tagMap = {};
        tagData.forEach(t => tagMap[t.year] = t.count);

        chartData = chartCategories.map(year => tagMap[year] || 0);
    }

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
        title: { text: chartTitle },
        xAxis: {
            categories: chartCategories
        },
        yAxis: { title: { text: 'Quantity' } },
        series: [{
            name: 'Publications',
            data: chartData,
            color: '#6d28d9'
        }]
    };

    return (
        <div className="p-6 space-y-4 bg-violet-50 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total"
                    subtitle="Studies can have more than one flag"
                    value={stats.total}
                    icon={<FileText className="h-4 w-4 text-gray-500" />}
                />
                <StatCard
                    title="Reviewed"
                    value={stats.reviewed}
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<CircleDashed className="h-4 w-4 text-blue-500" />}
                />
                <StatCard
                    title="Flagged / Missing Data"
                    value={stats.flagged + stats.missing_data}
                    icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                <div className="lg:col-span-1 space-y-4">
                    <Card className="min-h-[350px]">
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

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Filter by Tag</label>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                >
                                    <option value="">All Tags</option>
                                    {availableTags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>


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