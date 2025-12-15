import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, TextField, Box, Typography } from '@mui/material';

export default function TransferDialog({ open, onClose, onSubmit, accounts = [], customers = [], suppliers = [] }) {
  const [sourceType, setSourceType] = useState('account');
  const [sourceId, setSourceId] = useState('');
  const [targetType, setTargetType] = useState('customer');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!open) {
      setSourceType('account');
      setSourceId('');
      setTargetType('customer');
      setTargetId('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!sourceId || !targetId || !amount) return;
    onSubmit({
      sourceType,
      sourceId,
      targetType,
      targetId,
      amount: Number(amount),
      description,
      date
    });
  };

  const getAccountTypeLabel = (type) => {
    switch(type) {
      case 'cash': return 'Kasa';
      case 'bank': return 'Banka';
      case 'credit_card': return 'Kredi Kartı';
      case 'personnel': return 'Personel';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transfer</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Kaynak Tipi</InputLabel>
            <Select value={sourceType} label="Kaynak Tipi" onChange={e => { setSourceType(e.target.value); setSourceId(''); }}>
              <MenuItem value="account">Hesap</MenuItem>
              <MenuItem value="customer">Müşteri</MenuItem>
              <MenuItem value="supplier">Tedarikçi</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Kaynak</InputLabel>
            <Select value={sourceId} label="Kaynak" onChange={e => setSourceId(e.target.value)}>
              {sourceType === 'account' && accounts.filter(acc => acc.type !== 'cari').map(acc => <MenuItem key={acc._id} value={acc._id}>{acc.name} ({getAccountTypeLabel(acc.type)})</MenuItem>)}
              {sourceType === 'customer' && customers.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              {sourceType === 'supplier' && suppliers.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Hedef Tipi</InputLabel>
            <Select value={targetType} label="Hedef Tipi" onChange={e => { setTargetType(e.target.value); setTargetId(''); }}>
              <MenuItem value="account">Hesap</MenuItem>
              <MenuItem value="customer">Müşteri</MenuItem>
              <MenuItem value="supplier">Tedarikçi</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Hedef</InputLabel>
            <Select value={targetId} label="Hedef" onChange={e => setTargetId(e.target.value)}>
              {targetType === 'account' && accounts.filter(acc => acc.type !== 'cari').map(acc => <MenuItem key={acc._id} value={acc._id}>{acc.name} ({getAccountTypeLabel(acc.type)})</MenuItem>)}
              {targetType === 'customer' && customers.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              {targetType === 'supplier' && suppliers.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        {(sourceType === targetType && sourceId && targetId && sourceId === targetId) && (
          <Typography color="error" sx={{ mb: 2 }}>Kaynak ve hedef aynı olamaz!</Typography>
        )}
        <TextField label="Tutar" value={amount} onChange={e => setAmount(e.target.value)} type="number" fullWidth margin="normal" required />
        <TextField label="Açıklama" value={description} onChange={e => setDescription(e.target.value)} fullWidth margin="normal" />
        <TextField label="Tarih" value={date} onChange={e => setDate(e.target.value)} type="date" fullWidth margin="normal" required />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!sourceId || !targetId || !amount || (sourceType === targetType && sourceId === targetId)}>Transfer Yap</Button>
      </DialogActions>
    </Dialog>
  );
} 