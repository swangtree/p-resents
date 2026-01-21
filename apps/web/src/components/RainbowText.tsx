interface RainbowTextProps {
  text: string;
  className?: string;
}

const RAINBOW_COLORS = [
  "text-pareto-pink",
  "text-pareto-yellow",
  "text-pareto-orange",
  "text-pareto-green",
  "text-pareto-blue",
];

export default function RainbowText({ text, className = "" }: RainbowTextProps) {
  return (
    <span className={`font-display ${className}`}>
      {text.split("").map((char, index) => {
        // Skip coloring for spaces
        if (char === " ") {
          return <span key={index}>{char}</span>;
        }

        const colorClass = RAINBOW_COLORS[index % RAINBOW_COLORS.length];
        return (
          <span key={index} className={colorClass}>
            {char}
          </span>
        );
      })}
    </span>
  );
}
