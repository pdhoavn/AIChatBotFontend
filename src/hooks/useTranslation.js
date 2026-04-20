import { useState, useCallback } from 'react';
import i18n from '../utils/i18n';

export function useTranslation() {
  const [loc, setLocState] = useState(i18n.locale());

  const setLocale = useCallback((newLoc) => {
    i18n.setLocale(newLoc);
    setLocState(newLoc);
  }, []);

  return {
    t: i18n.t,
    locale: loc,
    setLocale
  };
}

export default useTranslation;
