import { useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Generate unique session ID
function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

export function useVisitorTracking() {
  const lastActivityRef = useRef<number>(Date.now());
  const sessionId = getSessionId();

  // Track visitor on mount and page changes
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const currentUrl = window.location.href;
        const referrer = document.referrer || '';
        
        // Get user ID from localStorage if logged in
        const userData = localStorage.getItem('billboardwalker_user');
        let userId = null;
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            userId = user.id;
          } catch (e) {
            // Ignore parse error
          }
        }

        await apiRequest('POST', '/api/visitors/track', {
          sessionId,
          pageUrl: currentUrl,
          referrer,
          userId
        });
      } catch (error) {
        // Silently fail - visitor tracking is not critical
        console.debug('Visitor tracking failed:', error);
      }
    };

    // Track initial visit
    trackVisitor();

    // Track activity every 5 minutes if user is active
    const activityInterval = setInterval(() => {
      const now = Date.now();
      // Only track if user was active in last 10 minutes
      if (now - lastActivityRef.current < 10 * 60 * 1000) {
        trackVisitor();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Update activity on user interactions
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Cleanup
    return () => {
      clearInterval(activityInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [sessionId]);

  // Mark visitor as inactive when leaving
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        // Use navigator.sendBeacon for reliable tracking on page unload
        const data = JSON.stringify({ sessionId });
        navigator.sendBeacon('/api/visitors/inactive', data);
      } catch (error) {
        // Silently fail
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId]);
}