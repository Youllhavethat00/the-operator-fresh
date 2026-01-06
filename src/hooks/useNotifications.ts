import { useState, useEffect, useCallback } from 'react';
import { TimeBlock } from '@/types/planner';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPWA(standalone);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      // Use service worker for PWA notifications
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon.svg',
            badge: '/icon.svg',
            vibrate: [100, 50, 100],
            ...options
          });
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/icon.svg',
          ...options
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [isSupported, permission]);

  // Play a bell sound for time block changes
  const playBlockBell = useCallback(() => {
    try {
      // Create audio context for bell sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillator for bell tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing bell:', error);
    }
  }, []);

  // Monitor time blocks and send notifications
  const startBlockMonitoring = useCallback((
    timeBlocks: TimeBlock[],
    onBlockChange?: (block: TimeBlock) => void
  ) => {
    if (!isSupported || permission !== 'granted') return () => {};

    let lastNotifiedBlock: string | null = null;

    const checkBlocks = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      for (const block of timeBlocks) {
        // Check if we just entered this block
        if (block.startTime === currentTime && lastNotifiedBlock !== block.id) {
          lastNotifiedBlock = block.id;
          
          // Send notification
          sendNotification(`THE OPERATOR - Time Block Started`, {
            body: `${block.label}\n${block.startTime} - ${block.endTime}`,
            tag: `block-${block.id}`,
            requireInteraction: false
          });

          // Play bell
          playBlockBell();

          // Callback
          onBlockChange?.(block);
          break;
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkBlocks, 60000);
    
    // Initial check
    checkBlocks();

    return () => clearInterval(interval);
  }, [isSupported, permission, sendNotification, playBlockBell]);

  // Send morning briefing
  const sendMorningBriefing = useCallback((
    tasks: { title: string; priority: string }[],
    sacrifice?: string
  ) => {
    if (!isSupported || permission !== 'granted') return;

    const taskCount = tasks.length;
    const p80Count = tasks.filter(t => t.priority === '80').length;
    
    sendNotification('THE OPERATOR - Morning Briefing', {
      body: `${taskCount} tasks today (${p80Count} high priority)\n${sacrifice ? `Today's sacrifice: ${sacrifice}` : 'Set your daily sacrifice!'}`,
      tag: 'morning-briefing',
      requireInteraction: true
    });
  }, [isSupported, permission, sendNotification]);

  // Send end of day reminder
  const sendEODReminder = useCallback((completionRate: number) => {
    if (!isSupported || permission !== 'granted') return;

    const message = completionRate >= 80 
      ? `${completionRate}% complete. Outstanding execution today.`
      : `${completionRate}% complete. No excuses. Get it done.`;
    
    sendNotification('THE OPERATOR - End of Day', {
      body: message,
      tag: 'eod-reminder',
      requireInteraction: true
    });
  }, [isSupported, permission, sendNotification]);

  // Schedule daily notifications
  const scheduleDailyNotifications = useCallback((morningTime: string, eveningTime: string) => {
    const checkTime = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime === morningTime) {
        sendNotification('THE OPERATOR - Rise and Execute', {
          body: 'Your day awaits. Set your intention and dominate.',
          tag: 'morning-wake',
          requireInteraction: true
        });
      }
      
      if (currentTime === eveningTime) {
        sendNotification('THE OPERATOR - Daily Review', {
          body: 'Time to review your day. Did you honor your commitments?',
          tag: 'evening-review',
          requireInteraction: true
        });
      }
    };

    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    isIOS,
    isPWA,
    requestPermission,
    sendNotification,
    playBlockBell,
    startBlockMonitoring,
    sendMorningBriefing,
    sendEODReminder,
    scheduleDailyNotifications
  };
};
