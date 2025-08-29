import React from 'react';
import { useLocation } from 'react-router-dom';
import DownloadButton from './DownloadButton';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface DownloadOptionsProps {
  primaryLinks: {
    mega?: string;
    mega2?: string;
    pixeldrain?: string;
  };
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({ primaryLinks }) => {
  const location = useLocation();

  // Determine theme based on current path
  const getTheme = () => {
    if (location.pathname.includes('/western')) return 'western';
    if (location.pathname.includes('/asian')) return 'asian';
    if (location.pathname.includes('/vip')) return 'vip';
    if (location.pathname.includes('/banned')) return 'banned';
    if (location.pathname.includes('/unknown')) return 'unknown';
    return 'asian'; // default
  };

  const theme = getTheme();

  const getThemeColors = () => {
    switch (theme) {
      case 'western':
        return {
          primary: 'from-orange-500 to-orange-600',
          hover: 'hover:from-orange-600 hover:to-orange-700',
          shadow: 'hover:shadow-orange-500/20'
        };
      case 'vip':
        return {
          primary: 'from-yellow-500 to-yellow-600',
          hover: 'hover:from-yellow-600 hover:to-yellow-700',
          shadow: 'hover:shadow-yellow-500/20'
        };
      case 'banned':
        return {
          primary: 'from-red-500 to-red-600',
          hover: 'hover:from-red-600 hover:to-red-700',
          shadow: 'hover:shadow-red-500/20'
        };
      case 'unknown':
        return {
          primary: 'from-gray-500 to-gray-600',
          hover: 'hover:from-gray-600 hover:to-gray-700',
          shadow: 'hover:shadow-gray-500/20'
        };
      case 'asian':
      default:
        return {
          primary: 'from-purple-500 to-purple-600',
          hover: 'hover:from-purple-600 hover:to-purple-700',
          shadow: 'hover:shadow-purple-500/20'
        };
    }
  };

  const colors = getThemeColors();

  const downloadOptions = [
    {
      name: 'MEGA',
      url: primaryLinks.mega,
    },
    {
      name: 'MEGA 2',
      url: primaryLinks.mega2,
    },
    {
      name: 'Pixeldrain',
      url: primaryLinks.pixeldrain,
    }
  ];

  const availableOptions = downloadOptions.filter(option => option.url);

  if (availableOptions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-400">No download links available</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {availableOptions.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <DownloadButton
              url={option.url!}
              label={option.name}
              bgColor={colors.primary}
              hoverColor={colors.hover}
              shadowColor={colors.shadow}
              textColor="text-white"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DownloadOptions;
