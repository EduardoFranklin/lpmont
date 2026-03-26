interface MountainDividerProps {
  flip?: boolean;
  className?: string;
}

const MountainDivider = ({ flip, className = "" }: MountainDividerProps) => {
  return (
    <div className={`mountain-divider ${flip ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,120 L0,80 Q120,20 240,60 Q320,85 400,50 Q480,15 560,40 Q640,65 720,30 Q800,0 880,25 Q960,50 1040,20 Q1120,0 1200,35 Q1280,55 1360,30 Q1400,18 1440,40 L1440,120 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default MountainDivider;
