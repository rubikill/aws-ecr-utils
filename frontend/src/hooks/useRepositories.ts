import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export interface Stats {
  totalRepositories: number;
  totalImages: number;
  totalSize: number;
  lastScan: string;
}

export interface ScanRequest {
  profile: string;
  region: string;
}

export function useRepositories() {
  const queryClient = useQueryClient();

  const { data: repositories, isLoading: isLoadingRepositories } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => api.getRepositories(),
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
  });

  const { mutateAsync: scan, isPending: isScanning } = useMutation({
    mutationFn: (request: ScanRequest) => api.scanRepositories(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  return {
    repositories,
    stats,
    isLoading: isLoadingRepositories || isLoadingStats,
    scan,
    isScanning,
  };
}
