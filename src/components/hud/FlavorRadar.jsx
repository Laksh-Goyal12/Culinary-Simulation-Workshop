import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid var(--color-neon-cyan)',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(4px)'
            }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {label}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-neon-cyan)', fontWeight: '800' }}>
                    Intensity: {payload[0].value.toFixed(0)}%
                </div>
            </div>
        );
    }
    return null;
};

const FlavorRadar = ({ data }) => {
    // Data expected format: [{ subject: 'Sweet', A: 120, fullMark: 150 }, ...]
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div style={{ width: '100%', height: '320px', position: 'relative', flexShrink: 0, marginTop: '8px', minWidth: 0 }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '60%', height: '60%',
                background: 'radial-gradient(circle, rgba(41, 128, 185, 0.08) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <h3 style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                letterSpacing: '1.5px',
                fontWeight: '700',
                marginBottom: '10px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>⬡</span>
                FLAVOR MATRIX
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>⬡</span>
            </h3>

            <div style={{ width: '100%', height: '260px', position: 'relative', zIndex: 1, minWidth: 0 }}>
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <defs>
                                <linearGradient id="flavorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-neon-cyan)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-neon-green)" stopOpacity={0.4} />
                                </linearGradient>
                                <filter id="glow" height="130%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                    <feOffset dx="0" dy="0" result="offsetblur" />
                                    <feFlood floodColor="var(--color-neon-cyan)" floodOpacity="0.4" />
                                    <feComposite in2="offsetblur" operator="in" />
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <PolarGrid gridType="circle" stroke="rgba(41, 128, 185, 0.15)" strokeWidth={1} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={({ payload, x, y, textAnchor, stroke, radius }) => {
                                    return (
                                        <g className="recharts-layer recharts-polar-angle-axis-tick">
                                            <text
                                                radius={radius}
                                                stroke={stroke}
                                                x={x}
                                                y={y}
                                                className="recharts-text recharts-polar-angle-axis-tick-value"
                                                textAnchor={textAnchor}
                                            >
                                                <tspan x={x} dy="0em" fill="var(--text-secondary)" fontSize="11" fontWeight="700">
                                                    {payload.value}
                                                </tspan>
                                            </text>
                                        </g>
                                    );
                                }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Flavor Profile"
                                dataKey="A"
                                stroke="var(--color-neon-cyan)"
                                strokeWidth={3}
                                fill="url(#flavorGradient)"
                                fillOpacity={0.7}
                                isAnimationActive={true}
                                filter="url(#glow)"
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                )}
            </div>


            {/* Legend / Helper */}
            <div style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '-16px',
                fontStyle: 'italic',
                opacity: 0.8
            }}>
                High-Resolution Taste Analysis
            </div>
        </div>
    );
};

export default FlavorRadar;
