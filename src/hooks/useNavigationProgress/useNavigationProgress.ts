import { useContext } from 'react';
import {
  NavigationProgressContext,
  type NavigationProgress,
} from '@/context/NavigationProgressContext';

export function useNavigationProgress(): NavigationProgress {
  const context = useContext(NavigationProgressContext);
  if (!context) {
    throw new Error('useNavigationProgress must be used within NavigationProgressProvider');
  }
  return context;
}
