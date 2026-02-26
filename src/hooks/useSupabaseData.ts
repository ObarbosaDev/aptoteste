import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generic realtime hook
export function useRealtimeTable<T extends { id: string }>(
  table: string,
  orderBy: string = "created_at",
  ascending: boolean = false
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: rows, error } = await (supabase
      .from(table as any)
      .select("*")
      .order(orderBy, { ascending }) as any);
    if (error) {
      console.error(`Error fetching ${table}:`, error);
    } else {
      setData((rows || []) as T[]);
    }
    setLoading(false);
  }, [table, orderBy, ascending]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`realtime_${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, fetchData]);

  return { data, loading, refetch: fetchData };
}

// Dashboard stats hook with realtime
export function useDashboardStats() {
  const [stats, setStats] = useState({
    pendingPackages: 0,
    activeResidents: 0,
    visitorsToday: 0,
    openOccurrences: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    
    const [pkgRes, profilesRes, visitorsRes, occRes] = await Promise.all([
      supabase.from("packages").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("visitors").select("id", { count: "exact", head: true }).gte("entry_at", today),
      supabase.from("occurrences").select("id", { count: "exact", head: true }).neq("status", "resolvida"),
    ]);

    setStats({
      pendingPackages: pkgRes.count || 0,
      activeResidents: profilesRes.count || 0,
      visitorsToday: visitorsRes.count || 0,
      openOccurrences: occRes.count || 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();

    const tables = ["packages", "visitors", "occurrences", "profiles"];
    const channels = tables.map((table) =>
      supabase
        .channel(`dashboard_${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => fetchStats())
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [fetchStats]);

  return { stats, loading };
}
