/**
 * Propositional logic truth-table generator and classifier (Section 7.4.1).
 * Pure TypeScript — no React, no Supabase, no I/O.
 *
 * Supported operators:
 *   NOT:     ¬  ~  !
 *   AND:     ∧  .  &
 *   OR:      ∨  v  |
 *   IMPLIES: →  ->
 *   IFF:     ↔  <->
 *   Variables: single uppercase letters A–Z
 *   Grouping: ( )
 *
 * @example
 * generateTruthTable("P v Q")
 * // variables: ['P','Q'], 4 rows (TT, TF, FT, FF)
 *
 * classifyExpression("P v ~P") // → 'tautology'
 * classifyExpression("P . ~P") // → 'contradiction'
 * classifyExpression("P v Q")  // → 'contingency'
 */

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Thrown when a logical expression cannot be parsed or evaluated.
 */
export class TruthTableError extends Error {
  readonly name = 'TruthTableError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

export type AstNode =
  | { type: 'var'; name: string }
  | { type: 'not'; child: AstNode }
  | { type: 'and'; left: AstNode; right: AstNode }
  | { type: 'or'; left: AstNode; right: AstNode }
  | { type: 'implies'; left: AstNode; right: AstNode }
  | { type: 'iff'; left: AstNode; right: AstNode }

export type TruthTableRow = {
  assignments: Record<string, boolean>
  result: boolean
}

export type TruthTableResult = {
  variables: string[]
  rows: TruthTableRow[]
  resultColumn: boolean[]
}

export type ExpressionClassification =
  | 'tautology'
  | 'contradiction'
  | 'contingency'

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

type Token =
  | { kind: 'var'; value: string }
  | { kind: 'not' }
  | { kind: 'and' }
  | { kind: 'or' }
  | { kind: 'implies' }
  | { kind: 'iff' }
  | { kind: 'lparen' }
  | { kind: 'rparen' }

/**
 * Tokenize a propositional expression into a flat token list.
 * Multi-character operators (->, <->) are recognized before single chars.
 */
function tokenize(expr: string): Token[] {
  const input = expr.trim()
  if (input.length === 0) {
    throw new TruthTableError('Expression is empty')
  }

  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    const ch = input[i]

    // Skip whitespace
    if (/\s/.test(ch)) {
      i += 1
      continue
    }

    // Multi-char operators first
    if (input.startsWith('<->', i)) {
      tokens.push({ kind: 'iff' })
      i += 3
      continue
    }
    if (input.startsWith('->', i)) {
      tokens.push({ kind: 'implies' })
      i += 2
      continue
    }

    // Single-char / unicode operators
    if (ch === '¬' || ch === '~' || ch === '!') {
      tokens.push({ kind: 'not' })
      i += 1
      continue
    }
    if (ch === '∧' || ch === '.' || ch === '&') {
      tokens.push({ kind: 'and' })
      i += 1
      continue
    }
    // Lowercase 'v' is OR (spec); uppercase 'V' is a variable (handled below).
    if (ch === '∨' || ch === '|' || ch === 'v') {
      tokens.push({ kind: 'or' })
      i += 1
      continue
    }
    if (ch === '→') {
      tokens.push({ kind: 'implies' })
      i += 1
      continue
    }
    if (ch === '↔') {
      tokens.push({ kind: 'iff' })
      i += 1
      continue
    }
    if (ch === '(') {
      tokens.push({ kind: 'lparen' })
      i += 1
      continue
    }
    if (ch === ')') {
      tokens.push({ kind: 'rparen' })
      i += 1
      continue
    }

    // Variables: single uppercase A–Z
    if (/[A-Z]/.test(ch)) {
      tokens.push({ kind: 'var', value: ch })
      i += 1
      continue
    }

    throw new TruthTableError(
      `Unexpected character '${ch}' at position ${i} in expression "${expr}"`
    )
  }

  if (tokens.length === 0) {
    throw new TruthTableError('Expression contains no tokens')
  }

  return tokens
}

// ---------------------------------------------------------------------------
// Recursive-descent parser
// Precedence (low → high): iff < implies < or < and < not < atom
// ---------------------------------------------------------------------------

