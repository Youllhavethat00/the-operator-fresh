import React from 'react';
import { Bell, X, Smartphone, Download } from 'lucide-react';

interface NotificationPromptProps {
  isVisible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
  isIOS?: boolean;
  isPWA?: boolean;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  isVisible,
  onEnable,
  onDismiss,
  isIOS = false,
  isPWA = false
}) => {
  if (!isVisible) return null;

  // Show iOS install prompt if on iOS but not installed as PWA
  if (isIOS && !isPWA) {
    return (
      <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-zinc-900 border border-amber-500/50 rounded-xl p-5 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-zinc-800 rounded transition-colors"
        >
          <X size={16} className="text-zinc-500" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Smartphone size={24} className="text-amber-400" />
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-1">Install on iPhone</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Add The Operator to your home screen for the full app experience with notifications.
            </p>
            
            <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
              <ol className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center text-xs text-amber-400 font-bold">1</span>
                  Tap the <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-700 rounded text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share
                  </span> button
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center text-xs text-amber-400 font-bold">2</span>
                  Scroll and tap "Add to Home Screen"
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center text-xs text-amber-400 font-bold">3</span>
                  Tap "Add" to install
                </li>
              </ol>
            </div>
            
            <button
              onClick={onDismiss}
              className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm"
            >
              I'll do it later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-zinc-900 border border-amber-500/50 rounded-xl p-5 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-zinc-800 rounded transition-colors"
      >
        <X size={16} className="text-zinc-500" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell size={24} className="text-amber-400" />
        </div>
        
        <div>
          <h3 className="font-bold text-white mb-1">Enable Notifications</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Get alerts when time blocks change, morning briefings, and end-of-day reminders. Like a school bell for your productivity.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={onEnable}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              Enable
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate component for showing install prompt on any platform
export const InstallPrompt: React.FC<{
  isVisible: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}> = ({ isVisible, onInstall, onDismiss }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-5 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-zinc-800/50 rounded transition-colors"
      >
        <X size={16} className="text-zinc-400" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-500/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Download size={24} className="text-amber-400" />
        </div>
        
        <div>
          <h3 className="font-bold text-white mb-1">Install The Operator</h3>
          <p className="text-sm text-zinc-300 mb-4">
            Install the app for offline access, faster loading, and push notifications.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={onInstall}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Install App
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-lg transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
