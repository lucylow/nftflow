import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function EnhancedCard({ 
  children, 
  className, 
  hover = true, 
  clickable = false,
  onClick,
  delay = 0
}: EnhancedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? { 
        y: -4, 
        transition: { duration: 0.2 } 
      } : {}}
      className={cn(
        "transition-all duration-200",
        clickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <Card className={cn(
        "h-full transition-all duration-200",
        hover && "hover:shadow-lg hover:shadow-primary/5",
        clickable && "hover:border-primary/50"
      )}>
        {children}
      </Card>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  className,
  delay = 0
}: StatCardProps) {
  return (
    <EnhancedCard delay={delay} className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <motion.span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
              animate={{ 
                scale: [1, 1.05, 1],
                transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
              }}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </motion.span>
            <span className="text-xs text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  className?: string;
  delay?: number;
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  features, 
  className,
  delay = 0
}: FeatureCardProps) {
  return (
    <EnhancedCard delay={delay} className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-primary/10 rounded-lg"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + (index * 0.1) }}
            >
              <motion.div
                className="w-1.5 h-1.5 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 0.5, 
                  delay: delay + (index * 0.1),
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
              {feature}
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </EnhancedCard>
  );
}



