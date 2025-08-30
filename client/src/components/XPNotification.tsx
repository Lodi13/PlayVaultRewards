import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface XPNotification {
  id: string;
  xpGained: number;
}

export default function XPNotification() {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  useEffect(() => {
    const handleXPNotification = (event: CustomEvent) => {
      const { xpGained } = event.detail;
      const id = Date.now().toString();
      
      setNotifications(prev => [...prev, { id, xpGained }]);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
    };

    window.addEventListener('showXPNotification', handleXPNotification as EventListener);
    
    return () => {
      window.removeEventListener('showXPNotification', handleXPNotification as EventListener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" data-testid="xp-notifications">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-accent text-accent-foreground px-6 py-3 rounded-lg shadow-lg border border-accent/20"
            data-testid={`xp-notification-${notification.id}`}
          >
            <div className="flex items-center space-x-2">
              <motion.i 
                className="fas fa-plus"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              />
              <motion.span 
                className="font-bold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                +{notification.xpGained} XP
              </motion.span>
              <motion.i 
                className="fas fa-coins text-gold"
                initial={{ rotate: -180 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
