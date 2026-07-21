import { gql } from "@apollo/client";

export const PLATFORM_LOGIN = gql`
  mutation PlatformLogin($email: String!, $password: String!) {
    platformLogin(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const PLATFORM_ME = gql`
  query PlatformMe {
    platformMe {
      id
      email
      name
      role
    }
  }
`;

export const PLATFORM_METRICS = gql`
  query PlatformMetrics {
    platformMetrics {
      totalTenants
      activeTenants
      pausedTenants
      trialingTenants
      newTenants30d
      estimatedMrr30d
      failedPayments7d
      tenantsByPlan {
        plan
        count
      }
    }
  }
`;

export const PLATFORM_TENANTS = gql`
  query PlatformTenants(
    $search: String
    $plan: SubscriptionPlan
    $status: TenantStatus
    $limit: Int
    $offset: Int
  ) {
    platformTenants(
      search: $search
      plan: $plan
      status: $status
      limit: $limit
      offset: $offset
    ) {
      total
      limit
      offset
      items {
        id
        name
        plan
        status
        userCount
        layoutCount
        subscriptionStatus
        createdAt
        lastPaymentAt
      }
    }
  }
`;

export const PLATFORM_TENANT = gql`
  query PlatformTenant($id: ID!) {
    platformTenant(id: $id) {
      id
      name
      plan
      status
      currency
      userCount
      layoutCount
      createdAt
      subscriptionStatus
      subscription {
        id
        plan
        status
        trialEndsAt
        currentPeriodEnd
        paypalSubscriptionId
      }
      users {
        id
        name
        email
        role
        createdAt
      }
      recentPayments {
        id
        amount
        currency
        status
        paidAt
        createdAt
      }
    }
  }
`;

export const PLATFORM_PAYMENTS = gql`
  query PlatformPayments($limit: Int, $offset: Int, $status: PaymentStatus) {
    platformPayments(limit: $limit, offset: $offset, status: $status) {
      total
      items {
        id
        churchId
        churchName
        amount
        currency
        status
        paypalTransactionId
        paidAt
        createdAt
      }
    }
  }
`;

export const PLATFORM_SUBSCRIPTIONS = gql`
  query PlatformSubscriptions($limit: Int) {
    platformSubscriptions(limit: $limit) {
      total
      items {
        id
        churchId
        churchName
        plan
        status
        trialEndsAt
        currentPeriodEnd
      }
    }
  }
`;

export const PLATFORM_PLANS = gql`
  query PlatformPlanCatalog {
    platformPlanCatalog {
      id
      planCode
      name
      priceMonthly
      priceAnnual
      maxLayouts
      maxSeatsPerLayout
      maxUsers
      isActive
    }
  }
`;

export const PLATFORM_AUDIT = gql`
  query PlatformAuditLogs($limit: Int) {
    platformAuditLogs(limit: $limit) {
      total
      items {
        id
        actorEmail
        action
        churchId
        reason
        createdAt
      }
    }
  }
`;

export const UPDATE_TENANT_PLAN = gql`
  mutation UpdateTenantPlan(
    $churchId: ID!
    $plan: SubscriptionPlan!
    $reason: String!
  ) {
    updateTenantPlan(churchId: $churchId, plan: $plan, reason: $reason) {
      id
      plan
      status
    }
  }
`;

export const PAUSE_TENANT = gql`
  mutation PauseTenant($churchId: ID!, $reason: String!) {
    pauseTenant(churchId: $churchId, reason: $reason) {
      id
      status
    }
  }
`;

export const RESUME_TENANT = gql`
  mutation ResumeTenant($churchId: ID!, $reason: String!) {
    resumeTenant(churchId: $churchId, reason: $reason) {
      id
      status
    }
  }
`;

export const PLATFORM_HEALTH = gql`
  query PlatformHealth {
    platformHealth {
      status
      version
      environment
      uptimeSeconds
      timestamp
      checks {
        name
        status
        latencyMs
        message
      }
    }
  }
`;

export const PLATFORM_INFRA_USAGE = gql`
  query PlatformInfraUsage($from: String, $to: String) {
    platformInfraUsage(from: $from, to: $to) {
      from
      to
      grandTotalUsd
      disclaimer
      processMemoryMb
      railway {
        configured
        message
        memoryGb
        cpu
        storageGb
        networkGb
        estimatedCostUsd
        source
        services {
          name
          costUsd
        }
      }
      vercel {
        configured
        message
        estimatedCostUsd
        source
        services {
          name
          costUsd
        }
      }
      tenants {
        churchId
        name
        plan
        status
        userCount
        layoutCount
        railwayWeight
        vercelWeight
        railwayUsd
        vercelUsd
        totalUsd
        railwaySharePct
        vercelSharePct
        sharePct
      }
    }
  }
