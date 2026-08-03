import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import { TasbihTheme } from '../../constants/TasbihTheme';

interface SizedProps {
  width?: number;
  height?: number;
}

export const MosqueSilhouette: React.FC<SizedProps> = ({ width = 390, height = 120 }) => (
  <Svg width={width} height={height} viewBox="0 0 390 120" preserveAspectRatio="xMidYMax slice">
    <G opacity={0.35}>
      <Path
        d="M40 95 V55 Q40 35 55 22 Q70 35 70 55 V95 H40 Z M52 95 V72 H58 V95 H52 Z"
        fill={TasbihTheme.colors.mosqueSilhouette}
      />
      <Path
        d="M95 95 V48 Q95 30 110 18 Q125 30 125 48 V95 H95 Z M107 95 V68 H113 V95 H107 Z"
        fill={TasbihTheme.colors.mosqueSilhouette}
      />
      <Path
        d="M155 95 V42 Q155 22 175 8 Q195 22 195 42 V95 H155 Z M168 95 V62 H182 V95 H168 Z"
        fill={TasbihTheme.colors.mosqueSilhouette}
      />
      <Path
        d="M225 95 V42 Q225 22 245 8 Q265 22 265 42 V95 H225 Z M238 95 V62 H252 V95 H238 Z"
        fill={TasbihTheme.colors.mosqueSilhouette}
      />
      <Path
        d="M295 95 V48 Q295 30 310 18 Q325 30 325 48 V95 H295 Z M307 95 V68 H313 V95 H307 Z"
        fill={TasbihTheme.colors.mosqueSilhouette}
      />
      <Path
        d="M350 95 V55 Q350 35 365 22 Q380 35 380 55 V95 H350 Z M362 95 V72 H368 V95 H362 Z"
        fill={TasbihTheme.colors.mosqueSilhouette}
      />
      <Rect x="0" y="95" width="390" height="25" fill={TasbihTheme.colors.mosqueSilhouette} opacity={0.5} />
    </G>
  </Svg>
);

export const LanternIllustration: React.FC<SizedProps> = ({ width = 90, height = 110 }) => (
  <Svg width={width} height={height} viewBox="0 0 90 110">
    <Defs>
      <LinearGradient id="lanternGlow" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F5E6C4" stopOpacity="0.9" />
        <Stop offset="1" stopColor="#C8A870" stopOpacity="0.6" />
      </LinearGradient>
      <LinearGradient id="leafGreen" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#2D6A4F" />
        <Stop offset="1" stopColor="#1B4332" />
      </LinearGradient>
    </Defs>
    <Path d="M10 95 Q25 88 35 95 Q45 102 55 95 Q65 88 80 95" fill="url(#leafGreen)" opacity={0.7} />
    <Path d="M20 92 Q30 85 40 92" stroke="#2D6A4F" strokeWidth="1.5" fill="none" />
    <Path d="M50 94 Q60 87 70 94" stroke="#2D6A4F" strokeWidth="1.5" fill="none" />
    <Circle cx="45" cy="48" r="28" fill="url(#lanternGlow)" opacity={0.35} />
    <Path
      d="M45 12 L48 22 H42 Z M38 22 H52 V26 H38 Z M36 26 H54 V72 Q54 82 45 86 Q36 82 36 72 Z"
      fill="#C8A870"
    />
    <Rect x="38" y="30" width="14" height="36" rx="2" fill="#F5E6C4" opacity={0.85} />
    <Rect x="54" y="30" width="14" height="36" rx="2" fill="#F5E6C4" opacity={0.85} />
    <Path d="M40 72 H50 L48 80 H42 Z" fill="#B8956A" />
    <Circle cx="45" cy="48" r="6" fill="#FFF8E7" opacity={0.9} />
  </Svg>
);

interface IslamicStarBadgeProps extends SizedProps {
  label: string;
  size?: number;
}

export const IslamicStarBadge: React.FC<IslamicStarBadgeProps> = ({ label, size = 36 }) => {
  const center = size / 2;
  const outer = size * 0.46;
  const inner = size * 0.2;
  const points: string[] = [];

  for (let i = 0; i < 8; i++) {
    const outerAngle = (Math.PI / 4) * i - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / 8;
    points.push(`${center + outer * Math.cos(outerAngle)},${center + outer * Math.sin(outerAngle)}`);
    points.push(`${center + inner * Math.cos(innerAngle)},${center + inner * Math.sin(innerAngle)}`);
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon
        points={points.join(' ')}
        fill={TasbihTheme.colors.starFill}
        stroke={TasbihTheme.colors.starBorder}
        strokeWidth={1.2}
      />
    </Svg>
  );
};

export const TargetIcon: React.FC<SizedProps> = ({ width = 28, height = 28 }) => (
  <Svg width={width} height={height} viewBox="0 0 28 28">
    <Circle cx="14" cy="14" r="12" stroke="#C8A870" strokeWidth="1.5" fill="none" />
    <Circle cx="14" cy="14" r="7" stroke="#C8A870" strokeWidth="1.5" fill="none" />
    <Circle cx="14" cy="14" r="3" fill="#C8A870" />
  </Svg>
);
