import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const GridSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Context section skeleton */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Sections header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Section skeletons */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-7 w-7" />
                  <Skeleton className="h-6 w-32 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {[1, 2].map((j) => (
                  <Card key={j} className="border-gray-200">
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 mt-1" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="space-y-2">
                        {[1, 2].map((k) => (
                          <div key={k} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 flex-1" />
                            <Skeleton className="h-7 w-7" />
                          </div>
                        ))}
                      </div>
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};