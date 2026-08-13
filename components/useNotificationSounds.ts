'use client';

import { useEffect, useState } from 'react';
import { fetchRestaurantSettings } from '@/lib/settings-actions';

export function useNotificationSounds() {
  const [newOrderSoundUrl, setNewOrderSoundUrl] = useState('');
  const [waiterCallSoundUrl, setWaiterCallSoundUrl] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const settings = await fetchRestaurantSettings();
        if (!active) return;
        setNewOrderSoundUrl(settings.new_order_sound_url || '');
        setWaiterCallSoundUrl(settings.waiter_call_sound_url || '');
      } catch {
        if (active) {
          setNewOrderSoundUrl('');
          setWaiterCallSoundUrl('');
        }
      }
    };

    load();
    const interval = setInterval(load, 120000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { newOrderSoundUrl, waiterCallSoundUrl };
}
