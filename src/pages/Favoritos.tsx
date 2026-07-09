import { Heart } from "lucide-react";

const Favoritos = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-extrabold text-[#1a56db] tracking-tight leading-none">
          Favoritos
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">As suas notícias guardadas</p>
      </header>

      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Sem favoritos ainda</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Guarde notícias para ler mais tarde. Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  );
};

export default Favoritos;
