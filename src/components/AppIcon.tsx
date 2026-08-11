import React from "react";
import * as Icons from "lucide-react";

interface AppIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = "", size = 20 }) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[name] || Icons.AppWindow;
  return <IconComponent className={className} size={size} />;
};
