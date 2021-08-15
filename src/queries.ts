export const userInfoQuery = `
  query {
    viewer {
      login
      id
    }
  }
`;

export const userStatusQuery = (username: string) => `
query {
  user(login: "${username}") {
    name
    login
    createdAt
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      pullRequestReviewContributions (last: 100) {
        totalCount
        nodes {
          pullRequestReview {
            author {
              login
            }
            createdAt
          }
        }
      }
    }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
      totalCount
    }
    pullRequests(last: 100) {
      totalCount
      nodes {
        createdAt
        repository {
          name
          owner {
            login
          }
        }
      }
    }
    issues(first: 1) {
      totalCount
    }
    followers {
      totalCount
    }
    repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}) {
      totalCount
    }
  }
}
`;

export const createContributedRepoQuery = (username: string) => `
  query {
    user(login: "${username}") {
      createdAt
      repositoriesContributedTo(last: 100, includeUserRepositories: true) {
        totalCount
        nodes {
          forkCount
          stargazerCount
          isFork
          name
          owner {
            login
          }
          primaryLanguage {
            name
            color
          }
        }
      }
      pullRequests(last: 100){
        totalCount
      }
    }
  }
`;

export const createCommittedDateQuery = (username:string, id: string, name: string, owner: string, since: string) => `
  query {
    repository(owner: "${owner}", name: "${name}") {
      name
      defaultBranchRef {
        target {
          ... on Commit {
            history(since: "${since}", author: { id: "${id}" }) {
              totalCount
              edges {
                node {
                  comments (last: 100){
                    totalCount
                    nodes {
                      author {
                        login
                      }
                      createdAt
                    }
                  }
                  committedDate
                  changedFiles
                  additions
                  deletions
                }
              }
            }
          }
        }
      }
      issues(filterBy: {createdBy: "${username}", since: "${since}"}){
        totalCount
      }
    }
  }
`;
