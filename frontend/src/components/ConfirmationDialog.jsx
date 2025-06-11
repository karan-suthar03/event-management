import React from 'react';
import {HiCheckCircle, HiXMark} from 'react-icons/hi2';

const ConfirmationDialog = ({message, onClose, title = 'Success!'}) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm transition-opacity">
            <div
                className="bg-slate-800 border border-green-500 rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-md mx-4 animate-bounce-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center mb-4">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                        <HiCheckCircle className="h-8 w-8 text-green-600"/>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="ml-auto bg-slate-700 hover:bg-slate-600 rounded-full p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <HiXMark className="h-6 w-6"/>
                    </button>
                </div>

                <div className="mt-4">
                    <p className="text-gray-300 text-base">{message}</p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
