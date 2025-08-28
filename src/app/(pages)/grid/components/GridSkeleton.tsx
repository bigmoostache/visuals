import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const GridSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Context section skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-24 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Sections header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Section skeletons */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-48 flex-1" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[1, 2].map((j) => (
                  <Card key={j}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 mt-1" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="space-y-2">
                        {[1, 2].map((k) => (
                          <div key={k} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-10 w-20" />
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        ))}
                      </div>
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </Card>
                ))}
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};