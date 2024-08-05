
'use client'
import React, { ReactNode, useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


const QueryProvider = ({ children }: { children: ReactNode }) => {

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity // whenever we fetch data, it will go into cache, inifinity precents refresh of cache when we go to 'x' page. It will refresh if you refresh page through
          }
        }
      }))

  return (
    <QueryClientProvider client={queryClient} >
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}

export default QueryProvider