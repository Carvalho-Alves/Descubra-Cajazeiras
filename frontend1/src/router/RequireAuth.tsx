import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from '../hooks/reduxHooks';

type Props = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: Props) {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
