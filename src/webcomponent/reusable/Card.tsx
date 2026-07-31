import Image from "next/image";

export interface CardProps {
  icon: string;
  title: string;
  subtitle?: string;
  sugtitle?: string;
  quantity: string | number;
}

export const Card = ({ icon, title, subtitle, sugtitle, quantity }: CardProps) => {
  const displaySubtitle = subtitle || sugtitle;

  return (
    <div className="flex flex-col justify-between bg-white rounded-2xl border border-gray-150 shadow-sm p-5 w-full min-h-[160px] hover:shadow-md transition-shadow">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="relative w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl">
          <Image
            src={icon}
            alt={title}
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          {quantity}
        </span>
      </div>

      {/* Title and Subtitle */}
      <div className="flex flex-col mt-4">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {displaySubtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{displaySubtitle}</p>
        )}
      </div>
    </div>
  );
};