import { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { DateRange } from "react-day-picker";
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { Lead } from '../types';
import { getLeads } from '@/lib/api';

export function useLeadsData(isMobile: boolean) {
  // Mobile/Pagination states (we still keep the accumulated list for mobile if desired, or we just rely on query data)
  // Let's keep a local state for leads if we need to append for mobile, but for now we can just sync it
  const [accumulatedLeads, setAccumulatedLeads] = useState<Lead[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState([
    'name',
    'agent',
    'phone',
    'stage',
    'city',
    'profession',
    'notes',
    'created_at',
    'actions'
  ]);

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [filters, setFilters] = useState<{
    search: string;
    status: string[];
    stage: string[];
    source: string[];
    dateRange: DateRange | undefined;
    createdAt: DateRange | undefined;
  }>({
    search: '',
    status: [],
    stage: [],
    source: [],
    dateRange: undefined,
    createdAt: undefined
  });

  const debouncedSearch = useDebounce(filters.search, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (filters.search !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [filters.search, debouncedSearch]);

  const fetchLeadsConfig = useMemo(() => ({
    page: currentPage,
    search: searchTerm,
    status: statusFilter,
    perPage: itemsPerPage
  }), [currentPage, searchTerm, statusFilter, itemsPerPage]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      stage: [],
      source: [],
      dateRange: undefined,
      createdAt: undefined
    });
    setCurrentPage(1);
  };

  const queryParams = useMemo(() => ({
    page: currentPage,
    per_page: itemsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filters.status.length > 0 && { status: filters.status.join(',') }),
    ...(filters.stage.length > 0 && { stage: filters.stage.join(',') }),
    ...(filters.source.length > 0 && { source: filters.source.join(',') }),
    ...(filters.dateRange?.from && {
      last_contact_from: format(filters.dateRange.from, 'yyyy-MM-dd')
    }),
    ...(filters.dateRange?.to && {
      last_contact_to: format(filters.dateRange.to, 'yyyy-MM-dd')
    }),
    ...(filters.createdAt?.from && {
      created_from: format(filters.createdAt.from, 'yyyy-MM-dd')
    }),
    ...(filters.createdAt?.to && {
      created_to: format(filters.createdAt.to, 'yyyy-MM-dd')
    })
  }), [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    filters.status,
    filters.stage,
    filters.source,
    filters.dateRange,
    filters.createdAt
  ]);

  const { data, isLoading: queryIsLoading, error: queryError, refetch } = useQuery({
    queryKey: ['leads', queryParams],
    queryFn: async () => {
      const response = await getLeads(queryParams);
      if (response?.data && Array.isArray(response.data)) {
        return response;
      }
      throw new Error('Invalid response format from API');
    },
    // Prevent query from running if we're just waiting for debounce
    enabled: filters.search === debouncedSearch,
  });

  // Sync with local states to preserve exact return shape
  useEffect(() => {
    console.log('useQuery data changed:', data);
    if (data?.data) {
      setAccumulatedLeads(prev => (currentPage === 1 || !isMobile) ? data.data : [...prev, ...data.data]);
    }
  }, [data, currentPage, isMobile]);

  useEffect(() => {
    if (!queryIsLoading && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [queryIsLoading, isInitialLoading]);

  console.log('useLeadsData render:', { 
    queryIsLoading, 
    queryError, 
    accumulatedLeadsCount: accumulatedLeads.length,
    queryParams,
    enabled: filters.search === debouncedSearch
  });

  // The caller expects `fetchLeads` to be a function returning a promise.
  const fetchLeads = async () => {
    await refetch();
  };

  // Extract variables for the exact return shape
  const leads = accumulatedLeads;
  const isLoading = queryIsLoading;
  const error = queryError instanceof Error ? queryError.message : (queryError ? String(queryError) : null);
  const totalItems = data?.total || data?.meta?.total || 0;
  const totalPages = data?.last_page || data?.meta?.last_page || 1;

  return {
    leads,
    setLeads: setAccumulatedLeads,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    visibleColumns,
    setVisibleColumns,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    isInitialLoading,
    setIsInitialLoading,
    itemsPerPage,
    setItemsPerPage,
    isLoading,
    setIsLoading: () => {}, // No-op, managed by react-query
    totalItems,
    setTotalItems: () => {}, // No-op, managed by react-query
    totalPages,
    setTotalPages: () => {}, // No-op, managed by react-query
    error,
    setError: () => {}, // No-op, managed by react-query
    filters,
    setFilters,
    debouncedSearch,
    isSearching,
    setIsSearching,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    handleFilterChange,
    clearFilters,
    fetchLeads,
    fetchLeadsConfig
  };
}
