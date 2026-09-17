<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.vuetifyjs.com/docs/images/one/logos/vuetify-logo-dark.png">
    <img alt="Vuetify" src="https://cdn.vuetifyjs.com/docs/images/one/logos/vuetify-logo-light.png" height="100">
  </picture>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/conventional-changelog-vuetify"><img src="https://img.shields.io/npm/v/conventional-changelog-vuetify.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/conventional-changelog-vuetify"><img src="https://img.shields.io/npm/dm/conventional-changelog-vuetify.svg" alt="Downloads"></a>
  <br>
  <a href="https://github.com/vuetifyjs/conventional-changelog-vuetify/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/conventional-changelog-vuetify.svg" alt="License"></a>
  <a href="https://discord.gg/vuetify"><img src="https://img.shields.io/discord/1513968811047522396?logo=discord&logoColor=white&label=Discord&color=5865F2" alt="Discord"></a>
</p>

# [![NPM version][npm-image]][npm-url]

> [conventional-changelog](https://github.com/ajoslin/conventional-changelog) [vuetify](https://github.com/vuetifyjs/vuetify) preset

**Issues with the convention itself should be reported on the Vuetify issue tracker.**

## Vuetify Convention

Vuetify's [commit message guidelines](https://vuetifyjs.com/en/getting-started/contributing/#commit-guidelines).

### Examples

Appears under "Features" header, pencil subheader:

```
feat(pencil): add 'graphiteWidth' option
```

Appears under "Bug Fixes" header, graphite subheader, with a link to issue #28:

```
fix(graphite): stop graphite breaking when width < 0.1

Closes #28
```

Appears under "Performance Improvements" header, and under "Breaking Changes" with the breaking change explanation:

```
perf(pencil): remove graphiteWidth option

BREAKING CHANGE: The graphiteWidth option has been removed. The default graphite width of 10mm is always used for performance reason.
```

The following commit and commit `667ecc1` do not appear in the changelog if they are under the same release. If not, the revert commit appears under the "Reverts" header.

```
revert: feat(pencil): add 'graphiteWidth' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

### Commit Message Format

A commit message consists of a **header**, **body** and **footer**.  The header has a **type**, **scope** and **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

### Revert

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

If the prefix is `feat`, `fix` or `perf`, it will appear in the changelog. However if there is any [BREAKING CHANGE](#footer), the commit will always appear in the changelog.

Other prefixes are up to your discretion. Suggested prefixes are `build`, `ci`, `docs` ,`style`, `refactor`, and `test` for non-changelog related tasks.

Details regarding these types can be found in the official [Vuetify Contributing Guidelines](https://vuetifyjs.com/en/getting-started/contributing/#commit-guidelines).

### Scope

The scope could be anything specifying place of the commit change. For example `$location`,
`$browser`, `$compile`, `$rootScope`, `ngHref`, `ngClick`, `ngView`, etc...

### Subject

The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

[npm-image]: https://badge.fury.io/js/conventional-changelog-vuetify.svg
[npm-url]: https://npmjs.org/package/conventional-changelog-vuetify
