import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import CustomTooltip from "./CustomTooltip.jsx";

const CustomPieChart = ({ data, label, totalAmount, showTextAnchor, colors, small }) => {

    return (
        <ResponsiveContainer width="100%" height={small ? 260 : 380}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={small ? 90 : 130}
                    innerRadius={small ? 70 : 100}
                    labelLine={false}
                    stroke="#ffffff"
                    strokeWidth={small ? 4 : 2}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />

                {showTextAnchor && (
                    <>
                        <text
                            x="50%"
                            y="50%"
                            dy={-20}
                            textAnchor="middle"
                            fill="#444650"
                            fontSize="12px"
                            fontWeight="500"
                        >
                            {label}
                        </text>
                        <text
                            x="50%"
                            y="50%"
                            dy={10}
                            textAnchor="middle"
                            fill="#191c1e"
                            fontSize="20px"
                            fontWeight="900"
                            letterSpacing="-0.5px"
                        >
                            {totalAmount}
                        </text>
                    </>
                )}
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CustomPieChart;
