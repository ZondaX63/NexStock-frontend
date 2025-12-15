import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        lowStock: false,
    });
    const [sort, setSort] = useState({ field: 'name', order: 'asc' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            
            // Eğer arama terimi varsa, gelişmiş arama kullan
            if (searchTerm && searchTerm.trim().length > 0) {
                const searchParams = new URLSearchParams({
                    q: searchTerm,
                    ...(filters.category && { category: filters.category }),
                    ...(filters.brand && { brand: filters.brand }),
                    ...(filters.lowStock && { lowStock: filters.lowStock }),
                    ...(filters.minStock && { minStock: filters.minStock }),
                    ...(filters.maxStock && { maxStock: filters.maxStock }),
                    ...(filters.minPrice && { minPrice: filters.minPrice }),
                    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                    ...(filters.trackStock && { trackStock: filters.trackStock }),
                    sort: sort.field,
                    order: sort.order
                });
                
                res = await api.get(`/search/products?${searchParams}`);
                if (res.data.success) {
                    setProducts(res.data.products || []);
                    setTotalPages(1); // Arama sonuçları için sayfalama yok
                    setTotalProducts(res.data.totalResults || 0);
                } else {
                    setProducts([]);
                    setTotalPages(1);
                    setTotalProducts(0);
                }
            } else {
                // Normal ürün listesi
                const params = {
                    page,
                    category: filters.category,
                    brand: filters.brand,
                    lowStock: filters.lowStock,
                    ...(filters.minStock && { minStock: filters.minStock }),
                    ...(filters.maxStock && { maxStock: filters.maxStock }),
                    ...(filters.minPrice && { minPrice: filters.minPrice }),
                    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                    ...(filters.trackStock && { trackStock: filters.trackStock }),
                    sort: sort.field,
                    order: sort.order,
                };
                res = await api.get('/products', { params });
                setProducts(res.data.products || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalProducts(res.data.totalProducts || 0);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
            setTotalPages(1);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filters, sort]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const deleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Delete product error:', error);
            return { success: false, error: error.response?.data?.msg || 'Silme işlemi başarısız' };
        }
    };

    const createProduct = async (productData) => {
        try {
            await api.post('/products', productData);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Create product error:', error);
            return { success: false, error: error.response?.data?.msg || 'Ürün oluşturulamadı' };
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            console.log('Sending productData to backend:', productData);
            await api.put(`/products/${id}`, productData);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Update product error:', error);
            return { success: false, error: error.response?.data?.msg || 'Ürün güncellenemedi' };
        }
    };

    return {
        // State
        products,
        loading,
        searchTerm,
        filters,
        sort,
        page,
        totalPages,
        totalProducts,
        
        // Setters
        setSearchTerm,
        setFilters,
        setSort,
        setPage,
        
        // Actions
        fetchData,
        deleteProduct,
        createProduct,
        updateProduct
    };
};
