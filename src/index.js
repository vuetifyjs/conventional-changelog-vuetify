import { parserOpts } from './parser'
import { createWriterOpts } from './writer'
import { whatBump } from './whatBump'

export default async function () {
  return {
    parser: parserOpts,
    writer: await createWriterOpts(),
    whatBump,
  }
}
