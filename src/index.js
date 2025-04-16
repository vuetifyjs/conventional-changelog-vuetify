import { parserOpts } from './parser.js'
import { createWriterOpts } from './writer.js'
import { whatBump } from './whatBump.js'

export default async function () {
  return {
    parser: parserOpts,
    writer: await createWriterOpts(),
    whatBump,
  }
}