class Parser {
  private readonly tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): AstNode {
    const node = this.parseIff()
    if (!this.isAtEnd()) {
      const t = this.peek()
      throw new TruthTableError(
        `Unexpected token '${tokenLabel(t)}' after complete expression`
      )
    }
    return node
  }

  private parseIff(): AstNode {
    let left = this.parseImplies()
    while (this.match('iff')) {
      const right = this.parseImplies()
      left = { type: 'iff', left, right }
    }
    return left
  }

  private parseImplies(): AstNode {
    let left = this.parseOr()
    // Right-associative: A -> B -> C = A -> (B -> C)
    if (this.match('implies')) {
      const right = this.parseImplies()
      left = { type: 'implies', left, right }
    }
    return left
  }

  private parseOr(): AstNode {
    let left = this.parseAnd()
    while (this.match('or')) {
      const right = this.parseAnd()
      left = { type: 'or', left, right }
    }
    return left
  }

  private parseAnd(): AstNode {
    let left = this.parseNot()
    while (this.match('and')) {
      const right = this.parseNot()
      left = { type: 'and', left, right }
    }
    return left
  }

  private parseNot(): AstNode {
    if (this.match('not')) {
      return { type: 'not', child: this.parseNot() }
    }
    return this.parseAtom()
  }

  private parseAtom(): AstNode {
    if (this.match('lparen')) {
      const inner = this.parseIff()
      if (!this.match('rparen')) {
        throw new TruthTableError('Missing closing parenthesis ")"')
      }
      return inner
    }

    const t = this.peek()
    if (t && t.kind === 'var') {
      this.pos += 1
      return { type: 'var', name: t.value }
    }

    throw new TruthTableError(
      `Expected variable or "(", got '${t ? tokenLabel(t) : 'end of input'}'`
    )
  }

  private match(kind: Token['kind']): boolean {
    const t = this.peek()
    if (t && t.kind === kind) {
      this.pos += 1
      return true
    }
    return false
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  private isAtEnd(): boolean {
    return this.pos >= this.tokens.length
  }
}

