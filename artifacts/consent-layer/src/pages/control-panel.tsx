import { motion } from "framer-motion";
import { Shield, Activity, Lock, AlertCircle, History, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetStatus, useRevokeAccess, getGetStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function ControlPanel() {
  const queryClient = useQueryClient();
  const { data: statusData, isLoading } = useGetStatus();

  const revokeMutation = useRevokeAccess({
    mutation: {
      onSuccess: () => {
        console.log("access revoked");
        queryClient.invalidateQueries({ queryKey: getGetStatusQueryKey() });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Activity className="w-8 h-8 animate-spin" />
          <p>Loading security status...</p>
        </div>
      </div>
    );
  }

  const isAccepted = statusData?.status === "accepted";
  const isRevoked = statusData?.status === "revoked";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">Security Control Panel</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your active data sharing agreements</p>
        </div>
        <div className="hidden md:flex p-3 bg-white rounded-2xl shadow-sm border border-border/50 items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Status</p>
            <p className="text-sm font-bold text-emerald-600">Secure & Monitored</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass-panel border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Active Connections</CardTitle>
                <CardDescription>Applications currently accessing your data</CardDescription>
              </div>
              <Badge variant={isAccepted ? "success" : "secondary"}>
                {isAccepted ? "1 Active" : "0 Active"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isAccepted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground capitalize">
                        {statusData?.data_type || "Unknown Data"}
                      </h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Purpose: {statusData?.purpose || "Active processing"}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Connection
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="destructive"
                      onClick={() => revokeMutation.mutate()}
                      isLoading={revokeMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Revoke Access Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
                {isRevoked ? (
                  <>
                    <History className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-foreground">Access previously revoked</p>
                    <p className="text-sm text-muted-foreground mt-1">No applications have active access to your data.</p>
                  </>
                ) : (
                  <>
                    <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-foreground">No active connections</p>
                    <p className="text-sm text-muted-foreground mt-1">Your data is completely private.</p>
                  </>
                )}
                <div className="mt-6">
                  <Link href="/" className="text-primary hover:underline text-sm font-medium">
                    View new requests →
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-white/50">
          <CardHeader>
            <CardTitle className="text-lg">Audit Log</CardTitle>
            <CardDescription>Recent security events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isAccepted && (
                <div className="flex gap-3">
                  <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Consent Granted</p>
                    <p className="text-xs text-muted-foreground mt-0.5">For {statusData?.data_type}</p>
                    <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> Just now
                    </p>
                  </div>
                </div>
              )}
              {isRevoked && (
                <div className="flex gap-3">
                  <div className="mt-0.5"><Lock className="w-4 h-4 text-rose-500" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Access Revoked</p>
                    <p className="text-xs text-muted-foreground mt-0.5">User manually terminated connection</p>
                    <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> Just now
                    </p>
                  </div>
                </div>
              )}
              {statusData?.status === "rejected" && (
                <div className="flex gap-3">
                  <div className="mt-0.5"><AlertCircle className="w-4 h-4 text-amber-500" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Request Denied</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Prevented data sharing</p>
                  </div>
                </div>
              )}
              {(!isAccepted && !isRevoked && statusData?.status !== "rejected") && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
