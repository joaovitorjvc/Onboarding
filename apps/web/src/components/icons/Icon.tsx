import type { ReactNode } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronRight,
  CircleCheck,
  Clock,
  Compass,
  ExternalLink,
  House,
  Layers,
  Receipt,
  Sparkles,
} from 'lucide-react';
import type { IconName } from '@nuagehub/contracts';

const iconMap = {
  'arrow-right': ArrowRight,
  award: Award,
  'book-open': BookOpen,
  'chevron-right': ChevronRight,
  'circle-check': CircleCheck,
  clock: Clock,
  compass: Compass,
  'external-link': ExternalLink,
  house: House,
  layers: Layers,
  receipt: Receipt,
  sparkles: Sparkles,
} as const;

export function Icon({
  name,
  size = 24,
  strokeWidth = 2,
}: {
  name: IconName | string;
  size?: number;
  strokeWidth?: number;
}): ReactNode {
  const Component = iconMap[name as IconName];
  if (!Component) return null;
  return <Component aria-hidden="true" size={size} strokeWidth={strokeWidth} />;
}
