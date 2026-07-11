import { AppHeader } from "@/components/AppHeader";
import { Heart } from "lucide-react";

const Favoritos = () => {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader showSearch={false} />

      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-6">
        <div className="mb-6">
          <h1 className="text-[17px] lg:text-xl font-bold text-gray-900">Favoritos</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">As suas notícias guardadas</p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F0F2F6] flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-1">Sem favoritos ainda</h2>
          <p className="text-sm text-gray-400 max-w-xs">
            Guarde notícias para ler mais tarde. Esta funcionalidade estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Favoritos;
