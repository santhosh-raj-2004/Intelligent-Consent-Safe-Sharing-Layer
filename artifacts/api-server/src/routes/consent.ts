import { Router, type IRouter } from "express";
import {
  ExplainConsentBody,
  ExplainConsentResponse,
  SubmitDecisionBody,
  SubmitDecisionResponse,
  GetStatusResponse,
  RevokeAccessResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type DecisionStatus = "accepted" | "rejected" | "pending" | "revoked";

interface ConsentState {
  status: DecisionStatus;
  data_type: string | null;
  purpose: string | null;
}

const state: ConsentState = {
  status: "pending",
  data_type: null,
  purpose: null,
};

const riskMap: Record<string, "Low" | "Moderate" | "High"> = {
  location: "Moderate",
  contacts: "High",
  email: "Low",
};

const explanationMap: Record<string, string> = {
  location:
    "We use your location to suggest nearby services relevant to where you are. Your coordinates are processed in real-time and not stored permanently.",
  contacts:
    "We access your contacts to help you invite friends or find people you know. This gives us access to names, phone numbers, and email addresses.",
  email:
    "We use your email address to send you personalized offers and updates. You can unsubscribe at any time.",
};

router.post("/explain", (req, res) => {
  const parsed = ExplainConsentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { data_type, purpose } = parsed.data;
  const normalizedType = data_type.toLowerCase();

  req.log.info({ data_type, purpose }, "explanation requested");

  const explanation =
    explanationMap[normalizedType] ??
    `We use your ${data_type} data for: ${purpose}. Please review the details carefully before accepting.`;

  const risk: "Low" | "Moderate" | "High" = riskMap[normalizedType] ?? "Moderate";

  state.data_type = data_type;
  state.purpose = purpose;

  const response = ExplainConsentResponse.parse({
    explanation,
    risk,
    data_type,
    purpose,
  });

  res.json(response);
});

router.post("/decision", (req, res) => {
  const parsed = SubmitDecisionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { status } = parsed.data;
  state.status = status;

  req.log.info({ status }, "user decision recorded");

  const message =
    status === "accepted"
      ? "Access granted. You can revoke this at any time from the Control Panel."
      : "Access denied. No data will be shared.";

  const response = SubmitDecisionResponse.parse({ message, status });
  res.json(response);
});

router.get("/status", (_req, res) => {
  const response = GetStatusResponse.parse({
    status: state.status,
    data_type: state.data_type,
    purpose: state.purpose,
  });
  res.json(response);
});

router.post("/revoke", (req, res) => {
  state.status = "revoked";

  req.log.info("access revoked");

  const response = RevokeAccessResponse.parse({
    message: "Access has been revoked. Your data will no longer be shared.",
    status: "revoked",
  });
  res.json(response);
});

export default router;
