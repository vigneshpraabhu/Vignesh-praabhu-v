import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { User, Role } from './types';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { CitizenPage } from './pages/CitizenPage';
import { GovernmentPage } from './pages/GovernmentPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { ResourceProviderPage } from './pages/ResourceProviderPage';
import { ReliefCampsPage } from './pages/ReliefCampsPage';
import { BackendExplorerPage } from './pages/BackendExplorerPage';
import { PresentationPage } from './pages/PresentationPage';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authRole, setAuthRole] = useState<Role>('CITIZEN');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
    return unsub;
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register', role?: Role) => {
    if (role) setAuthRole(role);
    setCurrentTab(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    // Automatic redirect to that role's dashboard
    if (user.role === 'GOVERNMENT') setCurrentTab('government');
    else if (user.role === 'VOLUNTEER') setCurrentTab('volunteer');
    else if (user.role === 'CITIZEN') setCurrentTab('citizen');
    else if (user.role === 'RESOURCE_PROVIDER') setCurrentTab('provider');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: string, roleParam?: Role) => {
    const activeUser = store.getCurrentUser();
    
    // Dedicated login pages
    if (tab === 'login-citizen') {
      setAuthRole('CITIZEN');
      setCurrentTab('login-citizen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'login-volunteer') {
      setAuthRole('VOLUNTEER');
      setCurrentTab('login-volunteer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'login-government') {
      setAuthRole('GOVERNMENT');
      setCurrentTab('login-government');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'login-provider') {
      setAuthRole('RESOURCE_PROVIDER');
      setCurrentTab('login-provider');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Role protection using the direct store user to avoid stale state redirect
    if (tab === 'government' && activeUser?.role !== 'GOVERNMENT') {
      setAuthRole('GOVERNMENT');
      setCurrentTab('login-government');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'volunteer' && activeUser?.role !== 'VOLUNTEER') {
      setAuthRole('VOLUNTEER');
      setCurrentTab('login-volunteer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'citizen' && activeUser?.role !== 'CITIZEN') {
      setAuthRole('CITIZEN');
      setCurrentTab('login-citizen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'provider' && activeUser?.role !== 'RESOURCE_PROVIDER') {
      setAuthRole('RESOURCE_PROVIDER');
      setCurrentTab('login-provider');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (roleParam) {
      setAuthRole(roleParam);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-red-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Pages */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {(currentTab === 'login' ||
          currentTab === 'login-citizen' ||
          currentTab === 'login-volunteer' ||
          currentTab === 'login-government' ||
          currentTab === 'login-provider') && (
          <AuthPage
            initialMode="login"
            initialRole={
              currentTab === 'login-citizen'
                ? 'CITIZEN'
                : currentTab === 'login-volunteer'
                ? 'VOLUNTEER'
                : currentTab === 'login-government'
                ? 'GOVERNMENT'
                : currentTab === 'login-provider'
                ? 'RESOURCE_PROVIDER'
                : authRole
            }
            onSuccess={handleAuthSuccess}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'register' && (
          <AuthPage
            initialMode="register"
            initialRole={authRole}
            onSuccess={handleAuthSuccess}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'citizen' && <CitizenPage />}
        {currentTab === 'government' && <GovernmentPage />}
        {currentTab === 'volunteer' && <VolunteerPage />}
        {currentTab === 'provider' && <ResourceProviderPage />}
        {currentTab === 'camps' && <ReliefCampsPage />}
        {currentTab === 'presentation' && <PresentationPage />}
        {currentTab === 'backend-explorer' && <BackendExplorerPage />}
      </div>
    </div>
  );
}
