import { describe, it, expect } from 'vitest'
const conventionalChangelogCore = require('conventional-changelog-core')
const preset = require('../')
const gitDummyCommit = require('git-dummy-commit')
const shell = require('shelljs')
const betterThanBefore = require('better-than-before')()
const preparing = betterThanBefore.preparing

function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

betterThanBefore.setups([
  () => {
    shell.config.resetForTesting()
    shell.cd(__dirname)
    shell.rm('-rf', 'tmp')
    shell.mkdir('tmp')
    shell.cd('tmp')
    shell.mkdir('git-templates')
    shell.exec('git init --template=./git-templates')

    gitDummyCommit(['build: first build setup', 'BREAKING CHANGE: New build system.'])
    gitDummyCommit(['ci(travis): add TravisCI pipeline', 'BREAKING CHANGE: Continuously integrated.'])
    gitDummyCommit(['feat: amazing new module', 'BREAKING CHANGE: Not backward compatible.'])
    gitDummyCommit(['fix(compile): avoid a bug', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['perf(ngOptions): make it faster', ' closes #1, #2'])
    gitDummyCommit('revert(ngOptions): bad commit')
    gitDummyCommit('fix: oops')
  },
  () => {
    gitDummyCommit(['feat(awesome): addresses the issue brought up in #133'])
  },
  () => {
    gitDummyCommit(['feat(awesome): fix #88'])
  },
  () => {
    gitDummyCommit(['feat(awesome): issue brought up by @bcoe! on Friday'])
  },
  () => {
    gitDummyCommit(['build(npm): edit build script', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['ci(travis): setup travis', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['docs(readme): make it clear', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['style(whitespace): make it easier to read', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['refactor(code): change a lot of code', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['test(*): more tests', 'BREAKING CHANGE: The Change is huge.'])
  },
  () => {
    shell.exec('git tag v1.0.0')
    gitDummyCommit('feat: some more features')
  },
  () => {
    gitDummyCommit(['feat(*): implementing #5 by @dlmr', ' closes #10'])
  },
  () => {
    gitDummyCommit(['Revert \\"feat: default revert format\\"', 'This reverts commit 1234.'])
    gitDummyCommit(['revert: feat: custom revert format', 'This reverts commit 5678.'])
  },
])

expect.addSnapshotSerializer({
  serialize (val) {
    let i = 0
    const commits = val.matchAll(/\/commit\/([a-z0-9]{40})/g)
    return Array.from(commits).reduce((acc, v) => {
      ++i
      return acc.replaceAll(
        `[${v[1].substring(0, 7)}](https://github.com/vuetifyjs/conventional-changelog-vuetify/commit/${v[1]})`,
        `[${String(i).padStart(7, '0')}](https://github.com/vuetifyjs/conventional-changelog-vuetify/commit/${String(i).padStart(40, '0')})`,
      )
    }, val)
  },

  test (val) {
    return typeof val === 'string'
  },
})

describe('vuetify preset', function () {
  it('should work if there is no semver tag', async () => {
    preparing(1)

    const changelog = await streamToString(
      conventionalChangelogCore({ config: preset })
    )

    expect(changelog).toMatchSnapshot()
  })

  it('should replace #[0-9]+ with GitHub issue URL', async () => {
    preparing(2)

    const changelog = await streamToString(
      conventionalChangelogCore({ config: preset })
    )

    expect(changelog).toMatchSnapshot()
  })

  it('should remove the issues that already appear in the subject', async () => {
    preparing(3)

    const changelog = await streamToString(
      conventionalChangelogCore({ config: preset })
    )

    expect(changelog).toMatchSnapshot()
  })

  it('should replace @username with GitHub user URL', async () => {
    preparing(4)

    const changelog = await streamToString(
      conventionalChangelogCore({ config: preset })
    )

    expect(changelog).toMatchSnapshot()
  })

  it('should not discard commit if there is BREAKING CHANGE', async () => {
    preparing(5)

    const changelog = await streamToString(
      conventionalChangelogCore({ config: preset })
    )

    expect(changelog).toMatchSnapshot()
  })

  it('should work if there is a semver tag', async () => {
    preparing(6)

    const changelog = await streamToString(
      conventionalChangelogCore({
        config: preset,
        outputUnreleased: true,
      })
    )

    expect(changelog).to.include('some more features')
    expect(changelog).to.not.include('BREAKING')
  })

  it('should only replace with link to user if it is an username', async () => {
    preparing(7)

    const changelog = await streamToString(
      conventionalChangelogCore({ config: preset })
    )

    expect(changelog).toMatchSnapshot()
  })

  it('parses both default (Revert "<subject>") and custom (revert: <subject>) revert commits', async () => {
    preparing(8)

    const changelog = await streamToString(
      conventionalChangelogCore({ config: preset })
    )

    expect(changelog).toMatchSnapshot()
  })
})
