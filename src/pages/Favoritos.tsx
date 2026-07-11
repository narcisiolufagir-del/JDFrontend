import { AppHeader } from "@/components/AppHeader";
import { Heart } from "lucide-react";

const Favoritos = () => {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader showSearch={false} subtitle="As suas notícias guardadas" />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
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
