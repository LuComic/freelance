type LandingFeatureCardProps = {
  title: string;
  description: string;
  accent: string;
};

export const LandingFeatureCard = ({
  title,
  description,
  accent,
}: LandingFeatureCardProps) => {
  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-(--gray) bg-linear-to-b ${accent} p-5 hover:bg-(--darkest-hover)`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-(--gray) bg-(--darkest)">
        <div className="h-3 w-3 rounded-full bg-(--vibrant)" />
      </div>

      <h3 className="text-lg font-semibold text-(--light)">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-(--gray-page)">{description}</p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.14em] text-(--gray-page) uppercase">
          Included
        </span>
        <span className="text-sm font-medium text-(--light) group-hover:translate-x-0.5">
          Learn more
        </span>
      </div>
    </div>
  );
};
