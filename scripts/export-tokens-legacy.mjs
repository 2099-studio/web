import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('tokens/tokens.json');
const outputPath = path.resolve('tokens/tokens.legacy.json');

const GROUP_TYPE_MAP = {
  space: 'spacing',
  radius: 'borderRadius',
  breakpoint: 'sizing',
  layout: 'sizing',
};

const FONT_GROUP_TYPE_MAP = {
  family: 'fontFamilies',
  weight: 'fontWeights',
  size: 'fontSizes',
  'letter-spacing': 'letterSpacing',
};

function stripPx(value) {
  if (typeof value === 'string' && value.endsWith('px')) {
    return value.slice(0, -2);
  }
  return String(value);
}

function toLegacyType(token, pathParts) {
  const dtcgType = token.$type;

  if (pathParts[0] === 'font' && FONT_GROUP_TYPE_MAP[pathParts[1]]) {
    return FONT_GROUP_TYPE_MAP[pathParts[1]];
  }

  if (GROUP_TYPE_MAP[pathParts[0]]) {
    return GROUP_TYPE_MAP[pathParts[0]];
  }

  const map = {
    color: 'color',
    fontFamily: 'fontFamilies',
    fontWeight: 'fontWeights',
    dimension: 'spacing',
    number: 'number',
    duration: 'other',
    cubicBezier: 'other',
    shadow: 'boxShadow',
  };

  return map[dtcgType] ?? 'other';
}

function toLegacyValue(token, legacyType) {
  const value = token.$value;

  if (legacyType === 'boxShadow') {
    return {
      x: stripPx(value.offsetX ?? '0'),
      y: stripPx(value.offsetY ?? '0'),
      blur: stripPx(value.blur ?? '0'),
      spread: stripPx(value.spread ?? '0'),
      color: value.color,
      type: 'dropShadow',
    };
  }

  if (legacyType === 'fontWeights') {
    return String(value);
  }

  if (['spacing', 'borderRadius', 'fontSizes', 'letterSpacing', 'sizing'].includes(legacyType)) {
    return stripPx(value);
  }

  if (legacyType === 'other' && token.$type === 'cubicBezier') {
    return `cubic-bezier(${value.join(', ')})`;
  }

  return value;
}

function walk(node, pathParts, out) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;

  if ('$value' in node && '$type' in node) {
    const legacyType = toLegacyType(node, pathParts);
    const legacy = {
      value: toLegacyValue(node, legacyType),
      type: legacyType,
    };

    if (node.$description) {
      legacy.description = node.$description;
    }

    let cursor = out;
    for (let i = 0; i < pathParts.length - 1; i += 1) {
      const key = pathParts[i];
      cursor[key] ??= {};
      cursor = cursor[key];
    }
    cursor[pathParts[pathParts.length - 1]] = legacy;
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    walk(child, [...pathParts, key], out);
  }
}

function convertSet(setNode) {
  const out = {};
  walk(setNode, [], out);
  return out;
}

const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const legacy = {};

for (const [key, value] of Object.entries(source)) {
  if (key.startsWith('$')) {
    if (key === '$themes') legacy[key] = value;
    continue;
  }
  legacy[key] = convertSet(value);
}

fs.writeFileSync(outputPath, `${JSON.stringify(legacy, null, 2)}\n`, 'utf8');

const countTokens = (node) => {
  if (!node || typeof node !== 'object') return 0;
  if ('value' in node && 'type' in node) return 1;
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .reduce((sum, [, child]) => sum + countTokens(child), 0);
};

const total = Object.entries(legacy)
  .filter(([key]) => !key.startsWith('$'))
  .reduce((sum, [, set]) => sum + countTokens(set), 0);

console.log(`wrote ${outputPath}`);
console.log(`tokens: ${total}`);
console.log(`themes: ${legacy.$themes?.length ?? 0}`);
