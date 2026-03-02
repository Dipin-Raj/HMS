import { motion } from 'framer-motion';
import {
  Pill,
  AlertTriangle,
  TrendingUp,
  Package,
  ChevronRight,
  BrainCircuit,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data
const stockAlerts = [
  { id: '1', medicine: 'Amoxicillin 500mg', current: 45, reorder: 100, severity: 'critical' },
  { id: '2', medicine: 'Paracetamol 500mg', current: 23, reorder: 200, severity: 'critical' },
  { id: '3', medicine: 'Ibuprofen 400mg', current: 78, reorder: 150, severity: 'low' },
  { id: '4', medicine: 'Metformin 850mg', current: 92, reorder: 100, severity: 'low' },
];

const demandForecast = [
  { medicine: 'Amoxicillin', current: 45, predicted: 120, confidence: 85 },
  { medicine: 'Paracetamol', current: 23, predicted: 180, confidence: 92 },
  { medicine: 'Ibuprofen', current: 78, predicted: 95, confidence: 78 },
  { medicine: 'Omeprazole', current: 120, predicted: 85, confidence: 88 },
];

const usageTrends = [
  { month: 'Oct', dispensed: 1250, returned: 45 },
  { month: 'Nov', dispensed: 1420, returned: 52 },
  { month: 'Dec', dispensed: 1680, returned: 38 },
  { month: 'Jan', dispensed: 1520, returned: 41 },
];

const topDispensed = [
  { name: 'Paracetamol', count: 342 },
  { name: 'Amoxicillin', count: 278 },
  { name: 'Omeprazole', count: 245 },
  { name: 'Metformin', count: 198 },
  { name: 'Ibuprofen', count: 187 },
];

export default function PharmacyDashboard() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground">Inventory management and AI forecasting</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search medicines..." className="pl-9 w-64" />
          </div>
          <Button asChild>
            <Link to="/pharmacy/inventory">
              <Package className="mr-2 h-4 w-4" />
              Manage Stock
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Medicines"
          value="1,247"
          subtitle="In stock"
          icon={Pill}
          variant="primary"
        />
        <StatCard
          title="Low Stock Items"
          value={4}
          subtitle="2 critical"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="This Month Dispensed"
          value="1,520"
          change={12}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Expiring Soon"
          value={8}
          subtitle="Within 30 days"
          icon={Package}
          variant="info"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stock Alerts */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Stock Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/pharmacy/alerts">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{alert.medicine}</p>
                        <StatusBadge
                          variant={alert.severity === 'critical' ? 'destructive' : 'warning'}
                          dot
                        >
                          {alert.severity}
                        </StatusBadge>
                      </div>
                      <Progress
                        value={(alert.current / alert.reorder) * 100}
                        className={`h-2 ${
                          alert.severity === 'critical'
                            ? '[&>div]:bg-destructive'
                            : '[&>div]:bg-warning'
                        }`}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {alert.current} units remaining • Reorder at {alert.reorder}
                      </p>
                    </div>
                    <Button size="sm">Reorder</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Dispensed */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Top Dispensed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDispensed} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Forecast & Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Demand Forecast */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI Demand Forecast
              </CardTitle>
              <StatusBadge variant="info">Next 30 Days</StatusBadge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandForecast.map((item) => (
                  <div key={item.medicine} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{item.medicine}</p>
                      <span className="text-xs text-muted-foreground">
                        {item.confidence}% confidence
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Current: {item.current}</span>
                          <span>Predicted: {item.predicted}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item.current / item.predicted) * 100}%` }}
                          />
                        </div>
                      </div>
                      {item.predicted > item.current && (
                        <StatusBadge variant="warning" size="sm">
                          Order {item.predicted - item.current}
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Predictions based on historical dispensing patterns
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Trends */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="dispensed"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="returned"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--warning))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