function tokenLabel(t: Token | undefined): string {
  if (!t) return 'end of input'
  if (t.kind === 'var') return t.value
  return t.kind
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a propositional expression into an AST.
 *
 * @param expr - Expression string, e.g. `"P v ~Q"`, `"(A -> B) . A"`
 * @returns Abstract syntax tree
 * @throws {TruthTableError} if the expression is invalid
 *
 * @example
 * parseExpression("P v Q")
 * // { type: 'or', left: { type: 'var', name: 'P' }, right: { type: 'var', name: 'Q' } }
 */
export function parseExpression(expr: string): AstNode {
  if (typeof expr !== 'string') {
    throw new TruthTableError('Expression must be a string')
  }
  const tokens = tokenize(expr)
  return new Parser(tokens).parse()
}

/**
 * Collect unique variables from an expression, sorted alphabetically.
 *
 * @param expr - Expression string
 * @returns Sorted variable names, e.g. `['P', 'Q']`
 * @throws {TruthTableError} if the expression is invalid
 *
 * @example
 * getVariables("Q v P") // → ['P', 'Q']
 */
export function getVariables(expr: string): string[] {
  const ast = parseExpression(expr)
  const set = new Set<string>()
  collectVars(ast, set)
  return Array.from(set).sort()
}

function collectVars(node: AstNode, set: Set<string>): void {
  switch (node.type) {
    case 'var':
      set.add(node.name)
      break
    case 'not':
      collectVars(node.child, set)
      break
    case 'and':
    case 'or':
    case 'implies':
    case 'iff':
      collectVars(node.left, set)
      collectVars(node.right, set)
      break
    default: {
      const _exhaustive: never = node
      throw new TruthTableError(`Unknown AST node: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

/**
 * Evaluate a parsed AST under a variable assignment.
 */
function evalAst(node: AstNode, assignment: Record<string, boolean>): boolean {
  switch (node.type) {
    case 'var': {
      if (!(node.name in assignment)) {
        throw new TruthTableError(
          `Missing truth value for variable '${node.name}'`
        )
      }
      return assignment[node.name]
    }
    case 'not':
      return !evalAst(node.child, assignment)
    case 'and':
      return evalAst(node.left, assignment) && evalAst(node.right, assignment)
    case 'or':
      return evalAst(node.left, assignment) || evalAst(node.right, assignment)
    case 'implies': {
      const a = evalAst(node.left, assignment)
      const b = evalAst(node.right, assignment)
      return !a || b
    }
    case 'iff': {
      const a = evalAst(node.left, assignment)
      const b = evalAst(node.right, assignment)
      return a === b
    }
    default: {
      const _exhaustive: never = node
      throw new TruthTableError(`Unknown AST node: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

/**
 * Evaluate an expression under a given assignment of variables to booleans.
 *
 * @param expr - Expression string
 * @param assignment - Map of variable → truth value, e.g. `{ P: true, Q: false }`
 * @returns Evaluated boolean result
 * @throws {TruthTableError} if the expression is invalid or a variable is missing
 *
 * @example
 * evaluateExpression("P v Q", { P: true, Q: false }) // → true
 */
export function evaluateExpression(
  expr: string,
  assignment: Record<string, boolean>
): boolean {
  if (typeof assignment !== 'object' || assignment === null) {
    throw new TruthTableError('Assignment must be a Record<string, boolean>')
  }
  const ast = parseExpression(expr)
  return evalAst(ast, assignment)
}

/**
 * Generate the full truth table for an expression.
 * Rows follow binary counting with T=true first for each variable
 * (standard: for n vars, 2^n rows; leftmost var flips slowest: TT, TF, FT, FF).
 *
 * @param expr - Expression string
 * @returns Variables, rows with assignments + result, and result column
 * @throws {TruthTableError} if the expression is invalid
 *
 * @example
 * generateTruthTable("P v Q")
 * // variables: ['P','Q']
 * // rows: TT→T, TF→T, FT→T, FF→F
 */
export function generateTruthTable(expr: string): TruthTableResult {
  const ast = parseExpression(expr)
  const variables = getVariables(expr)
  const rowCount = 2 ** variables.length
  const rows: TruthTableRow[] = []
  const resultColumn: boolean[] = []

  for (let i = 0; i < rowCount; i += 1) {
    const assignments: Record<string, boolean> = {}
    for (let v = 0; v < variables.length; v += 1) {
      // Leftmost variable flips slowest: bit from MSB
      const bit = (i >> (variables.length - 1 - v)) & 1
      // 0 → true (T), 1 → false (F) so order is TT, TF, FT, FF
      assignments[variables[v]] = bit === 0
    }
    const result = evalAst(ast, assignments)
    rows.push({ assignments, result })
    resultColumn.push(result)
  }

  return { variables, rows, resultColumn }
}

/**
 * Classify an expression as tautology, contradiction, or contingency.
 *
 * @param expr - Expression string
 * @returns Classification based on the result column
 * @throws {TruthTableError} if the expression is invalid
 *
 * @example
 * classifyExpression("P v ~P") // → 'tautology'
 * classifyExpression("P . ~P") // → 'contradiction'
 * classifyExpression("P v Q")  // → 'contingency'
 */
export function classifyExpression(expr: string): ExpressionClassification {
  const { resultColumn } = generateTruthTable(expr)

  if (resultColumn.length === 0) {
    throw new TruthTableError('Cannot classify expression with empty result column')
  }

  const allTrue = resultColumn.every((r) => r === true)
  const allFalse = resultColumn.every((r) => r === false)

  if (allTrue) return 'tautology'
  if (allFalse) return 'contradiction'
  return 'contingency'
}

/**
 * Format a truth table as human-readable lines for UI display.
 *
 * @param expr - Expression string
 * @returns Multi-line string with header and T/F rows
 * @throws {TruthTableError} if the expression is invalid
 *
 * @example
 * formatTruthTable("P v Q")
 * // P | Q | P v Q
 * // T | T | T
 * // T | F | T
 * // F | T | T
 * // F | F | F
 */
export function formatTruthTable(expr: string): string {
  const trimmed = expr.trim()
  const { variables, rows } = generateTruthTable(trimmed)
  const header = [...variables, trimmed].join(' | ')
  const body = rows.map((row) => {
    const cells = variables.map((v) => (row.assignments[v] ? 'T' : 'F'))
    cells.push(row.result ? 'T' : 'F')
    return cells.join(' | ')
  })
  return [header, ...body].join('\n')
}
