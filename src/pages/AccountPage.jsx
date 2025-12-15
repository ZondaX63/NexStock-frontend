import React, { useState, useCallback, useContext } from 'react';
import { AccountBalance } from '@mui/icons-material';
import AccountSearchBar from '../components/accounts/AccountSearchBar';
import AccountGroup from '../components/accounts/AccountGroup';
import AccountForm from '../components/accounts/AccountForm';
import AccountDetail from '../components/accounts/AccountDetail';
import AccountDeleteDialog from '../components/accounts/AccountDeleteDialog';
import TransferDialog from '../components/accounts/TransferDialog';
import CariSummaryWidget from '../components/accounts/CariSummaryWidget';
import api from '../api';
import { AppContext } from '../contexts/AppContext';
import { useGlobalBalances } from '../hooks/useGlobalBalances';

const AccountPage = () => {
    const { triggerRefresh } = useContext(AppContext);
    const {
        totalCash,
        totalReceivables,
        totalPayables,
        companyAccounts,
        customers,
        suppliers,
        refreshBalances
    } = useGlobalBalances();

    // Local state for UI
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'cash',
        balance: 0,
        currency: 'TRY',
        cariType: '',
        email: '',
        phone: '',
        address: ''
    });
    const [isEdit, setIsEdit] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferSource, setTransferSource] = useState(null);
    const [undoAccount, setUndoAccount] = useState(null);

    // Filtered accounts - combine all for search/filter
    const allAccounts = [...companyAccounts, ...customers, ...suppliers];

    // We need to map customers/suppliers back to account-like structure for the list if needed, 
    // but the original page treated them as accounts. 
    // However, useGlobalBalances returns them separately.
    // Let's reconstruct the 'accounts' array expected by the UI from the hook's data.

    const accounts = [
        ...companyAccounts,
        ...customers.map(c => ({
            ...c,
            type: 'cari',
            cariType: 'customer',
            balance: c.unpaidAmount // Map unpaidAmount to balance for display
        })),
        ...suppliers.map(s => ({
            ...s,
            type: 'cari',
            cariType: 'supplier',
            balance: s.unpaidAmount // Map unpaidAmount to balance for display
        }))
    ];

    // Filtered accounts
    const filtered = accounts.filter(acc => {
        if (filter === 'company') return ['cash', 'bank', 'credit_card', 'personnel'].includes(acc.type);
        if (filter === 'customer') return acc.type === 'cari' && acc.cariType === 'customer';
        if (filter === 'supplier') return acc.type === 'cari' && acc.cariType === 'supplier';
        return true;
    }).filter(acc => acc.name.toLowerCase().includes(search.toLowerCase()));

    // Groups
    const filteredCompanyAccounts = filtered.filter(acc => ['cash', 'bank', 'credit_card', 'personnel'].includes(acc.type));
    const customerAccounts = filtered.filter(acc => acc.type === 'cari' && acc.cariType === 'customer');
    const supplierAccounts = filtered.filter(acc => acc.type === 'cari' && acc.cariType === 'supplier');

    // Grand total - Use totalCash from hook for company assets
    // The user asked for "Company Accounts" total to be 155,000. 
    // totalCash represents exactly that (sum of cash/bank/etc).
    const grandTotal = totalCash;
    const totalColor = grandTotal >= 0 ? 'text-emerald-600' : 'text-red-600';

    // Quick add
    const handleQuickAdd = (group) => {
        setFormData({
            name: '',
            type: group === 'company' ? 'cash' : 'cari',
            balance: 0,
            currency: 'TRY',
            cariType: group === 'customer' ? 'customer' : group === 'supplier' ? 'supplier' : '',
            email: '',
            phone: '',
            address: ''
        });
        setIsEdit(false);
        setFormOpen(true);
    };

    const handleEdit = (acc) => {
        setFormData({ ...acc });
        setIsEdit(true);
        setFormOpen(true);
    };

    const handleDelete = (acc) => {
        setSelectedAccount(acc);
        setDeleteOpen(true);
    };

    const handleDetail = (acc) => {
        setSelectedAccount(acc);
        setDetailOpen(true);
    };

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFormSave = async () => {
        if (formData.type === 'cari' && (!formData.cariType || !formData.email)) {
            alert('Cari hesap için tür ve e-posta zorunlu.');
            return;
        }
        try {
            if (isEdit) {
                await api.put(`/accounts/${formData._id}`, formData);
            } else {
                await api.post('/accounts', formData);

                // Refresh related pages
                if (formData.type === 'cari') {
                    if (formData.cariType === 'customer') {
                        triggerRefresh('customers');
                    } else if (formData.cariType === 'supplier') {
                        triggerRefresh('suppliers');
                    }
                }
            }
            setFormOpen(false);
            refreshBalances();
            triggerRefresh('accounts');
        } catch (error) {
            console.error('Error saving account:', error);
            alert('Hesap kaydedilemedi');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const accountToDelete = selectedAccount;
            setUndoAccount(accountToDelete);
            await api.delete(`/accounts/${accountToDelete._id}`);
            setDeleteOpen(false);
            setDeleteOpen(false);
            refreshBalances();

            // Refresh related pages
            if (accountToDelete.type === 'cari') {
                if (accountToDelete.cariType === 'customer') {
                    triggerRefresh('customers');
                } else if (accountToDelete.cariType === 'supplier') {
                    triggerRefresh('suppliers');
                }
            }
            triggerRefresh('accounts');
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Hesap silinemedi');
        }
    };

    const handleUndo = async (acc) => {
        if (!acc) return;
        const { _id, ...rest } = acc;
        try {
            await api.post('/accounts', rest);
            await api.post('/accounts', rest);
            refreshBalances();

            // Refresh related pages
            if (acc.type === 'cari') {
                if (acc.cariType === 'customer') {
                    triggerRefresh('customers');
                } else if (acc.cariType === 'supplier') {
                    triggerRefresh('suppliers');
                }
            }
            triggerRefresh('accounts');
        } catch (error) {
            console.error('Error undoing delete:', error);
            alert('Geri alma başarısız');
        }
        setUndoAccount(null);
    };

    // Transfer
    const handleTransfer = (acc) => {
        setTransferSource(acc);
        setTransferOpen(true);
    };

    const handleTransferSubmit = async (data) => {
        try {
            await api.post('/accounts/transfer', data);
            setTransferOpen(false);
            setTransferOpen(false);
            refreshBalances();
        } catch (error) {
            console.error('Error transferring:', error);
            alert('Transfer başarısız');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <AccountBalance className="mr-2" />
                    Hesaplar
                </h2>
                <p className={`text-lg font-semibold mt-2 ${totalColor}`}>
                    Toplam Bakiye: {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </p>
            </div>

            {/* Cari Hesaplar Özeti */}
            <CariSummaryWidget
                customers={customers}
                suppliers={suppliers}
                totalReceivables={totalReceivables}
                totalPayables={totalPayables}
            />

            <AccountSearchBar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />

            {filter === 'all' && (
                <>
                    <AccountGroup
                        title="Şirket Hesapları"
                        accounts={filteredCompanyAccounts}
                        onAdd={() => handleQuickAdd('company')}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDetail={handleDetail}
                        onTransfer={handleTransfer}
                    />
                    <AccountGroup
                        title="Müşteri Hesapları"
                        accounts={customerAccounts}
                        onAdd={() => handleQuickAdd('customer')}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDetail={handleDetail}
                        onTransfer={handleTransfer}
                    />
                    <AccountGroup
                        title="Tedarikçi Hesapları"
                        accounts={supplierAccounts}
                        onAdd={() => handleQuickAdd('supplier')}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDetail={handleDetail}
                        onTransfer={handleTransfer}
                    />
                </>
            )}
            {filter === 'company' && (
                <AccountGroup
                    title="Şirket Hesapları"
                    accounts={filteredCompanyAccounts}
                    onAdd={() => handleQuickAdd('company')}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDetail={handleDetail}
                    onTransfer={handleTransfer}
                />
            )}
            {filter === 'customer' && (
                <AccountGroup
                    title="Müşteri Hesapları"
                    accounts={customerAccounts}
                    onAdd={() => handleQuickAdd('customer')}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDetail={handleDetail}
                    onTransfer={handleTransfer}
                />
            )}
            {filter === 'supplier' && (
                <AccountGroup
                    title="Tedarikçi Hesapları"
                    accounts={supplierAccounts}
                    onAdd={() => handleQuickAdd('supplier')}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDetail={handleDetail}
                    onTransfer={handleTransfer}
                />
            )}

            <AccountForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSave={handleFormSave}
                form={formData}
                onChange={handleFormChange}
            />
            <TransferDialog
                open={transferOpen}
                onClose={() => setTransferOpen(false)}
                source={transferSource}
                onSubmit={handleTransferSubmit}
                accounts={accounts}
            />
            <AccountDetail
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                account={selectedAccount}
            />
            <AccountDeleteDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onDelete={handleDeleteConfirm}
                account={selectedAccount}
                onUndo={handleUndo}
                undoAccount={undoAccount}
            />
        </div>
    );
};

export default AccountPage;
