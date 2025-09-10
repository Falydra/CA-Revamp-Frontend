import React from "react";

interface ProgressBarProps {
  completed: number;
  maxCompleted: number;
  className?: string;
  height?: string;
  labelAlignment?: "top" | "bottom" | "outside";
  isLabelVisible?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  maxCompleted,
  className = "",
  height = "8px",
  labelAlignment = "top",
  isLabelVisible = true,
}) => {
  const percentage = Math.min((completed / maxCompleted) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {isLabelVisible && labelAlignment === "top" && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{completed}</span>
          <span>{maxCompleted}</span>
        </div>
      )}
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isLabelVisible && labelAlignment === "bottom" && (
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{completed}</span>
          <span>{maxCompleted}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
