// (概念上位于 components/NumberSVG.tsx)
// (Conceptually in components/NumberSVG.tsx)

import React from 'react';

interface NumberSVGProps {
    number: number;
    className?: string;
}

const NumberSVG: React.FC<NumberSVGProps> = ({ number, className }) => {
    // 这是一个简化的SVG数字渲染。对于更复杂的数字样式，可以使用外部库或更精细的SVG路径。
    // For more complex number styles, you might use an external library or more detailed SVG paths.
    return (
        <div className={`flex items-center justify-center text-8xl font-bold text-gray-700 ${className || ''}`}>
            {number}
        </div>
    );
};

export default NumberSVG;