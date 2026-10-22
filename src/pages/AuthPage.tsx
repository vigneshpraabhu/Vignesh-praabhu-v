import React, { useState } from 'react';
import { User, Role } from '../types';
import { CitizenLoginPage } from './auth/CitizenLoginPage';
import { VolunteerLoginPage } from './auth/VolunteerLoginPage';
import { GovernmentLoginPage } from './auth/GovernmentLoginPage';
import { ResourceProviderLoginPage } from './auth/ResourceProviderLoginPage';
import { RoleSelectLoginPage } from './auth/RoleSelectLoginPage';
import { RegisterPage } from './auth/RegisterPage';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  initialRole?: Role;
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  initialRole = 'CITIZEN',
  onSuccess,
  onCancel,
}) => {
  const getInitialView = (): 'citizen' | 'volunteer' | 'government' | 'provider' | 'select' | 'register' => {
    if (initialMode === 'register') return 'register';
    if (initialRole === 'CITIZEN') return 'citizen';
    if (initialRole === 'VOLUNTEER') return 'volunteer';
    if (initialRole === 'GOVERNMENT') return 'government';
    if (initialRole === 'RESOURCE_PROVIDER') return 'provider';
    return 'select';
  };

  const [view, setView] = useState<'citizen' | 'volunteer' | 'government' | 'provider' | 'select' | 'register'>(
    getInitialView()
  );

  const handleNavigate = (tab: string, roleParam?: Role) => {
    if (tab === 'home') {
      onCancel();
    } else if (tab === 'login-citizen') {
      setView('citizen');
    } else if (tab === 'login-volunteer') {
      setView('volunteer');
    } else if (tab === 'login-government') {
      setView('government');
    } else if (tab === 'login-provider') {
      setView('provider');
    } else if (tab === 'login') {
      if (roleParam) {
        if (roleParam === 'CITIZEN') setView('citizen');
        else if (roleParam === 'VOLUNTEER') setView('volunteer');
        else if (roleParam === 'GOVERNMENT') setView('government');
        else if (roleParam === 'RESOURCE_PROVIDER') setView('provider');
      } else {
        setView('select');
      }
    } else if (tab === 'register') {
      setView('register');
    } else {
      onCancel();
    }
  };

  const handleSelectRole = (role: Role) => {
    if (role === 'CITIZEN') setView('citizen');
    else if (role === 'VOLUNTEER') setView('volunteer');
    else if (role === 'GOVERNMENT') setView('government');
    else if (role === 'RESOURCE_PROVIDER') setView('provider');
  };

  // Render view
  if (view === 'register') {
    return (
      <RegisterPage
        initialRole={initialRole}
        onSuccess={onSuccess}
        onNavigate={handleNavigate}
      />
    );
  }

  if (view === 'citizen') {
    return (
      <CitizenLoginPage
        onSuccess={onSuccess}
        onNavigate={handleNavigate}
        onOpenRegister={() => setView('register')}
      />
    );
  }

  if (view === 'volunteer') {
    return (
      <VolunteerLoginPage
        onSuccess={onSuccess}
        onNavigate={handleNavigate}
        onOpenRegister={() => setView('register')}
      />
    );
  }

  if (view === 'government') {
    return (
      <GovernmentLoginPage
        onSuccess={onSuccess}
        onNavigate={handleNavigate}
      />
    );
  }

  if (view === 'provider') {
    return (
      <ResourceProviderLoginPage
        onSuccess={onSuccess}
        onNavigate={handleNavigate}
        onOpenRegister={() => setView('register')}
      />
    );
  }

  return (
    <RoleSelectLoginPage
      onSelectRole={handleSelectRole}
      onSuccess={onSuccess}
      onNavigate={handleNavigate}
      onOpenRegister={() => setView('register')}
    />
  );
};
