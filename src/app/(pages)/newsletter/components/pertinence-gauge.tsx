const PertinenceGauge: React.FC<{ score: number }> = ({ score }) => {
    // Determine the fill based on the score (0 to 1, where 1 is fully filled)
    const fillPercentage = (score / 10) * 100;

    /* Colors
    const startColor = [255, 95, 45];   // RGB for #FF5F2D
    const endColor = [57, 156, 107];   // RGB for #28694B

    // Calculate the color gradient based on the score
    const interpolateColor = (start: number[], end: number[], factor: number) => {
        return start.map((startVal, i) => Math.round(startVal + factor * (end[i] - startVal)));
    };

    const [r, g, b] = interpolateColor(startColor, endColor, score / 10);
    const color = `rgb(${r},${g},${b})`;

    */
    // Predefined gradient colors
    const gradientColors = [
        '#FF5F2D', // 1
        '#FF8C2B', // 2
        '#FFB82A', // 3
        '#FFD92A', // 4
        '#FFFF2A', // 5
        '#D4FF2A', // 6
        '#AAFF2A', // 7
        '#7FFF2A', // 8
        '#57D149', // 9
        '#399C6B'  // 10
    ];

    // Determine the color based on the score
    const color = gradientColors[Math.min(Math.max(score - 1, 0), 9)];

    return (
        <div className="relative flex items-center justify-center w-[25px]">
            <svg width="24" height="24" viewBox="0 0 36 36" className="circular-chart absolute">
                <path
                    className="circle-bg"
                    d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="4"
                />
                <path
                    className="circle"
                    strokeDasharray={`${fillPercentage}, 100`}
                    d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
            <div className="text-gray-700 text-sm font-bold">{score}</div>
        </div>
    );
};

export default PertinenceGauge;
