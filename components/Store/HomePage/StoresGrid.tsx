import { Store } from "./types";
import StoreCard from "./StoreCard";

interface StoresGridProps {
  stores: Store[];
}

export default function StoresGrid({ stores }: StoresGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <StoreCard key={store.userId} store={store} />
      ))}
    </div>
  );
}
