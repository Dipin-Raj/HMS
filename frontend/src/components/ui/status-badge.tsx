import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/10 text-success border border-success/20',
        warning: 'bg-warning/10 text-warning-foreground border border-warning/20',
        destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
        info: 'bg-info/10 text-info border border-info/20',
        primary: 'bg-primary/10 text-primary border border-primary/20',
        muted: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        default: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  dot?: boolean;
}

export function StatusBadge({ className, variant, size, dot = false, children, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'destructive' && 'bg-destructive',
            variant === 'info' && 'bg-info',
            variant === 'primary' && 'bg-primary',
            (!variant || variant === 'default' || variant === 'muted') && 'bg-muted-foreground'
          )}
        />
      )}
      {children}
    </span>
  );
}
