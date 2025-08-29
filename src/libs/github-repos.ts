import type { GitHubRepo } from "./types";

const headers = {
  Accept: "application/vnd.github.v3+json",
};

interface Org {
  login: string;
}

async function fetchAll<T>(url: string): Promise<T[]> {
  let page = 1;
  let results: T[] = [];
  let hasMore = true;

  while (hasMore) {
    const data = await fetch(`${url}?per_page=100&page=${page}`, {
      headers,
    }).then((v) => v.json());

    if (!Array.isArray(data)) {
      console.error(`API error: ${JSON.stringify(data)}`);
      break;
    }
    results = results.concat(data);
    hasMore = data.length === 100;
    page++;
  }
  return results;
}

export async function getGitHubReps(name: string) {
  const userRepos = await fetchAll<GitHubRepo>(
    `https://api.github.com/users/${name}/repos`
  );

  const orgs = await fetchAll<Org>(`https://api.github.com/users/${name}/orgs`);
  const orgRepos = await Promise.all(
    orgs.map(async (org) =>
      fetchAll<GitHubRepo>(`https://api.github.com/orgs/${org.login}/repos`)
    )
  ).then((v) => v.flat());
  return [...userRepos, ...orgRepos];
}
