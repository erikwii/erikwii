import { resolve } from 'path';
import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';

import {Pet} from "./pet";
import githubQuery from './githubQuery';
import generateBarChart from './generateBarChart';
import gitGotchiRenderer from './gitGotchiRenderer';
import { 
  userInfoQuery,
  userStatusQuery,
  createContributedRepoQuery, 
  createCommittedDateQuery 
} from './queries';

/**
 * get environment variable
 */
config({ path: resolve(__dirname, '../.env') });

interface IRepo {
  name: string;
  owner: string;
}

(async() => {
  /**
   * First, get user id
   */
  const userResponse = await githubQuery(userInfoQuery)
    .catch(error => console.error(`Unable to get username and id\n${error}`));
  const { login: username, id } = userResponse?.data?.viewer;

  /**
   * Second, get user stat
   */
  const userStatus = userStatusQuery(username)
  const statResponse = await githubQuery(userStatus)
    .catch(error => console.error(`Unable to get user status\n${error}`));
  // console.log(JSON.stringify(statResponse, null, 2));

  /**
   * Third, get contributed repos
   */
  const contributedRepoQuery = createContributedRepoQuery(username);
  const repoResponse = await githubQuery(contributedRepoQuery)
    .catch(error => console.error(`Unable to get the contributed repo\n${error}`));
  const repos: IRepo[] = repoResponse?.data?.user?.repositoriesContributedTo?.nodes
    // .filter(repoInfo => (!repoInfo?.isFork))
    .map(repoInfo => ({
      name: repoInfo?.name,
      owner: repoInfo?.owner?.login,
    }));

  // Get date 7 days ago
  let d = new Date();
  const pastWeek = d.getDate() - 7;
  d.setDate(pastWeek);
  let sinceDate = d.toISOString();

  /**
   * Fourth, get commit time and parse into commit-time/hour diagram
   */
  const committedTimeResponseMap = await Promise.all(
    repos.map(({name, owner}) => githubQuery(createCommittedDateQuery(username, id, name, owner, sinceDate)))
  ).catch(error => console.error(`Unable to get the commit info\n${error}`));

  if (!committedTimeResponseMap) return;

  let morning = 0; // 6 - 12
  let daytime = 0; // 12 - 18
  let evening = 0; // 18 - 24
  let night = 0; // 0 - 6
  
  let additions = 0;
  let deletions = 0;
  let issues = 0;
  let pullRequests = 0;
  let codeReviews = 0;

  /**
   * Calculate PullRequest in last 7 days
   */
  statResponse?.data?.user?.pullRequests.nodes.forEach(node => {
    let issueCreatedAt = node?.createdAt;
    if ( (new Date(issueCreatedAt)).getTime() > (new Date(sinceDate).getTime()) ) {
      pullRequests++;
    }
  });

  /**
   * Calculate Code Review in last 7 days
   */
  statResponse?.data?.user?.contributionsCollection?.pullRequestReviewContributions?.nodes.forEach(node => {
    let reviewCreatedAt = node?.pullRequestReview?.createdAt;
    if ( (new Date(reviewCreatedAt)).getTime() > (new Date(sinceDate).getTime()) ) {
      codeReviews++;
    }
  });

  committedTimeResponseMap.forEach(committedTimeResponse => {
    committedTimeResponse?.data?.repository?.defaultBranchRef?.target?.history?.edges.forEach(edge => {
      const committedDate = edge?.node?.committedDate;
      const timeString = new Date(committedDate).toLocaleTimeString('en-US', { hour12: false, timeZone: process.env.TIMEZONE });
      const hour = +(timeString.split(':')[0]);
      /**
       * voting and counting
       */
      if (hour >= 6 && hour < 12) morning++;
      if (hour >= 12 && hour < 18) daytime++;
      if (hour >= 18 && hour < 24) evening++;
      if (hour >= 0 && hour < 6) night++;

      /**
       * other stat
       */
      additions += edge?.node?.additions;
      deletions += edge?.node?.deletions;
    });
    issues += committedTimeResponse?.data?.repository?.issues?.totalCount;
  });
  // console.log(JSON.stringify(committedTimeResponseMap,null,2));
  /**
   * Next, generate diagram
   */
  const sumCommit = morning + daytime + evening + night;
  if (!sumCommit) return;

  const additionsPercentage = additions / (deletions+additions) * 100;
  const roundedAdditionsPercentage = Math.round((additionsPercentage + Number.EPSILON) * 100) / 100;
  const deletionsPercentage = deletions / (deletions+additions) * 100;
  const roundedDeletionsPercentage = Math.round((deletionsPercentage + Number.EPSILON) * 100) / 100;
  console.log(`Commit: ${sumCommit} avg(${Math.round(((sumCommit/7) + Number.EPSILON) * 100) / 100}/day)`);
  console.log(`Total Additions: ${additions} (${roundedAdditionsPercentage}%)`);
  console.log(`Total Deletions: ${deletions} (${roundedDeletionsPercentage}%)`);
  console.log(`Total Issue: ${issues}`);
  console.log(`Total Pull Request: ${pullRequests}`);
  console.log(`Total Code Review: ${codeReviews}`);

  const petBirthDay = statResponse?.data?.user?.createdAt;
  const totalContribution = statResponse?.data?.user?.contributionsCollection?.restrictedContributionsCount;
  
  const myPet = new Pet();
  myPet.cunstructor(process.env.NAME, petBirthDay, totalContribution);
  myPet.setStatistic(sumCommit,issues,codeReviews,pullRequests);
  console.log(JSON.stringify(myPet,null,2));
  console.log(`Birthday: ${myPet.calculateAge()}`);

  gitGotchiRenderer(myPet);

  const oneDay = [
    { label: '🌞 Morning', commits: morning },
    { label: '🌆 Daytime', commits: daytime },
    { label: '🌃 Evening', commits: evening },
    { label: '🌙 Night', commits: night },
  ];

  const lines = oneDay.reduce((prev, cur) => {
    const percent = cur.commits / sumCommit * 100;
    const line = [
      `${cur.label}`.padEnd(10),
      `${cur.commits.toString().padStart(5)} commits`.padEnd(14),
      generateBarChart(percent, 21),
      String(percent.toFixed(1)).padStart(5) + '%',
    ];

    return [...prev, line.join(' ')];
  }, []);

  /**
   * Finally, write into gist
   */
  const octokit = new Octokit({ auth: `token ${process.env.GH_TOKEN}` });
  const gist = await octokit.gists.get({
    gist_id: process.env.GIST_ID
  }).catch(error => console.error(`Unable to update gist\n${error}`));
  if (!gist) return;

  const filename = Object.keys(gist.data.files)[0];
  await octokit.gists.update({
    gist_id: process.env.GIST_ID,
    files: {
      [filename]: {
        // eslint-disable-next-line quotes
        filename: (morning + daytime) > (evening + night) ? "I'm an early 🐤" : "I'm a night 🦉",
        content: lines.join('\n'),
        // content: JSON.stringify(committedTimeResponseMap),
      },
    },
  });
})();
