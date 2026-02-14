import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const FlavorRadar = ({ data }) => {
    // Data expected format: [{ subject: 'Sweet', A: 120, fullMark: 150 }, ...]

    return (
        <div style={{ width: '100%', height: '180px', position: 'relative', flexShrink: 0 }}>
            <h3 style={{
                position: 'absolute',
                top: 0,
                left: 0,
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                letterSpacing: '1px'
            }}>
                FLAVOR_MATRIX
            </h3>

            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Mix Profile"
                        dataKey="A"
                        stroke="var(--color-neon-cyan)"
                        strokeWidth={2}
                        fill="var(--color-neon-cyan)"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FlavorRadar;
