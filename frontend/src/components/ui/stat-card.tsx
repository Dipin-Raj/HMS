import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const iconBgClasses = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('stat-card', className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {typeof change === 'number' && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', change >= 0 ? 'text-success' : 'text-destructive')}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{change >= 0 ? '+' : ''}{change}% from last week</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg', iconBgClasses[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
