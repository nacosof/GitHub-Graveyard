import { Octokit } from "octokit";

import { env } from "@/env";

export function githubClient() {
  return new Octokit({
    auth: env.GITHUB_TOKEN,
  });
}
