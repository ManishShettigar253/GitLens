export interface GitHubProfile {
  login: string;
  avatar_url: string;
  name: string;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  closed_at: string | null;
  html_url: string;
  repo_name: string;
  repo_owner: string;
}

const BASE_URL = 'https://api.github.com';

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  return headers;
}

export async function fetchUserProfile(username: string, token?: string): Promise<GitHubProfile> {
  const response = await fetch(`${BASE_URL}/users/${username}`, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User "${username}" not found.`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add a Personal Access Token in Settings.');
    }
    throw new Error('Failed to fetch user profile.');
  }

  return response.json();
}

export async function fetchUserPullRequests(
  username: string,
  token?: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<PullRequest[]> {
  const headers = getHeaders(token);
  
  // Helper to extract owner and repo from repository_url
  const parseRepoUrl = (url: string) => {
    // Expected url: https://api.github.com/repos/owner/repo
    const parts = url.split('/repos/');
    if (parts.length > 1) {
      const subParts = parts[1].split('/');
      return { owner: subParts[0], name: subParts[1] };
    }
    return { owner: 'unknown', name: 'unknown' };
  };

  // Fetch all PRs created by the user (up to 500 for performance/limits)
  let allPRs: any[] = [];
  let page = 1;
  let hasMore = true;
  const maxPages = 5; // Fetch up to 500 PRs

  while (hasMore && page <= maxPages) {
    const q = encodeURIComponent(`author:${username} type:pr`);
    const url = `${BASE_URL}/search/issues?q=${q}&per_page=100&page=${page}`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please add a Personal Access Token in Settings.');
      }
      throw new Error('Failed to fetch pull requests.');
    }

    const data = await response.json();
    const items = data.items || [];
    allPRs = [...allPRs, ...items];
    
    if (items.length < 100 || allPRs.length >= data.total_count) {
      hasMore = false;
    } else {
      page++;
    }

    if (onProgress) {
      onProgress(allPRs.length, data.total_count || allPRs.length);
    }
  }

  // Fetch merged PRs created by the user to cross-reference merged status
  let mergedPRIds = new Set<number>();
  page = 1;
  hasMore = true;

  while (hasMore && page <= maxPages) {
    const q = encodeURIComponent(`author:${username} type:pr is:merged`);
    const url = `${BASE_URL}/search/issues?q=${q}&per_page=100&page=${page}`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      // If we hit rate limits here, we can proceed with what we have
      break;
    }

    const data = await response.json();
    const items = data.items || [];
    items.forEach((item: any) => mergedPRIds.add(item.id));

    if (items.length < 100 || mergedPRIds.size >= data.total_count) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // Transform and map status
  return allPRs.map((item: any) => {
    const { owner, name } = parseRepoUrl(item.repository_url);
    
    let state: 'open' | 'closed' | 'merged' = 'open';
    if (item.state === 'closed') {
      state = mergedPRIds.has(item.id) ? 'merged' : 'closed';
    } else if (item.state === 'open') {
      state = 'open';
    }

    return {
      id: item.id,
      number: item.number,
      title: item.title,
      state,
      created_at: item.created_at,
      closed_at: item.closed_at,
      html_url: item.html_url,
      repo_name: name,
      repo_owner: owner,
    };
  });
}
