import React from 'react';
import { Warning, Undo } from '@mui/icons-material';

const AccountDeleteDialog = ({ open, onClose, onDelete, account, onUndo, undoAccount }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-slate-900 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Warning className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-bold text-slate-900">
                                    Hesabı Sil
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500">
                                        <strong>{account?.name}</strong> hesabını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {undoAccount && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-amber-800">
                                        <strong>{undoAccount.name}</strong> silindi
                                    </p>
                                    <button
                                        onClick={() => onUndo(undoAccount)}
                                        className="inline-flex items-center px-3 py-1 border border-amber-600 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors"
                                    >
                                        <Undo className="h-4 w-4 mr-1" />
                                        Geri Al
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={onDelete}
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Sil
                        </button>
                        <button
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDeleteDialog;
