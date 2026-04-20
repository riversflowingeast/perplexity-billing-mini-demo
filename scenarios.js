const scenarios = [
  {
    id: "pro_computer_drain_first_time",
    name: "Perplexity Pro Individual - Computer Usage Drain (First-Time Confusion)",

    // Core classification
    type: "computer_usage",

    // Account context
    account: {
      plan: "pro_individual",
      isEnterprise: false,
      tenure: "new", // new | existing
    },

    // Feature context
    feature: {
      name: "computer",
      highCost: true
    },

    // Behavioral signals (for escalation logic)
    signals: {
      firstTimeUse: true,
      priorWarnings: false,
      repeatedIssue: false
    },

    // Policy hints (NOT strict rules)
    policy: {
      eligibleForCourtesyReview: true,
      refundLikely: "low", // low | medium | high
    }
  },
  {
    id: "pro_computer_drain_repeat",
    name: "Perplexity Pro Individual - Computer Usage Drain (Repeat / Informed Use)",

    type: "computer_usage",

    account: {
      plan: "pro_individual",
      isEnterprise: false,
      tenure: "existing",
    },

    feature: {
      name: "computer",
      highCost: true
    },

    signals: {
      firstTimeUse: false,
      priorWarnings: true,
      repeatedIssue: true
    },

    policy: {
      eligibleForCourtesyReview: false,
      refundLikely: "none",
    }
  },
  {
  id: "enterprise_prospect",
  name: "Enterprise Prospect – New Inquiry",

  type: "enterprise_prospect",

  account: {
    plan: "none",
    isEnterprise: false,
    tenure: "prospect"
  },

  // What we need to collect during conversation
  requiredInfo: {
    companySize: false,
    estimatedSeats: false,
    region: false,
    website: false
  },

  // Signals evolve during convo (you’ll update these later if you want)
  signals: {
    highSeatCount: false, // >= 250
    japanRegion: false
  },

  policy: {
    requiresQualification: true,
    routeToPartnerIfJapan: true,
    escalateIfHighSeatCount: true,
    highSeatThreshold: 250
  }
},

{
  id: "enterprise_admin_billing_capabilities",
  name: "Enterprise Admin – Billing Settings",

  type: "enterprise_admin",

  account: {
    plan: "enterprise",
    isEnterprise: true,
    role: "admin"
  },

  signals: {
    adminQuery: true
  },

  policy: {
    canLogFeatureRequest: true,
    requiresHuman: false
  }
}

];

module.exports = { scenarios };