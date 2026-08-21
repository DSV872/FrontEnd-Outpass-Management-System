import React from 'react';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ConfigProvider, theme as antTheme } from 'antd';

const ThemedApp: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: isDark ? {
          colorBgBase: '#000000',
          colorBgContainer: '#0a0a0a',
          colorBgElevated: '#111111',
          colorBgLayout: '#000000',
          colorBgSpotlight: '#1a1a1a',
          colorBorder: '#1f1f1f',
          colorBorderSecondary: '#161616',
          colorText: '#e8e8e8',
          colorTextSecondary: '#8c8c8c',
          colorPrimary: '#1890ff',
          borderRadius: 8,
        } : {
          borderRadius: 8,
        },
        components: isDark ? {
          Card: {
            colorBgContainer: '#0d0d0d',
          },
          Table: {
            colorBgContainer: '#0a0a0a',
            headerBg: '#111111',
          },
          Layout: {
            headerBg: '#050505',
            bodyBg: '#000000',
            siderBg: '#080808',
          },
          Modal: {
            contentBg: '#0d0d0d',
            headerBg: '#0d0d0d',
          },
          Drawer: {
            colorBgElevated: '#0d0d0d',
          },
        } : {},
      }}
    >
      <div className={isDark ? 'dark-mode' : ''} style={{ minHeight: '100vh', background: isDark ? '#000000' : undefined }}>
        <AppRouter />
      </div>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
