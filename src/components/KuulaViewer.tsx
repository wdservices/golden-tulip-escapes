import React from 'react';

interface KuulaViewerProps {
  url: string;
  className?: string;
}

const KuulaViewer: React.FC<KuulaViewerProps> = ({ url, className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <iframe 
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; vr"
      />
    </div>
  );
};

export default KuulaViewer;