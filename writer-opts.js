'use strict'

const compareFunc = require('compare-func')
const Q = require('q')
const readFile = Q.denodeify(require('fs').readFile)
const resolve = require('path').resolve

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

function getWriterOpts () {
  return {
    transform: (commit, context) => {
      let discard = true
      const issues = []

      commit.notes.forEach(note => {
        note.title = 'BREAKING CHANGES'
        discard = false
      })

      const showAlways = {
        feat: ':rocket: Features',
        fix: ':wrench: Bug Fixes',
        perf: ':fire: Performance Improvements',
        revert: ':arrows_counterclockwise: Reverts',
        refactor: ':microscope: Code Refactoring',
        // chore: 'Chores',
      }

      const showBreaking = {
        docs: 'Documentation',
        style: 'Code Style',
        test: 'Tests',
        build: 'Build System',
        ci: 'Continuous Integration',
      }

      if (commit.revert) {
        commit.title = showAlways.revert
      } else if (Object.keys(showAlways).includes(commit.type)) {
        commit.title = showAlways[commit.type]
      } else if (Object.keys(showBreaking).includes(commit.type)) {
        if (discard) return
        commit.title = showBreaking[commit.type]
      } else {
        commit.title = 'Other Commmits'
        commit.subject = commit.header
        commit.scope = null
      }

      if (commit.scope === '*') {
        commit.scope = ''
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
    commitGroupsSort: 'type',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
    notesSort: compareFunc,
  }
}
