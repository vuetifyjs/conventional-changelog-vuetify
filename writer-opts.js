'use strict'

const fs = require('fs')
const path = require('path')
const compareFunc = require('compare-func')
const Q = require('q')
const readFile = Q.denodeify(fs.readFile)
const resolve = path.resolve

module.exports = Q.all([
  readFile(resolve(__dirname, './templates/template.hbs'), 'utf-8'),
  readFile(resolve(__dirname, './templates/header.hbs'), 'utf-8'),
  readFile(resolve(__dirname, './templates/commit.hbs'), 'utf-8'),
  readFile(resolve(__dirname, './templates/footer.hbs'), 'utf-8'),
])
  .spread((template, header, commit, footer) => {
    const writerOpts = getWriterOpts()

    writerOpts.mainTemplate = template
    writerOpts.headerPartial = header
    writerOpts.commitPartial = commit
    writerOpts.footerPartial = footer

    return writerOpts
  })

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
      let discard = true
      const issues = []

      commit.notes.forEach(note => {
        note.title = 'BREAKING CHANGES'
        // note.text = commit.subject + ': ' + note.text
        note.scope = commit.scope === '*' ? '' : commit.scope
        discard = false
      })

      if (commit.revert) {
        commit.title = showAlways.revert
      } else if (Object.keys(showAlways).includes(commit.type)) {
        commit.title = showAlways[commit.type]
      } else if (Object.keys(showBreaking).includes(commit.type)) {
        if (discard) return
        commit.title = showBreaking[commit.type]
      } else {
        commit.title = 'Other Commits'
        commit.subject = commit.header
        commit.scope = null
      }

      if (commit.scope === '*') {
        commit.scope = ''
      } else if (context.owner === 'vuetifyjs' && context.repository === 'vuetify') {
        const labsComponents = fs.readdirSync(path.join(process.cwd(), 'packages/vuetify/src/labs'), { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)
        if (labsComponents.includes(commit.scope)) {
          commit.title = ':test_tube: Labs'
        }
      }

      if (typeof commit.hash === 'string') {
        commit.shortHash = commit.hash.substring(0, 7)
      }

      if (typeof commit.subject === 'string') {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl
        if (url) {
          url = `${url}/issues/`
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue)
            return `[#${issue}](${url}${issue})`
          })
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
            if (username.includes('/')) {
              return `@${username}`
            }

            return `[@${username}](${context.host}/${username})`
          })
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(reference => {
        if (issues.indexOf(reference.issue) === -1) {
          return true
        }

        return false
      })

      return commit
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
