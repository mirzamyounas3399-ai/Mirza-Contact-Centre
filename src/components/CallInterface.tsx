import React, { useState } from 'react';
import { User } from '../types';

interface CallInterfaceProps {
  currentUser: User;
  onCallEnded: () => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ currentUser, onCallEnded }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // This is a placeholder component for WebRTC calling functionality
  // In a full implementation, you would integrate WebRTC APIs here

  if (!isInCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-4xl w-full p-8">
        {/* Video Container */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden mb-6 aspect-video relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">📞</span>
              </div>
              <p className="text-white text-xl font-medium">Call in progress...</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-2xl">{isMuted ? '🔇' : '🎤'}</span>
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="text-2xl">{isVideoOff ? '📹' : '🎥'}</span>
          </button>

          <button
            onClick={() => {
              setIsInCall(false);
              onCallEnded();
            }}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            <span className="text-2xl">📞</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
