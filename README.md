<p align="center">
  <a href="http://github.com/erikwii/GitGotchi">
    <img src="https://avatars.githubusercontent.com/u/21095856?v=4" alt="screenshot" width="200">
  </a>
  <h3 align="center">📌GitGotchi✨</h3>
</p>

<p align="center">
   <img src="https://img.shields.io/badge/language-typescript-blue?style=flat-square"/>
   <img src="https://img.shields.io/github/license/erikwii/GitGotchi?style=flat-square"/>
<!--    <img src="https://img.shields.io/github/stars/erikwii/GitGotchi"/>
   <img src="https://img.shields.io/github/forks/erikwii/GitGotchi"/> -->
</p>
<p align="center">
   🥚A virtual pet that growth by your Github contributions.🦖
   <br/>
   Pin your gist pet at your Github profile!
   <br/>
   (Under Development)
</p>

---

> This project is inspired by an awesome pinned-gist project.<br/>Find more in https://github.com/matchai/awesome-pinned-gists

## Overview
This project uses GitHub graphQL API to get the commit histories and write into the gist by [rest.js](https://github.com/octokit/rest.js#readme)

## Setup

### Prep work
1. Create a new public GitHub Gist (https://gist.github.com/)
1. Create a token with the `gist` and `repo` scope and copy it. (https://github.com/settings/tokens/new)
   > enable `repo` scope seems **DANGEROUS**<br/>
   > but this GitHub Action only accesses your commit timestamp in repository you contributed.

### Project setup

1. Fork this repo
1. Open the "Actions" tab of your fork and click the "enable" button
1. Edit the [environment variable](https://github.com/erikwii/GitGotchi/blob/master/.github/workflows/schedule.yml#L17-L18) in `.github/workflows/schedule.yml`:

   - **GIST_ID:** The ID portion from your gist url: `https://gist.github.com/erikwii/`**`9842e074b8ee46aef76fd0d493bae0ed`**.
   - **TIMEZONE:** The timezone of your location, eg. `Asia/Jakarta` for Taiwan, `America/New_York` for America in New York, etc.

1. Go to the repo **Settings > Secrets**
1. Add the following environment variables:
   - **GH_TOKEN:** The GitHub token generated above.
1. [Pin the newly created Gist](https://help.github.com/en/github/setting-up-and-managing-your-github-profile/pinning-items-to-your-profile)
    