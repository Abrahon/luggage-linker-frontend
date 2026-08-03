import { DelivaryHistory } from "@/webcomponent/sender";

export default function Page() {
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="w-full">
        <DelivaryHistory />
      </div>
    </main>
  );
}