`;

export const PLATFORM_SUPPORT_TICKETS = gql`
  query PlatformSupportTickets(
    $status: TicketStatus
    $priority: TicketPriority
    $limit: Int
  ) {
    platformSupportTickets(status: $status, priority: $priority, limit: $limit) {
      total
      items {
        id
        churchId
        churchName
        subject
        priority
        status
        source
        updatedAt
        reporterSnapshot {
          name
          email
          churchName
        }
      }
    }
  }
`;

export const PLATFORM_SUPPORT_TICKET = gql`
  query PlatformSupportTicket($id: ID!) {
    platformSupportTicket(id: $id) {
      id
      churchId
      churchName
      subject
      description
      priority
      status
      source
      createdByUserId
      createdAt
      updatedAt
      reporterSnapshot {
        name
        email
        role
        churchId
        churchName
        plan
        churchStatus
        planInterest
        userAgent
        pageUrl
        submittedAt
      }
      attachments {
        name
        mimeType
        dataUrl
      }
      notes {
        id
        body
        isInternal
        authorEmail
        authorName
        authorRole
        createdAt
      }
    }
  }
`;

export const CREATE_SUPPORT_TICKET = gql`
  mutation CreateSupportTicket(
    $churchId: ID!
    $subject: String!
    $description: String!
    $priority: TicketPriority
  ) {
    createSupportTicket(
      churchId: $churchId
      subject: $subject
      description: $description
      priority: $priority
    ) {
      id
    }
  }
`;

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus(
    $ticketId: ID!
    $status: TicketStatus!
    $reason: String
  ) {
    updateSupportTicketStatus(
      ticketId: $ticketId
      status: $status
      reason: $reason
    ) {
      id
      status
    }
  }
`;

export const ADD_TICKET_NOTE = gql`
  mutation AddTicketNote($ticketId: ID!, $body: String!, $isInternal: Boolean) {
    addSupportTicketNote(
      ticketId: $ticketId
      body: $body
      isInternal: $isInternal
    ) {
      id
      notes {
        id
        body
        isInternal
        authorEmail
        authorName
        authorRole
        createdAt
      }
    }
  }
`;

export const SUPPORT_NOTE_ADDED_SUBSCRIPTION = gql`
  subscription SupportNoteAdded($ticketId: ID!) {
    supportNoteAdded(ticketId: $ticketId) {
      id
      body
      isInternal
      authorEmail
      authorName
      authorRole
      createdAt
    }
  }
`;

export const SUPPORT_TICKET_UPDATED_SUBSCRIPTION = gql`
  subscription SupportTicketUpdated($ticketId: ID!) {
    supportTicketUpdated(ticketId: $ticketId) {
      id
      status
      updatedAt
    }
  }
`;

export const PLATFORM_FEATURE_FLAGS = gql`
  query PlatformFeatureFlags($churchId: ID!) {
    platformFeatureFlags(churchId: $churchId) {
      id
      key
      value
      description
      expiresAt
    }
  }
`;

export const SET_FEATURE_FLAG = gql`
  mutation SetFeatureFlag(
    $churchId: ID!
    $key: String!
    $value: String!
    $description: String
    $reason: String!
  ) {
    setTenantFeatureFlag(
      churchId: $churchId
      key: $key
      value: $value
      description: $description
      reason: $reason
    ) {
      id
      key
      value
    }
  }
`;

export const DELETE_FEATURE_FLAG = gql`
  mutation DeleteFeatureFlag($flagId: ID!, $reason: String!) {
    deleteTenantFeatureFlag(flagId: $flagId, reason: $reason)
  }
`;

export const START_IMPERSONATION = gql`
  mutation StartImpersonation(
    $churchId: ID!
    $userId: ID!
    $reason: String!
  ) {
    startImpersonation(churchId: $churchId, userId: $userId, reason: $reason) {
      token
      expiresAt
      loginUrl
      user {
        id
        name
        email
      }
    }
  }
`;

export const EXTEND_TRIAL = gql`
  mutation ExtendTrial($churchId: ID!, $days: Int!, $reason: String!) {
    extendTenantTrial(churchId: $churchId, days: $days, reason: $reason) {
      id
      subscription {
        trialEndsAt
      }
    }
  }
`;
