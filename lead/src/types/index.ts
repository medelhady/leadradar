export interface Lead {
  id?: string;
  company_name: string;
  website: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  rating: number | null;
  reviews: number | null;
  created_at?: string;
}

export interface SearchParams {
  keyword: string;
  city: string;
  state: string;
  maxResults: number;
}

export interface ApifyPlace {
  title: string;
  website?: string;
  phone?: string;
  address?: string;
  totalScore?: number;
  reviewsCount?: number;
  city?: string;
  state?: string;
}

export interface SearchResult {
  leads: Lead[];
  stats: {
    companiesFound: number;
    emailsFound: number;
    skippedDuplicates: number;
  };
  errors: string[];
}

export interface DashboardStats {
  totalLeads: number;
  totalEmails: number;
  totalCompanies: number;
}
