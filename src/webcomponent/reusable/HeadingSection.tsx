interface HeadingSectionProps {
  heading: string;
  subheading?: string;
  className?: string;
}

export const HeadingSection = ({
  heading,
  subheading,
  className = "",
}: HeadingSectionProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-900">{heading}</h2>
      {subheading && (
        <p className="text-lg text-gray-500 mt-1">{subheading}</p>
      )}
    </div>
  );
};