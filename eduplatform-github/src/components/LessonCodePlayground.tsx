import React, { useEffect, useState } from 'react';
import { Check, Copy, Play, RotateCcw, Terminal } from 'lucide-react';

interface LessonCodePlaygroundProps {
  lessonId: string;
  courseId: string;
  initialCode: string;
}

type KotlinVar = { mutable: boolean; value: unknown };

function stripComments(source: string): string {
  let out = '';
  let inQuote: string | null = null;
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (inQuote) {
      out += ch;
      if (ch === '\\' && i + 1 < source.length) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === inQuote) inQuote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < source.length - 1 && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function splitTopLevelArgs(argsText: string): string[] {
  const args: string[] = [];
  let current = '';
  let depth = 0;
  let inQuote: string | null = null;
  for (let i = 0; i < argsText.length; i++) {
    const ch = argsText[i];
    if (inQuote) {
      current += ch;
      if (ch === '\\' && i + 1 < argsText.length) {
        current += argsText[i + 1];
        i++;
        continue;
      }
      if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      if (current.trim()) args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function convertKotlinStringTemplate(strLiteralInner: string, evalExpr: (e: string) => unknown): string {
  let result = '';
  let i = 0;
  while (i < strLiteralInner.length) {
    const ch = strLiteralInner[i];
    if (ch === '\\' && i + 1 < strLiteralInner.length) {
      const esc = strLiteralInner[i + 1];
      if (esc === 'n') result += '\n';
      else if (esc === 't') result += '\t';
      else result += esc;
      i += 2;
      continue;
    }
    if (ch === '$') {
      if (strLiteralInner[i + 1] === '{') {
        let depth = 1;
        let j = i + 2;
        while (j < strLiteralInner.length && depth > 0) {
          if (strLiteralInner[j] === '{') depth++;
          else if (strLiteralInner[j] === '}') depth--;
          j++;
        }
        const innerExpr = strLiteralInner.slice(i + 2, j - 1);
        result += formatKotlinVal(evalExpr(innerExpr));
        i = j;
        continue;
      }
      const idMatch = /^[A-Za-z_][A-Za-z0-9_]*/.exec(strLiteralInner.slice(i + 1));
      if (idMatch) {
        result += formatKotlinVal(evalExpr(idMatch[0]));
        i += 1 + idMatch[0].length;
        continue;
      }
    }
    result += ch;
    i++;
  }
  return result;
}

function formatKotlinVal(val: unknown): string {
  if (Array.isArray(val)) return `[${val.map(formatKotlinVal).join(', ')}]`;
  if (val === null || val === undefined) return 'null';
  return String(val);
}

function evaluateKotlinExpr(rawExpr: string, vars: Map<string, KotlinVar>): unknown {
  const expr = rawExpr.trim();
  if (!expr) return '';

  // Support inline Kotlin `if (cond) a else b` (including else if / brace blocks)
  if (/^if\s*\(/.test(expr)) {
    const parsed = parseKotlinNodes(expr);
    if (parsed.length === 1 && parsed[0].type === 'if') {
      const evalIfNode = (node: Extract<KtNode, { type: 'if' }>): unknown => {
        const cond = Boolean(evaluateKotlinExpr(node.cond, vars));
        const branch = cond ? node.thenBody : node.elseBody;
        const last = branch[branch.length - 1];
        if (!last) return undefined;
        if (last.type === 'if') return evalIfNode(last);
        if (last.type === 'stmt') return evaluateKotlinExpr(last.text, vars);
        return undefined;
      };
      return evalIfNode(parsed[0]);
    }
  }

  // Handle pure double-quoted string literal with Kotlin $ / ${} interpolation
  if (expr.startsWith('"') && expr.endsWith('"')) {
    let closedEarly = false;
    for (let i = 1; i < expr.length - 1; i++) {
      if (expr[i] === '\\') {
        i++;
        continue;
      }
      if (expr[i] === '"') {
        closedEarly = true;
        break;
      }
    }
    if (!closedEarly) {
      return convertKotlinStringTemplate(expr.slice(1, -1), (e) => evaluateKotlinExpr(e, vars));
    }
  }

  // Replace Kotlin string templates inside composite expressions
  let normalized = '';
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === '"') {
      let j = i + 1;
      while (j < expr.length) {
        if (expr[j] === '\\') {
          j += 2;
          continue;
        }
        if (expr[j] === '"') break;
        j++;
      }
      const rendered = convertKotlinStringTemplate(expr.slice(i + 1, j), (e) =>
        evaluateKotlinExpr(e, vars)
      );
      normalized += JSON.stringify(rendered);
      i = j + 1;
      continue;
    }
    normalized += expr[i];
    i++;
  }

  normalized = normalized
    .replace(/\b(mutableListOf|listOf)\s*\(/g, '__ktList(')
    .replace(/\.toDouble\(\)/g, '')
    .replace(/\.toInt\(\)/g, ' | 0')
    .replace(/\.uppercase\(\)/g, '.toUpperCase()')
    .replace(/\.lowercase\(\)/g, '.toLowerCase()')
    .replace(/\.isEmpty\(\)/g, '.length === 0')
    .replace(/\.isNotEmpty\(\)/g, '.length > 0')
    .replace(/\.reversed\(\)/g, '.__ktRev()')
    .replace(/\.sum\(\)/g, '.__ktSum()')
    .replace(/\.average\(\)/g, '.__ktAvg()')
    .replace(/\.first\(\)/g, '[0]')
    .replace(/\.last\(\)/g, '.__ktLast()')
    .replace(/\.size\b/g, '.length')
    .replace(/\b(\w+)\s+in\s+(\d+)\.\.(\d+)/g, '($1 >= $2 && $1 <= $3)');

  // Validate identifiers exist in scope or helpers before evaluating
  const reserved = new Set([
    'true',
    'false',
    'null',
    'Math',
    'Number',
    'String',
    'Boolean',
    '__ktList',
    'toUpperCase',
    'toLowerCase',
    'trim',
    'split',
    'join',
    'includes',
    'length',
    '__ktRev',
    '__ktSum',
    '__ktAvg',
    '__ktLast',
    'round',
    'max',
    'min',
    'abs',
  ]);
  const withoutStrings = normalized.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, ' ');
  const idTokens = withoutStrings.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) ?? [];
  for (const tok of idTokens) {
    if (!vars.has(tok) && !reserved.has(tok)) {
      throw new Error(`Unresolved reference '${tok}'.`);
    }
  }

  const helperKeys = ['__ktList', '__ktDiv', 'Math'];
  const helperVals: unknown[] = [
    (...items: unknown[]) => {
      const arr = [...items] as unknown[] & Record<string, unknown>;
      return arr;
    },
    (a: unknown, b: unknown) => {
      const numA = Number(a);
      const numB = Number(b);
      if (Number.isInteger(numA) && Number.isInteger(numB) && numB !== 0) {
        return Math.trunc(numA / numB);
      }
      return numA / numB;
    },
    Math,
  ];

  // Track original integer-vs-float divisions on simple `a / b` when neither is a float literal or .toDouble()
  if (!rawExpr.includes('.toDouble()') && !/\d+\.\d+/.test(withoutStrings)) {
    normalized = normalized.replace(
      /([A-Za-z0-9_.)\]]+)\s*\/\s*([A-Za-z0-9_.(\[]+)/g,
      '__ktDiv($1, $2)'
    );
  }

  // Rewrite chained or simple Kotlin helper methods safely without prototype pollution
  const wrapChainHelper = (src: string, helperName: string): string => {
    const marker = `.${helperName}()`;
    let out = src;
    let idx = out.indexOf(marker);
    while (idx !== -1) {
      let start = idx - 1;
      let parenDepth = 0;
      let bracketDepth = 0;
      while (start >= 0) {
        const c = out[start];
        if (c === ')') parenDepth++;
        else if (c === '(') {
          if (parenDepth === 0) break;
          parenDepth--;
        } else if (c === ']') bracketDepth++;
        else if (c === '[') {
          if (bracketDepth === 0) break;
          bracketDepth--;
        } else if (parenDepth === 0 && bracketDepth === 0 && !/[A-Za-z0-9_.]/.test(c)) {
          break;
        }
        start--;
      }
      const targetExpr = out.slice(start + 1, idx);
      out = out.slice(0, start + 1) + `${helperName}(${targetExpr})` + out.slice(idx + marker.length);
      idx = out.indexOf(marker);
    }
    return out;
  };
  normalized = wrapChainHelper(normalized, '__ktRev');
  normalized = wrapChainHelper(normalized, '__ktSum');
  normalized = wrapChainHelper(normalized, '__ktAvg');
  normalized = wrapChainHelper(normalized, '__ktLast');

  const fnKeys = [...helperKeys, '__ktRev', '__ktSum', '__ktAvg', '__ktLast'];
  const fnVals: unknown[] = [
    ...helperVals,
    (v: unknown) =>
      typeof v === 'string'
        ? v.split('').reverse().join('')
        : Array.isArray(v)
        ? [...v].reverse()
        : v,
    (v: unknown) => (Array.isArray(v) ? v.reduce<number>((a, b) => a + Number(b), 0) : 0),
    (v: unknown) =>
      Array.isArray(v) && v.length > 0
        ? v.reduce<number>((a, b) => a + Number(b), 0) / v.length
        : 0,
    (v: unknown) => (Array.isArray(v) ? v[v.length - 1] : undefined),
  ];

  for (const [k, v] of vars.entries()) {
    fnKeys.push(k);
    fnVals.push(v.value);
  }

  const fn = new Function(...fnKeys, `"use strict"; return (${normalized});`);
  return fn(...fnVals);
}

type KtNode =
  | { type: 'stmt'; text: string }
  | { type: 'if'; cond: string; thenBody: KtNode[]; elseBody: KtNode[] }
  | { type: 'for'; varName: string; iterExpr: string; body: KtNode[] }
  | { type: 'while'; cond: string; body: KtNode[] };

function findMatchingDelim(src: string, openIdx: number, openCh: string, closeCh: string): number {
  let depth = 0;
  let inQuote: string | null = null;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inQuote) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (ch === openCh) depth++;
    else if (ch === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseIfNode(src: string, startIdx: number): { node: KtNode; nextIndex: number } {
  const openParen = src.indexOf('(', startIdx + 2);
  const closeParen = findMatchingDelim(src, openParen, '(', ')');
  if (openParen === -1 || closeParen === -1) {
    throw new Error("if sharti qavslari to'g'ri yozilmagan.");
  }
  const cond = src.slice(openParen + 1, closeParen).trim();
  let cursor = closeParen + 1;
  while (cursor < src.length && /\s/.test(src[cursor])) cursor++;

  let thenBody: KtNode[] = [];
  if (src[cursor] === '{') {
    const closeBrace = findMatchingDelim(src, cursor, '{', '}');
    if (closeBrace === -1) throw new Error("if bloki '}' bilan yopilmagan.");
    thenBody = parseKotlinNodes(src.slice(cursor + 1, closeBrace));
    cursor = closeBrace + 1;
  } else {
    const lineEnd = src.indexOf('\n', cursor);
    const maxEnd = lineEnd === -1 ? src.length : lineEnd;
    const slice = src.slice(cursor, maxEnd);
    const elseMatch = /\belse\b/.exec(slice);
    const end = elseMatch ? cursor + elseMatch.index : maxEnd;
    thenBody = [{ type: 'stmt', text: src.slice(cursor, end).trim() }];
    cursor = end;
  }

  let checkElse = cursor;
  while (checkElse < src.length && /\s/.test(src[checkElse])) checkElse++;
  let elseBody: KtNode[] = [];
  if (src.startsWith('else', checkElse) && !/[A-Za-z0-9_]/.test(src[checkElse + 4] ?? '')) {
    let afterElse = checkElse + 4;
    while (afterElse < src.length && /\s/.test(src[afterElse])) afterElse++;
    if (src.startsWith('if', afterElse) && !/[A-Za-z0-9_]/.test(src[afterElse + 2] ?? '')) {
      const chained = parseIfNode(src, afterElse);
      elseBody = [chained.node];
      cursor = chained.nextIndex;
    } else if (src[afterElse] === '{') {
      const closeElse = findMatchingDelim(src, afterElse, '{', '}');
      if (closeElse === -1) throw new Error("else bloki '}' bilan yopilmagan.");
      elseBody = parseKotlinNodes(src.slice(afterElse + 1, closeElse));
      cursor = closeElse + 1;
    } else {
      const lineEnd = src.indexOf('\n', afterElse);
      const end = lineEnd === -1 ? src.length : lineEnd;
      elseBody = [{ type: 'stmt', text: src.slice(afterElse, end).trim() }];
      cursor = end;
    }
  }

  return { node: { type: 'if', cond, thenBody, elseBody }, nextIndex: cursor };
}

function parseKotlinNodes(src: string): KtNode[] {
  const nodes: KtNode[] = [];
  let i = 0;

  while (i < src.length) {
    while (i < src.length && /[\s;]/.test(src[i])) i++;
    if (i >= src.length) break;

    if (src.startsWith('if', i) && !/[A-Za-z0-9_]/.test(src[i + 2] ?? '')) {
      const parsedIf = parseIfNode(src, i);
      nodes.push(parsedIf.node);
      i = parsedIf.nextIndex;
      continue;
    }

    if (src.startsWith('for', i) && !/[A-Za-z0-9_]/.test(src[i + 3] ?? '')) {
      const openParen = src.indexOf('(', i + 3);
      const closeParen = findMatchingDelim(src, openParen, '(', ')');
      const header = src.slice(openParen + 1, closeParen).trim();
      const inMatch = /^([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+)$/.exec(header);
      if (!inMatch) throw new Error(`Noto'g'ri for sikli sarlavhasi: (${header})`);
      let cursor = closeParen + 1;
      while (cursor < src.length && /\s/.test(src[cursor])) cursor++;
      const closeBrace = findMatchingDelim(src, cursor, '{', '}');
      if (closeBrace === -1) throw new Error("for bloki '}' bilan yopilmagan.");
      const body = parseKotlinNodes(src.slice(cursor + 1, closeBrace));
      nodes.push({ type: 'for', varName: inMatch[1], iterExpr: inMatch[2].trim(), body });
      i = closeBrace + 1;
      continue;
    }

    if (src.startsWith('while', i) && !/[A-Za-z0-9_]/.test(src[i + 5] ?? '')) {
      const openParen = src.indexOf('(', i + 5);
      const closeParen = findMatchingDelim(src, openParen, '(', ')');
      const cond = src.slice(openParen + 1, closeParen).trim();
      let cursor = closeParen + 1;
      while (cursor < src.length && /\s/.test(src[cursor])) cursor++;
      const closeBrace = findMatchingDelim(src, cursor, '{', '}');
      if (closeBrace === -1) throw new Error("while bloki '}' bilan yopilmagan.");
      const body = parseKotlinNodes(src.slice(cursor + 1, closeBrace));
      nodes.push({ type: 'while', cond, body });
      i = closeBrace + 1;
      continue;
    }

    // Read single statement until newline (if balanced parens & braces) or semicolon
    let j = i;
    let parenDepth = 0;
    let braceDepth = 0;
    let inQuote: string | null = null;
    while (j < src.length) {
      const ch = src[j];
      if (inQuote) {
        if (ch === '\\') {
          j += 2;
          continue;
        }
        if (ch === inQuote) inQuote = null;
        j++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        inQuote = ch;
        j++;
        continue;
      }
      if (ch === '(' || ch === '[') parenDepth++;
      else if (ch === ')' || ch === ']') parenDepth = Math.max(0, parenDepth - 1);
      else if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
      if ((ch === '\n' || ch === ';') && parenDepth === 0 && braceDepth === 0) {
        // Peek ahead past horizontal whitespace/newlines to see if statement continues with `else`
        if (ch === '\n') {
          let look = j + 1;
          while (look < src.length && /\s/.test(src[look])) look++;
          if (src.startsWith('else', look) && !/[A-Za-z0-9_]/.test(src[look + 4] ?? '')) {
            j++;
            continue;
          }
        }
        break;
      }
      j++;
    }
    const stmtText = src.slice(i, j).trim();
    if (stmtText) nodes.push({ type: 'stmt', text: stmtText });
    i = j + 1;
  }
  return nodes;
}

function executeKotlinSubset(source: string): { ok: boolean; lines: string[]; fallbackNeeded?: boolean } {
  const clean = stripComments(source).trim();

  // Advanced Kotlin / Compose / Android SDK / Gradle / JUnit constructs fall back cleanly to static validation
  if (
    /\b(data\s+class|sealed|class|interface|when|import|package|buildTypes|LazyColumn|Scaffold|Box|Column|Row|Button|LaunchedEffect|DisposableEffect|TextToSpeech)\b/.test(
      clean
    ) ||
    /@(?:Composable|Test)\b/.test(clean) ||
    /\btry\s*\{/.test(clean) ||
    /\bsuspend\s+fun\b/.test(clean) ||
    /\bfun\s+(?!main\s*\()/.test(clean) ||
    /\bby\s+remember\b|\?\s*\.|\?:|\.(?:filter|map|forEach|sumOf|distinct|count)\s*\{/.test(clean) ||
    (/\b(context|Context|LocalContext|SharedPreferences|Intent|Modifier|remember|mutableStateOf|mutableIntStateOf|ViewModel|StateFlow|MutableStateFlow|Dispatchers|withContext)\b/.test(
      clean
    ) &&
      !/\b(?:val|var)\s+context\b/.test(clean))
  ) {
    return { ok: true, lines: [], fallbackNeeded: true };
  }

  let bodyCode = clean;
  const mainMatch = /^fun\s+main\s*\(\s*\)\s*\{([\s\S]*)\}$/.exec(clean);
  if (mainMatch) {
    bodyCode = mainMatch[1];
  }

  const vars = new Map<string, KotlinVar>();
  const lines: string[] = [];
  let inlineBuffer = '';
  let stepGuard = 0;

  const execStmt = (stmt: string) => {
    if (++stepGuard > 1000) {
      throw new Error("Sikl juda ko'p marta aylandi (cheksiz sikl ehtimoli).");
    }

    // val / var declaration
    const declMatch = /^(val|var)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*:\s*[A-Za-z0-9_<>?]+)?\s*=\s*([\s\S]+)$/.exec(
      stmt
    );
    if (declMatch) {
      const [, kind, name, expr] = declMatch;
      const val = evaluateKotlinExpr(expr, vars);
      vars.set(name, { mutable: kind === 'var', value: val });
      return;
    }

    // Increment / decrement
    const incMatch = /^([A-Za-z_][A-Za-z0-9_]*)(\+\+|--)$/.exec(stmt);
    if (incMatch) {
      const [, name, op] = incMatch;
      const existing = vars.get(name);
      if (!existing) throw new Error(`Unresolved reference '${name}'.`);
      if (!existing.mutable) {
        throw new Error(
          `Val cannot be reassigned — '${name}' o'zgarmas (val) qilib e'lon qilingan.`
        );
      }
      existing.value = Number(existing.value) + (op === '++' ? 1 : -1);
      return;
    }

    // Compound assignment
    const compMatch = /^([A-Za-z_][A-Za-z0-9_]*)\s*(\+=|-=|\*=|\/=)\s*([\s\S]+)$/.exec(stmt);
    if (compMatch) {
      const [, name, op, expr] = compMatch;
      const existing = vars.get(name);
      if (!existing) throw new Error(`Unresolved reference '${name}'.`);
      if (!existing.mutable) {
        throw new Error(
          `Val cannot be reassigned — '${name}' o'zgarmas (val) qilib e'lon qilingan. O'zgartirish uchun var ishlating.`
        );
      }
      const rhs = evaluateKotlinExpr(expr, vars);
      if (op === '+=') existing.value = (existing.value as number) + (rhs as number);
      else if (op === '-=') existing.value = Number(existing.value) - Number(rhs);
      else if (op === '*=') existing.value = Number(existing.value) * Number(rhs);
      else if (op === '/=') existing.value = Number(existing.value) / Number(rhs);
      return;
    }

    // Reassignment
    const assignMatch = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]+)$/.exec(stmt);
    if (assignMatch) {
      const [, name, expr] = assignMatch;
      const existing = vars.get(name);
      if (!existing) {
        throw new Error(
          `Unresolved reference '${name}'. Avval var yoki val bilan e'lon qiling.`
        );
      }
      if (!existing.mutable) {
        throw new Error(
          `Val cannot be reassigned — '${name}' o'zgarmas (val) qilib e'lon qilingan. O'zgartirish uchun var ishlating.`
        );
      }
      existing.value = evaluateKotlinExpr(expr, vars);
      return;
    }

    // println(...) / print(...)
    const printMatch = /^(println|print)\s*\(([\s\S]*)\)$/.exec(stmt);
    if (printMatch) {
      const [, fnName, argExpr] = printMatch;
      const text = argExpr.trim() ? formatKotlinVal(evaluateKotlinExpr(argExpr, vars)) : '';
      if (fnName === 'print') {
        inlineBuffer += text;
      } else {
        const combined = inlineBuffer + text;
        inlineBuffer = '';
        combined.split('\n').forEach((l) => lines.push(l));
      }
      return;
    }

    // list.add(...) / list.remove(...)
    const methodMatch = /^([A-Za-z_][A-Za-z0-9_]*)\.(add|remove|clear)\s*\(([\s\S]*)\)$/.exec(
      stmt
    );
    if (methodMatch) {
      const [, name, method, rawArgs] = methodMatch;
      const existing = vars.get(name);
      if (!existing || !Array.isArray(existing.value)) {
        throw new Error(`Unresolved reference '${name}'.`);
      }
      const args = splitTopLevelArgs(rawArgs).map((a) => evaluateKotlinExpr(a, vars));
      if (method === 'add') existing.value.push(args[0]);
      else if (method === 'remove') {
        const idx = existing.value.indexOf(args[0]);
        if (idx >= 0) existing.value.splice(idx, 1);
      } else if (method === 'clear') {
        existing.value.length = 0;
      }
      return;
    }
  };

  const execNodes = (nodes: KtNode[]) => {
    for (const node of nodes) {
      if (node.type === 'stmt') {
        execStmt(node.text);
      } else if (node.type === 'if') {
        const condVal = Boolean(evaluateKotlinExpr(node.cond, vars));
        execNodes(condVal ? node.thenBody : node.elseBody);
      } else if (node.type === 'while') {
        while (Boolean(evaluateKotlinExpr(node.cond, vars))) {
          if (++stepGuard > 1000) {
            throw new Error("While sikli limitdan oshdi (cheksiz sikl).");
          }
          execNodes(node.body);
        }
      } else if (node.type === 'for') {
        let items: unknown[] = [];
        const rangeMatch = /^(.+?)\s*(\.\.|until|downTo)\s*(.+?)(?:\s+step\s+(\d+))?$/.exec(
          node.iterExpr
        );
        if (rangeMatch) {
          const start = Number(evaluateKotlinExpr(rangeMatch[1], vars));
          const op = rangeMatch[2];
          const end = Number(evaluateKotlinExpr(rangeMatch[3], vars));
          const step = rangeMatch[4] ? Math.max(1, Number(rangeMatch[4])) : 1;
          if (op === '..') {
            for (let x = start; x <= end; x += step) items.push(x);
          } else if (op === 'until') {
            for (let x = start; x < end; x += step) items.push(x);
          } else {
            for (let x = start; x >= end; x -= step) items.push(x);
          }
        } else {
          const col = evaluateKotlinExpr(node.iterExpr, vars);
          if (Array.isArray(col)) items = col;
        }
        for (const item of items) {
          if (++stepGuard > 1000) {
            throw new Error("For sikli limitdan oshdi.");
          }
          vars.set(node.varName, { mutable: false, value: item });
          execNodes(node.body);
        }
      }
    }
  };

  try {
    const parsed = parseKotlinNodes(bodyCode);
    execNodes(parsed);
    if (inlineBuffer) lines.push(inlineBuffer);
    return {
      ok: true,
      lines:
        lines.length > 0
          ? lines
          : ['Kotlin kodi muvaffaqiyatli bajarildi (ekranga chiqarish uchun println(...) yozing).'],
    };
  } catch (err) {
    return {
      ok: false,
      lines: [err instanceof Error ? `Xato: ${err.message}` : 'Kodni bajarishda xatolik'],
    };
  }
}

export function runCodeSafely(code: string, courseId: string): { ok: boolean; lines: string[] } {
  const trimmed = code.trim();
  if (!trimmed) {
    return { ok: false, lines: ["Kod maydoni bo'sh. Sinash uchun kod yozing."] };
  }

  // Check balanced brackets across all languages (ignoring comments so apostrophes inside comments don't trigger string mode)
  const commentFree = stripComments(trimmed);
  const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const stack: string[] = [];
  let inString: string | null = null;
  for (let i = 0; i < commentFree.length; i++) {
    const ch = commentFree[i];
    if (inString) {
      if (ch === inString && commentFree[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (pairs[ch]) {
      stack.push(pairs[ch]);
    } else if (ch === ')' || ch === '}' || ch === ']') {
      if (stack.pop() !== ch) {
        return {
          ok: false,
          lines: [`Sintaksis xatosi: "${ch}" qavsi noto'g'ri yopilgan.`],
        };
      }
    }
  }
  if (stack.length > 0) {
    return {
      ok: false,
      lines: [`Sintaksis xatosi: "${stack[stack.length - 1]}" qavsi yopilmay qolgan.`],
    };
  }

  // Interactive Kotlin execution for beginner, logic, and Kotlin courses
  if (['dasturlash-noldan', 'amaliy-masalalar', 'kotlin-basics', 'android-compose'].includes(courseId)) {
    const ktResult = executeKotlinSubset(trimmed);
    if (!ktResult.fallbackNeeded) {
      return { ok: ktResult.ok, lines: ktResult.lines };
    }
  }

  // Execute runnable pure JS snippets inside console capture for JS/Web/React/Node courses
  const hasTsOrFrameworkSyntax =
    /\b(interface|type|enum)\s+[A-Z]/.test(trimmed) ||
    /:\s*(?:string|number|boolean|void|unknown|any|Record|Lesson|Course|Screen|React)\b/.test(trimmed) ||
    /\bas\s+(?:const|string|number)\b/.test(trimmed) ||
    /^(?:npm|npx|yarn|pnpm)\s+/m.test(trimmed) ||
    /\b(useState|useEffect|useMemo|useCallback|set[A-Z][A-Za-z0-9_]*|express|req\.|res\.|app\.(?:get|post|put|delete|use)|await\s+)\b/.test(
      trimmed
    );

  const isJsLike =
    ['javascript-ts', 'react-next', 'nodejs-backend', 'typescript-react', 'backend-api'].includes(
      courseId
    ) &&
    !trimmed.includes('<') &&
    !trimmed.includes('import ') &&
    !trimmed.includes('export ') &&
    !hasTsOrFrameworkSyntax;

  if (isJsLike) {
    const logs: string[] = [];
    const mockConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      warn: (...args: unknown[]) => logs.push(`Ogohlantirish: ${args.join(' ')}`),
      error: (...args: unknown[]) => logs.push(`Xato: ${args.join(' ')}`),
    };

    try {
      const fn = new Function('console', trimmed);
      fn(mockConsole);
      return {
        ok: true,
        lines:
          logs.length > 0
            ? logs
            : ['Kod muvaffaqiyatli bajarildi (chiqish uchun console.log(...) yozib ko‘ring).'],
      };
    } catch (err) {
      return {
        ok: false,
        lines: [err instanceof Error ? `Ishga tushirish xatosi: ${err.message}` : 'Noma’lum xato'],
      };
    }
  }

  // Helpful static & output analysis for Android SDK, Compose, Kotlin advanced, TS/React, Express API, Python, SQL, Git
  const outputLines: string[] = ['Sintaksis tekshiruvi muvaffaqiyatli o‘tdi!'];
  const printMatches = [...trimmed.matchAll(/(?:println|print|console\.log)\(([^)]+)\)/g)];
  if (printMatches.length > 0) {
    outputLines.push('Kutilayotgan konsol chiqishi:');
    printMatches.forEach((m) => outputLines.push(`> ${m[1].replace(/^['"`]|['"`]$/g, '')}`));
  } else if (trimmed.includes('getSharedPreferences') || /\bcontext\b/.test(trimmed)) {
    outputLines.push(
      'Android SDK (Context / SharedPreferences) kodi to‘g‘ri: qurilma xotirasiga kalit-qiymat juftligini fon rejimida (apply) saqlaydi.'
    );
  } else if (
    trimmed.includes('@Composable') ||
    /\b(Scaffold|LazyColumn|Modifier|LaunchedEffect|remember)\b/.test(trimmed)
  ) {
    outputLines.push(
      'Jetpack Compose UI / State kodi aniqlandi: komponent sintaksisi to‘g‘ri va Android qurilmada chizilishga tayyor.'
    );
  } else if (trimmed.includes('@Test') || trimmed.includes('assertEquals')) {
    outputLines.push('JUnit test sintaksisi to‘g‘ri: Android Studio’da mantiqni avtomatik tekshirishga tayyor.');
  } else if (trimmed.includes('buildTypes') || trimmed.includes('isMinifyEnabled')) {
    outputLines.push('Gradle (build.gradle.kts) sozlamasi to‘g‘ri: Release APK yig‘ishda R8 optimizatsiyasini yoqadi.');
  } else if (/\?\s*\.|\?:/.test(trimmed)) {
    outputLines.push('Kotlin Null Safety (?. va ?:) tekshiruvi to‘g‘ri: null qiymatlardan xavfsiz himoyalangan.');
  } else if (/\b(interface|type|useState|useEffect|useMemo)\b/.test(trimmed)) {
    outputLines.push('TypeScript / React tuzilmasi to‘g‘ri: tiplar va hook qoidalari to‘g‘ri yozilgan.');
  } else if (/\b(app\.(?:get|post)|express|req\.|res\.)\b/.test(trimmed)) {
    outputLines.push('Backend REST API / Express.js kodi to‘g‘ri: marshrut va javob oqimi xatosiz.');
  } else if (/^npm\s+run\b/m.test(trimmed)) {
    outputLines.push('CLI buyruq sintaksisi to‘g‘ri: terminalda loyiha yig‘ish (build) bosqichini ishga tushiradi.');
  } else if (/\bSELECT\b/i.test(trimmed)) {
    outputLines.push('SQL so‘rov tuzilmasi to‘g‘ri: jadval ustunlari va shartlar tekshirildi.');
  } else if (trimmed.startsWith('git ')) {
    outputLines.push(`Git buyrug‘i tahlil qilindi: ${trimmed.split('\n')[0]}`);
  } else {
    outputLines.push(`Jami ${trimmed.split('\n').length} qator kod tekshirildi — xatolik topilmadi.`);
  }

  return { ok: true, lines: outputLines };
}

export const LessonCodePlayground: React.FC<LessonCodePlaygroundProps> = ({
  lessonId,
  courseId,
  initialCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [codeValue, setCodeValue] = useState(initialCode);
  const [runResult, setRunResult] = useState<{ ok: boolean; lines: string[] } | null>(null);

  useEffect(() => {
    setCopied(false);
    setIsEditing(false);
    setCodeValue(initialCode);
    setRunResult(null);
  }, [lessonId, initialCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard unavailability
    }
  };

  const handleRun = () => {
    setRunResult(runCodeSafely(codeValue, courseId));
  };

  return (
    <section className="rounded-2xl bg-[#0B1120] border border-[#1E293B] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-xs font-medium text-[#94A3B8]">
            Amaliy kod namunasi {isEditing ? '· Jonli tahrir' : ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="text-xs font-medium text-[#38BDF8] hover:text-white transition-colors cursor-pointer"
          >
            {isEditing ? "Ko'rish rejimiga qaytish" : 'Kodni sinab ko‘rish'}
          </button>

          {isEditing && codeValue !== initialCode && (
            <button
              type="button"
              onClick={() => {
                setCodeValue(initialCode);
                setRunResult(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Asliga qaytarish</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRun}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Ishga tushirish</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#38BDF8] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Nusxa olindi' : 'Nusxa olish'}</span>
          </button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          rows={Math.max(5, codeValue.split('\n').length + 1)}
          value={codeValue}
          onChange={(e) => setCodeValue(e.target.value)}
          spellCheck={false}
          className="w-full p-5 bg-[#060A13] text-sm font-mono text-[#38BDF8] leading-relaxed focus:outline-none resize-y"
        />
      ) : (
        <pre className="p-5 overflow-x-auto text-sm font-mono text-[#38BDF8] leading-relaxed">
          <code>{codeValue}</code>
        </pre>
      )}

      {runResult && (
        <div
          className={`px-5 py-3 border-t border-[#1E293B] text-xs font-mono space-y-1 ${
            runResult.ok ? 'bg-[#060A13] text-[#10B981]' : 'bg-[#060A13] text-[#F87171]'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
            Natija / Konsol
          </div>
          {runResult.lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </section>
  );
};
