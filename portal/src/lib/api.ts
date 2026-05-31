const API_BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3105";

const TOKEN_KEY = "complibot_token";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

async function ensureAuth(): Promise<void> {
  if (getToken()) return;
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@complibot.dev", password: "test123" }),
  });
  if (response.ok) {
    const body = (await response.json()) as { token: string };
    setToken(body.token);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  await ensureAuth();

  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      const errorBody = isJson ? await response.json() : { error: response.statusText };
      return {
        data: null,
        error: (errorBody as { error?: string }).error ?? "Request failed",
        status: response.status,
      };
    }

    const data = isJson ? ((await response.json()) as T) : (null as T);
    return { data, error: null, status: response.status };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
      status: 0,
    };
  }
}

export const api = {
  // Auth
  register: (body: { email: string; password: string; name: string; orgName: string }) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string }; organization: { id: string; name: string } }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string } }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  // Organization
  getOrg: () => request<{ organization: OrgData; facilities: FacilityData[] }>("/api/org"),
  updateOrg: (body: Partial<OrgData>) => request<{ organization: OrgData }>("/api/org", { method: "PUT", body: JSON.stringify(body) }),
  addFacility: (body: Partial<FacilityData>) => request<{ facility: FacilityData }>("/api/org/facilities", { method: "POST", body: JSON.stringify(body) }),

  // Projects
  createProject: (body: CreateProjectInput) => request<{ project: ProjectData }>("/api/projects", { method: "POST", body: JSON.stringify(body) }),
  getProjects: () => request<{ projects: ProjectData[] }>("/api/projects"),
  getProject: (id: string) => request<{ project: ProjectData; documents: DocumentData[]; reports: ReportData[]; complianceGaps: GapData[] }>(`/api/projects/${id}`),
  updateProject: (id: string, body: Partial<ProjectData>) => request<{ project: ProjectData }>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  // Documents
  uploadDocument: (formData: FormData) =>
    request<{ document: DocumentData }>("/api/documents/upload", {
      method: "POST",
      body: formData,
      headers: {},
    }),
  getDocuments: (projectId?: string) => request<{ documents: DocumentData[] }>(`/api/documents${projectId ? `?projectId=${projectId}` : ""}`),
  getDocument: (id: string) => request<{ document: DocumentData; extractedData: ExtractedDataRecord[] }>(`/api/documents/${id}`),

  // Reports
  generateReport: (body: GenerateReportInput) => request<{ reportId: string; status: string }>("/api/reports/generate", { method: "POST", body: JSON.stringify(body) }),
  getReports: (projectId?: string) => request<{ reports: ReportData[] }>(`/api/reports${projectId ? `?projectId=${projectId}` : ""}`),
  getReport: (id: string) => request<{ report: ReportData; sections: ReportSectionData[]; gaps: GapData[] }>(`/api/reports/${id}`),
  approveReport: (id: string) => request<{ status: string }>(`/api/reports/${id}/approve`, { method: "POST" }),
  reviseReport: (id: string, body: { comments: string; sections?: string[] }) => request<{ status: string }>(`/api/reports/${id}/revise`, { method: "POST", body: JSON.stringify(body) }),

  // Compliance
  complianceCheck: (body: { operationalData: string; facilityType: string; industry: string }) =>
    request<{ assessment: ComplianceAssessment }>("/api/compliance/check", { method: "POST", body: JSON.stringify(body) }),
  getRequirements: (standard: string) => request<{ standard: string; requirements: StandardSummary[] }>(`/api/compliance/requirements/${standard}`),

  // Analytics
  getOverview: () => request<{ overview: AnalyticsOverview }>("/api/analytics/overview"),
  getTimeline: (months?: number) => request<{ timeline: AnalyticsTimeline }>(`/api/analytics/timeline${months ? `?months=${months}` : ""}`),
};

// Types
export interface OrgData {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  locations: number;
}

export interface FacilityData {
  id: string;
  orgId: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  facilityType: string | null;
  employeeCount: number | null;
  naicsCode: string | null;
}

export interface CreateProjectInput {
  name: string;
  type: "OSHA_300" | "EPA_TIER2" | "MAINTENANCE_AUDIT" | "SAFETY_INSPECTION";
  facilityId?: string;
  description?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  dueDate?: string;
}

export interface ProjectData {
  id: string;
  orgId: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentData {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: string;
}

export interface ExtractedDataRecord {
  id: string;
  dataType: string;
  structured: unknown;
  confidence: string;
}

export interface GenerateReportInput {
  projectId: string;
  reportType: string;
  facilityId?: string;
  dateRangeStart: string;
  dateRangeEnd: string;
}

export interface ReportData {
  id: string;
  projectId: string;
  reportType: string;
  title: string;
  status: string;
  summary: string | null;
  complianceScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSectionData {
  id: string;
  sectionOrder: number;
  title: string;
  content: string;
  citations: string[] | null;
  findings: string[] | null;
  recommendations: string[] | null;
}

export interface GapData {
  id: string;
  standard: string;
  requirement: string;
  currentState: string;
  severity: string;
  recommendedAction: string;
  resolved: boolean;
  deadline: string | null;
}

export interface ComplianceAssessment {
  overallScore: number;
  standards: Array<{
    standard: string;
    title: string;
    applicable: boolean;
    complianceScore: number;
    gaps: Array<{
      requirement: string;
      currentState: string;
      severity: string;
      recommendedAction: string;
    }>;
  }>;
}

export interface StandardSummary {
  code: string;
  title: string;
  agency: string;
  sectionCount: number;
  sections: Array<{ section: string; title: string }>;
}

export interface AnalyticsOverview {
  totalReports: number;
  avgComplianceScore: number;
  openGaps: number;
  criticalGaps: number;
  activeProjects: number;
  estimatedSavings: number;
  hoursSaved: number;
  costPerReport: number;
  manualCostPerReport: number;
  reportsThisMonth: number;
}

export interface AnalyticsTimeline {
  reports: Array<{ month: string; count: number; avgScore: number }>;
  gapsOpened: Array<{ month: string; count: number }>;
  gapsResolved: Array<{ month: string; count: number }>;
}
