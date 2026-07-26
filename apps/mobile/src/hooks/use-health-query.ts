import { useQuery } from '@tanstack/react-query';

import { getHealth, hasApiBaseUrl } from '@/lib/api';

export function useHealthQuery() {
  return useQuery({
    enabled: hasApiBaseUrl,
    queryFn: getHealth,
    queryKey: ['health'],
  });
}
