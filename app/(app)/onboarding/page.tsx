import {
  Coffee, Utensils, Croissant, Pizza, IceCream, Hotel, GlassWater,
  ShoppingCart, Beef, Fish, Leaf, Pill, Dumbbell, Scissors, Sparkles,
  Shirt, Wind, Car, Wrench, Store,
} from 'lucide-react';
import { initializeSector } from '../../../actions/onboarding';
import { SECTORS_LIST } from '../../../src/utils/sectorsConfig';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee, Utensils, Croissant, Pizza, IceCream, Hotel, GlassWater,
  ShoppingCart, Beef, Fish, Leaf, Pill, Dumbbell, Scissors, Sparkles,
  Shirt, Wind, Car, Wrench, Store,
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6">
        <div>
          <h1 className="font-serif font-black text-[#1A1A1A] text-lg uppercase tracking-wide">
            Sélectionner l&apos;activité marocaine
          </h1>
          <p className="text-xs text-[#8C7B6E] font-medium mt-1">
            Choisissez l&apos;activité de votre établissement. Le système configurera instantanément les matières, les taxes et simulera des bilans comptables de démarrage.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SECTORS_LIST.map(sec => {
            const SecIcon = iconMap[sec.icon] || Store;
            return (
              <form key={sec.id} action={initializeSector.bind(null, sec.id, `${sec.labelFR} de Casablanca`)}>
                <button
                  type="submit"
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-[#1A1A1A] bg-white hover:bg-white/90 transition-all text-left cursor-pointer flex flex-col justify-between h-28"
                >
                  <div className="p-2 rounded-xl w-fit bg-[#F3F1ED] text-gray-700">
                    <SecIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold uppercase text-[#1A1A1A] line-clamp-1">{sec.labelFR}</div>
                    <div className="text-[9px] text-[#8C7B6E] font-medium uppercase tracking-wider">{sec.defaultCategories.length} cats</div>
                  </div>
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
