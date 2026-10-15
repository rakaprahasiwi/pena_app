import React from 'react';

interface LoadingModalProps {
    isOpen: boolean;
    message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, message = "Memproses..." }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-2xl">
                {/* Animasi Spinner */}
                <div className="w-12 h-12 mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                {/* Pesan Loading */}
                <p className="text-lg font-semibold text-gray-800">{message}</p>
            </div>
        </div>
    );
};

export default LoadingModal;