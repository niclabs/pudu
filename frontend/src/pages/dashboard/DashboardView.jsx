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

// tag and author filters are handled by the backend for the main stats,
export default function DashboardView() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const reviewId = sessionStorage.getItem('review_id');

    const [yearRange, setYearRange] = useState({ start: '', end: '' });
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');

    const [chartType, setChartType] = useState('column');
    const [breakdownBy, setBreakdownBy] = useState('none');

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
            if (selectedTag) filters.tag = selectedTag;
            if (selectedAuthor) filters.author = selectedAuthor;
            if (breakdownBy !== 'none') filters.parent_tag = breakdownBy;

            fetchStats(filters);
        }, 500);

        return () => clearTimeout(timer);
    }, [reviewId, yearRange, selectedTag, selectedAuthor, breakdownBy]);



    if (loading) return <div className="p-6">Cargando estadísticas...</div>;
    if (!stats) return <div className="p-6">No se encontraron datos.</div>;

    const availableTags = stats.available_tags || [];
    const availableAuthors = stats.available_authors || [];
    const availableParentTags = stats.root_tags || [];

    let chartCategories = stats.years.map(y => y.year);
    let chartSeries = [];
    let chartTitle = `Studies by Year`;

    // breakdown by tag
    if (breakdownBy !== 'none') {
        chartTitle = `Studies of ${breakdownBy} over Time`;

        const parentToChildren = {};
        const hierarchy = stats.tag_hierarchy || [];
        hierarchy.forEach(item => {
            const p = item.parent_tag__name;
            if (p) {
                if (!parentToChildren[p]) parentToChildren[p] = [];
                parentToChildren[p].push(item.name);
            }
        });

        // recursive descendants of a tag
        const immediateChildren = parentToChildren[breakdownBy] || [];
        const getDescendants = (node, visited = new Set()) => {
            let descendants = [];
            const children = parentToChildren[node] || [];
            visited.add(node);
            children.forEach(child => {
                if (!visited.has(child)) {
                    descendants.push(child);
                    descendants = descendants.concat(getDescendants(child, new Set(visited)));
                }
            });
            return descendants;
        };

        // for each immediate child, create a series with all its descendants
        chartSeries = immediateChildren.sort().map(childName => {
            // the child itself + all its descendants, count by year
            const tagsToAggregate = [childName, ...getDescendants(childName)];
            const relevantStats = stats.tag_stats.filter(t => tagsToAggregate.includes(t.tags__name));
            const tagMap = {};

            relevantStats.forEach(t => {
                tagMap[t.year] = (tagMap[t.year] || 0) + t.count;
            });

            const dataPoints = chartCategories.map(year => tagMap[year] || 0);

            return {
                name: childName,
                data: dataPoints
            };
        });

        // if no children found
        if (chartSeries.length === 0) {
            const validStats = stats.tag_stats.filter(t => t.tags__parent_tag__name === breakdownBy);
            const childTags = Array.from(new Set(validStats.map(t => t.tags__name))).sort();
            chartSeries = childTags.map(tagName => {
                const tagData = validStats.filter(t => t.tags__name === tagName);
                const tagMap = {};
                tagData.forEach(t => tagMap[t.year] = t.count);
                const dataPoints = chartCategories.map(year => tagMap[year] || 0);
                return { name: tagName, data: dataPoints };
            });
        }

    } else {
        // Simple chart
        if (selectedTag && selectedAuthor) {
            chartTitle = `Studies with tag "${selectedTag}" and author "${selectedAuthor}" by Year`;
        } else if (selectedTag) {
            chartTitle = `Studies with tag "${selectedTag}" by Year`;
        } else if (selectedAuthor) {
            chartTitle = `Studies with author "${selectedAuthor}" by Year`;
        }

        chartSeries = [{
            name: 'Publications',
            data: stats.years.map(y => y.count),
            color: '#6d28d9'
        }];
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
        chart: {
            type: chartType,
            height: null
        },
        title: { text: chartTitle },
        xAxis: {
            categories: chartCategories,
            gridLineWidth: 1
        },
        yAxis: {
            title: { text: 'Quantity' },
            gridLineWidth: 1
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: true
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        series: chartSeries
    };

    return (
        <div className="p-6 space-y-4 bg-violet-50 h-full">
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Chart Options</CardTitle>
                            <div className="flex bg-violet-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setChartType('column')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${chartType === 'column' ? 'bg-white text-violet-900 shadow-sm font-medium' : 'text-violet-600'}`}
                                >
                                    Bar
                                </button>
                                <button
                                    onClick={() => setChartType('line')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${chartType === 'line' ? 'bg-white text-violet-900 shadow-sm font-medium' : 'text-violet-600'}`}
                                >
                                    Line
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4">

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Group by Parent Tag</label>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={breakdownBy}
                                    onChange={(e) => setBreakdownBy(e.target.value)}
                                >
                                    <option value="none">None (Total)</option>
                                    {availableParentTags.map(parent => (
                                        <option key={parent} value={parent}>{parent}</option>
                                    ))}
                                </select>
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

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Filter by Author</label>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={selectedAuthor}
                                    onChange={(e) => setSelectedAuthor(e.target.value)}
                                >
                                    <option value="">All Authors</option>
                                    {availableAuthors.map(author => (
                                        <option key={author} value={author}>{author}</option>
                                    ))}
                                </select>
                            </div>

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

                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                    <Card className="md:col-span-2 p-2 shadow-sm h-full">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={lineOptions}
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