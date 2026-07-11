import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { PwaInstallCard } from "@/components/PwaInstallCard";

export function MobileLayout() {
  const location = useLocation();
  const showPwaBanner = location.pathname === "/profile";

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-[62px] lg:pb-0">
      <Outlet />
      {showPwaBanner && <PwaInstallCard variant="fixed" />}
      <BottomNav />
    </div>
  );
}
