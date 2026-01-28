export type PlanType = "FREE" | "PRO" | "BUSINESS";

export interface PlanLimits {
  testimonials: number;
  forms: number;
  widgets: number;
  showBranding: boolean;
  whatsapp: boolean;
  analytics: boolean;
  apiAccess: boolean;
  importGoogleReviews: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    testimonials: 50,
    forms: 5,
    widgets: 5,
    showBranding: true,
    whatsapp: false,
    analytics: false,
    apiAccess: false,
    importGoogleReviews: false,
  },
  PRO: {
    testimonials: 100,
    forms: Infinity,
    widgets: Infinity,
    showBranding: false,
    whatsapp: false,
    analytics: true,
    apiAccess: false,
    importGoogleReviews: true,
  },
  BUSINESS: {
    testimonials: Infinity,
    forms: Infinity,
    widgets: Infinity,
    showBranding: false,
    whatsapp: true,
    analytics: true,
    apiAccess: true,
    importGoogleReviews: true,
  },
};

export const PLAN_PRICES = {
  PRO: {
    monthly: 10,
    yearly: 100, // 2 meses gratis
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  BUSINESS: {
    monthly: 20,
    yearly: 200, // 2 meses gratis
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

export function canCreateTestimonial(plan: PlanType, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentCount < limits.testimonials;
}

export function canCreateForm(plan: PlanType, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentCount < limits.forms;
}

export function canCreateWidget(plan: PlanType, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentCount < limits.widgets;
}

export function shouldShowBranding(plan: PlanType): boolean {
  const limits = getPlanLimits(plan);
  return limits.showBranding;
}
