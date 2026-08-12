import React from "react";
import { Reorder } from "framer-motion";
import { DesktopWidgetConfig } from "@/store/windowStore";
import { ClockWidget } from "../widgets/ClockWidget";
import { WeatherWidget } from "../widgets/WeatherWidget";
import { CalendarWidget } from "../widgets/CalendarWidget";
import { QuickNotesWidget } from "../widgets/QuickNotesWidget";
import { MiniCalcWidget } from "../widgets/MiniCalcWidget";
import { closeAllContextMenus } from "@/hooks/useContextMenuClose";

interface DesktopWidgetsLayerProps {
  desktopWidgets: DesktopWidgetConfig[];
  reorderWidgets: (newWidgets: DesktopWidgetConfig[]) => void;
  setWidgetMenu: (menu: { id: string; type: string; x: number; y: number } | null) => void;
}

export const DesktopWidgetsLayer: React.FC<DesktopWidgetsLayerProps> = ({
  desktopWidgets,
  reorderWidgets,
  setWidgetMenu,
}) => {
  return (
    <Reorder.Group
      axis="y"
      values={desktopWidgets}
      onReorder={reorderWidgets}
      className="absolute top-6 right-6 hidden md:flex flex-col flex-wrap gap-4 z-10 pointer-events-auto no-desktop-select max-h-[calc(100vh-100px)] overflow-x-auto overflow-y-hidden pr-1 no-scrollbar content-start items-end"
    >
      {desktopWidgets.map((w) => (
        <Reorder.Item
          key={w.id}
          value={w}
          id={w.id}
          whileDrag={{ scale: 1.04, zIndex: 15, cursor: "grabbing" }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAllContextMenus();
            setWidgetMenu({ id: w.id, type: w.type, x: e.clientX, y: e.clientY });
          }}
          className="relative group cursor-grab active:cursor-grabbing"
        >
          {w.type === "clock" && <ClockWidget />}
          {w.type === "weather" && <WeatherWidget />}
          {w.type === "calendar" && <CalendarWidget />}
          {w.type === "notes" && <QuickNotesWidget />}
          {w.type === "calculator" && <MiniCalcWidget />}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
