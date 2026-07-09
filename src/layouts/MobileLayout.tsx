import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-[62px]">
      <Outlet />
      <BottomNav />
    </div>
  );
}
