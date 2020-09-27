module.exports = function (hljs) {
  return {
    case_insensitive: false,
    keywords: { forEach: 'forEach', else: 'ELSE', if: 'if', variables: 'variables', end: 'END', in: 'in', of: 'of' },
    contains: [
      {
        className: 'string',
        begin: '"',
        end: '"',
      },
      {
        className: 'regexp',
        begin: '\\["',
        end: '"\\]',
      },
      {
        className: 'regexp',
        begin: 'variables\\["',
        end: '"\\]',
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        className: 'regexp',
        begin: 'variables\\["',
        end: '"\\]',
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        className: 'regexEqual',
        begin: ' [~<>=]+',
        end: ' ',
      },
    ],
  }
}
