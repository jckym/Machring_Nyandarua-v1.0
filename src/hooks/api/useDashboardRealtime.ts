// src/hooks/api/useDashboardRealtime.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { supabaseDashboardKeys } from "./useSupabaseDashboard";

/**
 * Hook that subscribes to realtime changes on sales, visits, and trainings
 * and invalidates the relevant query cache to trigger refetches.
 */
export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Create a single channel for all dashboard realtime updates
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales",
        },
        () => {
          // Invalidate sales-related queries
          queryClient.invalidateQueries({ queryKey: ["supabase", "sales"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "topPerformers"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "products", "performance"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "activity"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "visits",
        },
        () => {
          // Invalidate visits-related queries
          queryClient.invalidateQueries({ queryKey: ["supabase", "visits"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "activity"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trainings",
        },
        () => {
          // Invalidate trainings-related queries
          queryClient.invalidateQueries({ queryKey: ["supabase", "trainings"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "activity"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "machinery_bookings",
        },
        () => {
          // Bookings impact performance tables and dashboards
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "localMRs"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tot_assignments",
        },
        () => {
          // Impacts TOT listings + MR scoping
          queryClient.invalidateQueries({ queryKey: ["supabase", "users"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "localMRs"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
        },
        () => {
          // Impacts role-based counts (e.g., Total TOTs)
          queryClient.invalidateQueries({ queryKey: ["supabase", "users"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          // User status/name changes
          queryClient.invalidateQueries({ queryKey: ["supabase", "users"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

/**
 * Hook specifically for farmer changes realtime updates
 */
export function useFarmersRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("farmers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "farmers",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["supabase", "farmers"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "localMRs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

/**
 * Hook specifically for mechanisation job changes
 */
export function useMechanisationRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("mechanisation-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mechanisation_jobs",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["supabase", "mechanisation"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "dashboard"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
