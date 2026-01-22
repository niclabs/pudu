import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Asumiendo Shadcn
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
    const stats = {
        total: 1250,
        reviewed: 450,
        included: 120,
        flagged: 15
    };

    const pieOptions = {
        chart: { type: 'pie', height: 300 },
        title: { text: 'Progress' },
        series: [{
            name: 'Studies',
            data: [
                { name: 'Completed', y: stats.reviewed, color: '#4c1d95' }, 
                { name: 'Pending', y: stats.total - stats.reviewed, color: '#ddd6fe' } 
            ]
        }]
    };

    const lineOptions = {
        chart: { height: 300 },
        title: { text: 'Publication Year' },
        series: [{
            data: [10, 25, 15, 60, 100, 150] 
        }]
    };

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
                    value={stats.included} 
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />} 
                />
                <StatCard 
                    title="Excluded" 
                    value={stats.reviewed - stats.included} 
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
                    <Card className="p-2 shadow-sm">
                         <HighchartsReact highcharts={Highcharts} options={lineOptions} />
                    </Card>
                </div>
            </div>
        </div>
    );
}