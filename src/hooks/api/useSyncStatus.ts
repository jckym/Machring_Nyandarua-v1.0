// src/hooks/api/useSyncStatus.ts
export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: () => syncService.getPendingCount(),
    refetchInterval: 30000, // 30 seconds
  });
}

// src/hooks/useGlobalSearch.ts
export function useGlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = () => {
    // Global search across farmers, sales, visits, etc.
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return { searchQuery, setSearchQuery, handleSearch };
}
