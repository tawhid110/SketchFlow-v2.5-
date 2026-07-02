import React from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import { PcUI } from './UISettings/PcUI';
import { PhoneUI } from './UISettings/PhoneUI';

export default function App() {
  const appState = useAppLogic();
  
  if (appState.deviceInfo.isMobile) {
    return <PhoneUI {...appState} />;
  }
  
  return <PcUI {...appState} />;
}
