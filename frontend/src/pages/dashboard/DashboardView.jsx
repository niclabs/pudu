import { useEffect, useState } from "react";
import { AuthService } from "@/utils/authservice";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function StatCard({ title, value, icon }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await AuthService.fetchWithAuth(
                    `http://127.0.0.1:8000/api/tags/?review_id=${reviewId}`
                );
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (reviewId) fetchStats();
    }, [reviewId]);

    if (loading) return <div className="p-6">Cargando estadísticas...</div>;
    if (!stats) return <div className="p-6">No se encontraron datos.</div>;

    const pieOptions = {
        chart: { type: 'pie', height: 300 },
        title: { text: 'Progreso de la Revisión' },
        series: [{
            name: 'Estudios',
            data: [
                { name: 'Completados', y: stats.reviewed, color: '#4c1d95' }, 
                { name: 'Pendientes', y: stats.pending, color: '#ddd6fe' },
                { name: 'Alertas', y: stats.flagged, color: '#fbbf24' },
                { name: 'Totales', y: stats.total, color: '#a78bfa' }
            ]
        }]
    };

    // const lineOptions = {
    //     chart: { type: 'column', height: 300 },
    //     title: { text: 'Estudios por Año de Publicación' },
    //     xAxis: {
    //         categories: stats.years.map(y => y.year) 
    //     },
    //     yAxis: { title: { text: 'Cantidad' } },
    //     series: [{
    //         name: 'Publicaciones',
    //         data: stats.years.map(y => y.count), 
    //         color: '#6d28d9'
    //     }]
    // };

    return (
        <div className="p-6 space-y-6 bg-violet-50/30 min-h-screen">
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-violet-900">Project Dashboard</h1>
                <button className="bg-violet-900 text-white px-4 py-2 rounded shadow hover:bg-violet-800">
                    Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                    title="Total" 
                    value={stats.total} 
                    icon={<FileText className="h-4 w-4 text-gray-500" />} 
                />
                <StatCard 
                    title="Included" 
                    value={stats.reviewed} 
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />} 
                />
                <StatCard 
                    title="Excluded" 
                    value={stats.pending - stats.included} 
                    icon={<XCircle className="h-4 w-4 text-red-500" />} 
                />
                <StatCard 
                    title="Flagged / Conflicts" 
                    value={stats.flagged} 
                    icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <button className="w-full text-left px-4 py-2 text-sm font-medium bg-white border hover:bg-gray-50 rounded">
                                Filter by Author
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm font-medium bg-white border hover:bg-gray-50 rounded">
                                Filter by Year range
                            </button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-2 shadow-sm">
                         <HighchartsReact highcharts={Highcharts} options={pieOptions} />
                    </Card>
                    {/* <Card className="p-2 shadow-sm">
                         <HighchartsReact highcharts={Highcharts} options={lineOptions} />
                    </Card> */}
                </div>
            </div>
        </div>
    );
}