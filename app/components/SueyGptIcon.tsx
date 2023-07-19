import React from 'react';

interface SueyGptIconProps {
  imagePath: string;
}

const SueyGptIcon: React.FC<SueyGptIconProps> = ({ imagePath }) => {
  return <img src={imagePath} alt="SueyGptIcon" />;
};

export default SueyGptIcon;
