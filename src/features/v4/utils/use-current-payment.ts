import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { getPaymentStateLabel, getPaymentStatus, type PaymentReadinessState, type PaymentStatusLike } from "./payment-state";

interface CurrentPaymentResponse {
  payment?: PaymentStatusLike | null;
  paymentStatus?: string | null;
  redirectTo?: string | null;
}

export function useCurrentPaymentStatus(fallbackStatus?: string | null) {
  const [status, setStatus] = useState<PaymentReadinessState>(() => getPaymentStatus(fallbackStatus));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiRequest<CurrentPaymentResponse>("/api/payments/current")
      .then((data) => {
        if (!mounted) return;

        if (data.redirectTo === "/user") {
          setStatus("verified");
          return;
        }

        setStatus(getPaymentStatus(data.payment ?? data.paymentStatus ?? fallbackStatus));
      })
      .catch(() => {
        if (!mounted) return;
        setStatus(getPaymentStatus(fallbackStatus));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fallbackStatus]);

  return {
    status,
    loading,
    isActive: status === "verified",
    label: getPaymentStateLabel(status),
  };
}
