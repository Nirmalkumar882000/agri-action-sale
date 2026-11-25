import React from 'react';
import { OfflineAuctionView } from './OfflineAuctionView';

interface OfflineLiveDeskViewProps {
  onNavigate: (path: string) => void;
}

export const OfflineLiveDeskView: React.FC<OfflineLiveDeskViewProps> = ({ onNavigate }) => {
  return <OfflineAuctionView onNavigate={onNavigate} defaultView="auction" />;
};
