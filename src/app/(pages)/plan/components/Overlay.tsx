// Overlay.tsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa'; // Import a spinner icon from react-icons

interface OverlayProps {
    isVisible: boolean;
}

const Overlay: React.FC<OverlayProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <FaSpinner className="text-white text-6xl animate-spin" /> {/* Spinner icon */}
        </div>
    );
};

export default Overlay;
