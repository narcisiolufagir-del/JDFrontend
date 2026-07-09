import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-white pb-16">
      <Outlet />
      <BottomNav />
    </div>
  );
}
