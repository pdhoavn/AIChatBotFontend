import { useState } from 'react';
import { TrendingUp, Download, Calendar, MessageSquare, Users, ThumbsUp, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/system_users/card';
import { Button } from '../ui/system_users/button';
import { Badge } from '../ui/system_users/badge';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/system_users/select';
import { Progress } from '../ui/system_users/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const engagementData = [
  { date: 'Oct 1', conversations: 245, satisfaction: 4.2, avgDuration: 3.5 },
  { date: 'Oct 2', conversations: 310, satisfaction: 4.4, avgDuration: 3.8 },
  { date: 'Oct 3', conversations: 278, satisfaction: 4.3, avgDuration: 3.2 },
  { date: 'Oct 4', conversations: 325, satisfaction: 4.5, avgDuration: 4.1 },
  { date: 'Oct 5', conversations: 290, satisfaction: 4.1, avgDuration: 3.6 },
  { date: 'Oct 6', conversations: 180, satisfaction: 4.0, avgDuration: 3.0 },
  { date: 'Oct 7', conversations: 150, satisfaction: 3.9, avgDuration: 2.8 },
];

const categoryData = [
  { name: 'Admissions', value: 420, color: 'hsl(var(--chart-1))' },
  { name: 'Financial Aid', value: 280, color: 'hsl(var(--chart-2))' },
  { name: 'Programs', value: 210, color: 'hsl(var(--chart-3))' },
  { name: 'Campus Life', value: 150, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 90, color: 'hsl(var(--chart-5))' },
];

const topQuestions = [
  { question: 'What are the application deadlines?', count: 342, trend: '+12%' },
  { question: 'How do I apply for financial aid?', count: 289, trend: '+8%' },
  { question: 'What GPA do I need?', count: 256, trend: '+15%' },
  { question: 'Can I schedule a campus tour?', count: 201, trend: '+5%' },
  { question: 'What scholarships are available?', count: 187, trend: '+22%' },
];

const responseEffectiveness = [
  { metric: 'Successfully Resolved', value: 94.2, target: 90 },
  { metric: 'Required Follow-up', value: 4.8, target: 10 },
  { metric: 'Escalated to Human', value: 1.0, target: 5 },
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  const handleExportReport = () => {
    // Mock export functionality
    alert('Report exported successfully!');
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <div>
              <h1>Analytics</h1>
              <p className="text-sm text-muted-foreground">Performance Insights</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="p-4 space-y-3 border-t">
          <h3 className="text-sm">Quick Stats</h3>
          <div className="space-y-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl">1,778</div>
                <p className="text-xs text-muted-foreground">Total Conversations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl">4.2</div>
                <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl">94%</div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 pb-8 space-y-6">
          {/* Header */}
          <div>
            <h2>Conversation Analytics</h2>
            <p className="text-muted-foreground">Monitor chatbot performance and user engagement</p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">1,778</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+23%</span> from last period
                </p>
                <Progress value={77} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">1,234</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18%</span> from last period
                </p>
                <Progress value={68} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Satisfaction Score</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">4.2/5</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+0.3</span> from last period
                </p>
                <Progress value={84} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Avg Session Length</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">3.5 min</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+0.8 min</span> from last period
                </p>
                <Progress value={70} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Trends</CardTitle>
                <CardDescription>Daily conversation volume and satisfaction scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="conversations" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Conversations"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Satisfaction"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Question Categories</CardTitle>
                <CardDescription>Distribution of questions by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Questions & Response Effectiveness */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Asked Questions</CardTitle>
                <CardDescription>Top 5 questions by frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topQuestions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="text-sm">{item.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.count} times asked
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {item.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Effectiveness</CardTitle>
                <CardDescription>How well the chatbot resolves queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {responseEffectiveness.map((item) => (
                    <div key={item.metric} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <span>{item.value}%</span>
                          <Badge variant="outline" className="text-xs">
                            Target: {item.target}%
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={item.value} 
                        className="h-2"
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-green-600" />
                      <span>All metrics meeting targets</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Engagement Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Session Duration Distribution</CardTitle>
              <CardDescription>Average conversation length over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgDuration" fill="hsl(var(--chart-3))" name="Avg Duration (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download analytics reports in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={handleExportReport}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}