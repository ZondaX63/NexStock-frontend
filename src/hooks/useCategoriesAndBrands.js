import { useState, useEffect } from 'react';
import api from '../api';

export const useCategoriesAndBrands = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoriesAndBrands = async () => {
            try {
                const [categoriesRes, brandsRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/brands')
                ]);
                setCategories(categoriesRes.data);
                setBrands(brandsRes.data);
            } catch (error) {
                console.error('Error fetching categories and brands:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesAndBrands();
    }, []);

    const createCategory = async (name) => {
        try {
            const res = await api.post('/categories', { name });
            setCategories(prev => [...prev, res.data]);
            return { success: true, data: res.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.msg || 'Kategori oluşturulamadı' };
        }
    };

    const createBrand = async (name) => {
        try {
            const res = await api.post('/brands', { name });
            setBrands(prev => [...prev, res.data]);
            return { success: true, data: res.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.msg || 'Marka oluşturulamadı' };
        }
    };

    return {
        categories,
        brands,
        loading,
        createCategory,
        createBrand
    };
};
