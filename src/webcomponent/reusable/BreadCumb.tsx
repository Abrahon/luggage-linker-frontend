import { BarChart3Icon } from "lucide-react";

export interface MathItem {
  mhki: number | string;
  mhki_subtitle: string;
}

export interface BreadcrumbProps {
  title: string;
  subtitle?: string;
  math?: MathItem[]; // Optional array of metric items
}

export const Breadcrumb = ({ title, subtitle, math = [] }: BreadcrumbProps) => {
  return (
    <div className="w-full bg-[#253D2C] text-white p-6 flex flex-col gap-6 rounded-lg">
      {/* Top Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <BarChart3Icon className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
      </div>

      {/* Bottom Section (Metrics) - Only renders if math items exist */}
      {math && math.length > 0 && (
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
          {math.map((item, index) => (
            <div key={index} className="flex flex-col items-start">
              <span className="text-2xl font-semibold">{item.mhki}</span>
              <span className="text-sm opacity-80 line-clamp-1">
                {item.mhki_subtitle}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Breadcrumb;