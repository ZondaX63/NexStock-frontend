import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from '@mui/icons-material';
import api from '../api';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState(null);
    const [company, setCompany] = useState(null);
    const [unitInput, setUnitInput] = useState('');
    const [docTypeInput, setDocTypeInput] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/settings');
                setSettings(data.settings);
                setCompany(data.company);
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleCompanyChange = (e) => {
        setCompany({ ...company, [e.target.name]: e.target.value });
    };

    const handleSettingsChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleAddUnit = () => {
        if (unitInput && !settings.units.includes(unitInput)) {
            setSettings({ ...settings, units: [...settings.units, unitInput] });
            setUnitInput('');
        }
    };

    const handleDeleteUnit = (unit) => {
        setSettings({ ...settings, units: settings.units.filter(u => u !== unit) });
    };

    const handleAddDocType = () => {
        if (docTypeInput && !settings.documentTypes.includes(docTypeInput)) {
            setSettings({ ...settings, documentTypes: [...settings.documentTypes, docTypeInput] });
            setDocTypeInput('');
        }
    };

    const handleDeleteDocType = (docType) => {
        setSettings({ ...settings, documentTypes: settings.documentTypes.filter(d => d !== docType) });
    };

    const handleSave = async () => {
        if (window.confirm('Ayarları kaydetmek istediğinize emin misiniz?')) {
            try {
                setSaving(true);
                await api.put('/settings', { settings, company });
                alert('Ayarlar kaydedildi.');
            } catch (error) {
                console.error('Error saving settings:', error);
                alert('Ayarlar kaydedilemedi.');
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!settings || !company) {
        return <div className="text-center text-slate-500 py-10">Ayarlar yüklenemedi.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <SettingsIcon className="mr-2" />
                        Ayarlar
                    </h2>
                    <p className="text-slate-500 mt-1">Sistem ayarlarını buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/30 disabled:opacity-50"
                >
                    <Save className="mr-2 h-5 w-5" />
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="border-b border-slate-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            Genel Ayarlar
                        </button>
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'appearance'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            Görünüm
                        </button>
                        <button
                            onClick={() => setActiveTab('units')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'units'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            Birimler
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'documents'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            Belge Türleri
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Şirket Adı</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={company.name}
                                    onChange={handleCompanyChange}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">E-posta</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={company.email}
                                    onChange={handleCompanyChange}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Telefon</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={company.phone}
                                    onChange={handleCompanyChange}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Vergi Numarası</label>
                                <input
                                    type="text"
                                    name="taxNumber"
                                    value={company.taxNumber}
                                    onChange={handleCompanyChange}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Adres</label>
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={company.address}
                                    onChange={handleCompanyChange}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 mb-4">Uygulama Teması</h3>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="theme"
                                        value="light"
                                        checked={settings.theme === 'light'}
                                        onChange={handleSettingsChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Açık Mod</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="theme"
                                        value="dark"
                                        checked={settings.theme === 'dark'}
                                        onChange={handleSettingsChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">Koyu Mod</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'units' && (
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 mb-4">Ölçü Birimleri Yönetimi</h3>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={unitInput}
                                    onChange={(e) => setUnitInput(e.target.value)}
                                    placeholder="Yeni birim ekle"
                                    className="flex-1 border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <button
                                    onClick={handleAddUnit}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Ekle
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {settings.units.map((unit) => (
                                    <span
                                        key={unit}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800"
                                    >
                                        {unit}
                                        <button
                                            onClick={() => handleDeleteUnit(unit)}
                                            className="ml-2 text-slate-500 hover:text-red-600"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 mb-4">Belge Türleri Yönetimi</h3>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={docTypeInput}
                                    onChange={(e) => setDocTypeInput(e.target.value)}
                                    placeholder="Yeni belge türü ekle"
                                    className="flex-1 border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <button
                                    onClick={handleAddDocType}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Ekle
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {settings.documentTypes.map((docType) => (
                                    <span
                                        key={docType}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800"
                                    >
                                        {docType}
                                        <button
                                            onClick={() => handleDeleteDocType(docType)}
                                            className="ml-2 text-slate-500 hover:text-red-600"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
