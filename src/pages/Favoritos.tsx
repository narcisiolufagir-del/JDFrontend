import { Heart } from "lucide-react";

const BRAND = "#2B58C5";

const Favoritos = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-5 pb-3">
        <h1 className="text-[26px] font-extrabold tracking-tight leading-none" style={{ color: BRAND }}>
          Favoritos
        </h1>
        <p className="text-[13px] text-gray-400 mt-1">As suas notícias guardadas</p>
      </header>

      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0F2F6] flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Sem favoritos ainda</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Guarde notícias para ler mais tarde. Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  );
};

export default Favoritos;
