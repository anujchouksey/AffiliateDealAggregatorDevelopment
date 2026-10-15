import type { AdConfig } from '../types';

export const DEFAULT_AD_CONFIG: AdConfig = {
  leaderboardEnabled: false,
  leaderboardCode: '',
  inFeedEnabled: false,
  inFeedFrequency: 6,
  inFeedCode: '',
  stickyBottomEnabled: false,
  stickyBottomCode: '',
  popupEnabled: true,
  popupDelayMinutes: 5,
  popupCode: ''
};

export function getAdConfig(): AdConfig {
  if (typeof window === 'undefined') return DEFAULT_AD_CONFIG;
  const saved = localStorage.getItem('dealpulse_ad_config');
  if (saved) {
    try {
      return { ...DEFAULT_AD_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_AD_CONFIG;
    }
  }
  return DEFAULT_AD_CONFIG;
}

export function saveAdConfig(config: AdConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dealpulse_ad_config', JSON.stringify(config));
  }
}
