import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ShieldAlert, Fingerprint, MapPin, Mail, ChevronRight, CheckCircle2, XCircle, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExplainConsent, useSubmitDecision } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetStatusQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

type FlowState = "request" | "explaining" | "explained" | "success" | "rejected";

const DATA_OPTIONS = [
  { id: "location", icon: MapPin, label: "Location Data", purpose: "Recommend nearby services" },
  { id: "contacts", icon: Fingerprint, label: "Address Book", purpose: "Import your address book" },
  { id: "email", icon: Mail, label: "Email Address", purpose: "Send you personalized offers" },
] as const;

export default function ConsentFlow() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [flowState, setFlowState] = useState<FlowState>("request");
  const [selectedOption, setSelectedOption] = useState<typeof DATA_OPTIONS[number]>(DATA_OPTIONS[0]);

  const explainMutation = useExplainConsent();
  const decisionMutation = useSubmitDecision({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetStatusQueryKey() });
      }
    }
  });

  const handleExplain = () => {
    setFlowState("explaining");
    console.log("explanation clicked for:", selectedOption.id);

    explainMutation.mutate(
      { data: { data_type: selectedOption.id, purpose: selectedOption.purpose } },
      {
        onSuccess: () => setFlowState("explained"),
        onError: () => setFlowState("request"),
      }
    );
  };

  const handleDecision = (status: "accepted" | "rejected") => {
    console.log(status === "accepted" ? "accepted" : "rejected");
    decisionMutation.mutate(
      { data: { status } },
      {
        onSuccess: () => setFlowState(status === "accepted" ? "success" : "rejected"),
      }
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "success";
      case "Moderate": return "warning";
      case "High": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="w-full max-w-md relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {flowState === "request" && (
            <motion.div
              key="request"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-panel overflow-hidden border-0">
                <div className="h-2 w-full bg-gradient-to-r from-primary/80 to-purple-500/80" />
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldAlert className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">Data Request</CardTitle>
                  <CardDescription className="text-base mt-2">
                    An application is requesting access to your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {DATA_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                          selectedOption.id === opt.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-white hover:border-primary/30 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          selectedOption.id === opt.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                        )}>
                          <opt.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{opt.label}</p>
                          <p className="text-sm text-muted-foreground">{opt.purpose}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          selectedOption.id === opt.id ? "border-primary" : "border-muted-foreground/30"
                        )}>
                          {selectedOption.id === opt.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3 flex-col sm:flex-row pt-4 bg-gray-50/50 border-t">
                  <Button variant="ghost" className="w-full sm:w-auto" onClick={() => handleDecision("rejected")}>
                    Cancel
                  </Button>
                  <Button className="w-full sm:flex-1 group" onClick={handleExplain}>
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    Explain with AI
                    <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {flowState === "explaining" && (
            <motion.div
              key="explaining"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center py-20"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-primary/20 rounded-full animate-pulse" />
                <BrainCircuit className="w-10 h-10 text-primary absolute inset-0 m-auto animate-bounce" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">AI is analyzing...</h3>
              <p className="text-muted-foreground mt-2">Evaluating risks and formatting plain-language explanation.</p>
            </motion.div>
          )}

          {flowState === "explained" && explainMutation.data && (
            <motion.div
              key="explained"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <Card className="glass-card overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                    <h3 className="font-display text-xl font-bold">AI Analysis Complete</h3>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-border/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <p className="text-foreground leading-relaxed">
                      "{explainMutation.data.explanation}"
                    </p>
                  </div>
                </div>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assessed Risk Level</p>
                      <p className="font-semibold text-foreground mt-1">For {explainMutation.data.data_type}</p>
                    </div>
                    <Badge variant={getRiskColor(explainMutation.data.risk) as any} className="text-sm px-4 py-1.5">
                      {explainMutation.data.risk} Risk
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => handleDecision("rejected")}
                    isLoading={decisionMutation.isPending}
                  >
                    Reject Request
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleDecision("accepted")}
                    isLoading={decisionMutation.isPending}
                  >
                    Accept & Share
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {flowState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white p-8 rounded-3xl shadow-xl border border-emerald-100"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Consent Granted</h2>
              <p className="text-gray-500 mb-8">
                You have securely shared your {selectedOption.label.toLowerCase()}. You can revoke this access at any time.
              </p>
              <Button size="lg" className="w-full" onClick={() => setLocation("/control-panel")}>
                Go to Control Panel
              </Button>
            </motion.div>
          )}

          {flowState === "rejected" && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Request Denied</h2>
              <p className="text-gray-500 mb-8">
                Your data remains private. No information was shared with the application.
              </p>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setFlowState("request")}>
                Return to Requests
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
