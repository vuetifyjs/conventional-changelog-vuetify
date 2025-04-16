import fs from 'node:fs'
import { readFile } from 'node:fs/promises'
import compareFunc from 'compare-func'
import path from 'upath'

export async function createWriterOpts () {
  const [template, header, commit, footer] = await Promise.all([
    readFile(path.resolve(import.meta.dirname, './templates/template.hbs'), 'utf8'),
    readFile(path.resolve(import.meta.dirname, './templates/header.hbs'), 'utf8'),
    readFile(path.resolve(import.meta.dirname, './templates/commit.hbs'), 'utf8'),
    readFile(path.resolve(import.meta.dirname, './templates/footer.hbs'), 'utf8'),
  ])

  const writerOpts = getWriterOpts()

  writerOpts.mainTemplate = template
  writerOpts.headerPartial = header
  writerOpts.commitPartial = commit
  writerOpts.footerPartial = footer

  return writerOpts
}

// const groupOrder = ['feat', 'fix', 'revert', 'refactor', 'perf', 'chore', 'test', 'docs', 'style', 'ci', 'build', 'Other Commits']
const groupOrder = [':rocket: Features', ':wrench: Bug Fixes', ':fire: Performance Improvements', ':microscope: Code Refactoring', ':arrows_counterclockwise: Reverts', ':test_tube: Labs', 'Other Commits']
const showAlways = {
  feat: ':rocket: Features',
  fix: ':wrench: Bug Fixes',
  perf: ':fire: Performance Improvements',
  revert: ':arrows_counterclockwise: Reverts',
  refactor: ':microscope: Code Refactoring',
  // chore: 'Chores',
}

const showBreaking = {
  // docs: 'Documentation',
  // style: 'Code Style',
  // test: 'Tests',
  // build: 'Build System',
  // ci: 'Continuous Integration',
}

function getWriterOpts () {
  return {
    transform: (commit, context) => {
      const discard = true
      const newCommit = { ...commit }

      newCommit.notes = commit.notes.map(note => ({
        ...note,
        title: 'BREAKING CHANGES',
        // text: commit.subject + ': ' + note.text,
        scope: commit.scope === '*' ? '' : commit.scope,
        discard: false,
      }))

      if (commit.revert) {
        newCommit.title = showAlways.revert
      } else if (Object.keys(showAlways).includes(commit.type)) {
        newCommit.title = showAlways[commit.type]
      } else if (Object.keys(showBreaking).includes(commit.type)) {
        if (discard) return
        newCommit.title = showBreaking[commit.type]
      } else {
        newCommit.title = 'Other Commits'
        newCommit.subject = commit.header
        newCommit.scope = null
      }

      if (commit.scope === '*') {
        newCommit.scope = ''
      } else if (context.owner === 'vuetifyjs' && context.repository === 'vuetify') {
        const labsComponents = fs.readdirSync(path.join(process.cwd(), 'packages/vuetify/src/labs'), { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)
        if (labsComponents.includes(commit.scope)) {
          newCommit.title = ':test_tube: Labs'
        }
      }

      if (typeof commit.hash === 'string') {
        newCommit.shortHash = commit.hash.substring(0, 7)
      }

      const issues = []
      newCommit.subject = linkify(newCommit.subject, context, issues)
      newCommit.footer = linkify(newCommit.footer, context)

      newCommit.references = commit.references.filter(reference => {
        return !(reference.action == null || issues.includes(reference.issue))
      })

      return newCommit
    },
    groupBy: 'title',
    commitGroupsSort: (a, b) => {
      const aIndex = groupOrder.indexOf(a.title)
      const bIndex = groupOrder.indexOf(b.title)
      return (~aIndex && ~bIndex) ? aIndex - bIndex : a.title.localeCompare(b.title)
    },
    commitsSort: (a, b) => {
      if (!a.scope && b.scope) return -1
      if (a.scope && !b.scope) return 1
      if (a.scope && b.scope) {
        return a.scope.localeCompare(b.scope)
      } else {
        return 0
      }
    },
    noteGroupsSort: 'title',
    notesSort: compareFunc,
  }
}

function linkify (string, context, issues) {
  if (typeof string === 'string') {
    let url = context.repository
      ? `${context.host}/${context.owner}/${context.repository}`
      : context.repoUrl
    if (url) {
      url = `${url}/issues/`
      // Issue URLs.
      string = string.replace(/#([0-9]+)/g, (_, issue) => {
        issues?.push(issue)
        return `[#${issue}](${url}${issue})`
      })
    }
    if (context.host) {
      // User URLs.
      string = string.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
        if (username.includes('/')) {
          return `@${username}`
        }

        return `[@${username}](${context.host}/${username})`
      })
    }
  }
  return string
}
