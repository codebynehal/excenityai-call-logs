
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CallListSkeleton = () => {
  // Create an array of 5 skeleton items
  const skeletonItems = Array.from({ length: 5 }, (_, index) => (
    <Card key={`skeleton-${index}`} className="p-4">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="mt-1">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2 mt-1" />
        </div>
      </div>
    </Card>
  ));

  return <div className="grid gap-4">{skeletonItems}</div>;
};

export default CallListSkeleton;
