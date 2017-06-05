# esdoc-plugin-transform-html

ESDoc plugin to transform generated HTML

## Installation

```sh
npm install --save-dev esdoc-plugin-transform-html
```

## Usage

Add the `esdoc-plugin-transform-html` to your ESDoc config...
```js
{
  ...
  "plugins": [
    {
      "name": "esdoc-plugin-transform-html",
      "option": ...
    }
  ]
}
```

## Options

The `option` property can either be an `Object`...

```js
{
  ...
  "plugins": [
    {
      "name": "esdoc-plugin-transform-html",
      "option": {
        ...
      }
    }
  ]
}
```
or an `Array<Object>`...
```js
{
  ...
  "plugins": [
    {
      "name": "esdoc-plugin-transform-html",
      "option": [
        { ... },
        { ... }
      ]
    }
  ]
}
```

If you provide an `Array`, each option object within that array will be applied sequentially.

### Available Options

| Option | Behavior | Default |
|--------|----------|---------|
| `includes` | An `Array<String>` or `String` of glob patterns to include | `**/*` |
| `excludes` | An `Array<String>` or `String` of glob patterns to exclude |  |
| `scope` | The HTML tag scope (e.g. `title` to match the `<title>...</title>`) |  |
| `prefix` | A `String` to append _before_ the content |  |
| `suffix` | A `String` to append _after_ the content |  |
| `replace` | An `Object` of options to replace content |  |
| `replace.match` | A `String` to match against. By default this will be converted to a `RegExp` |  |
| `replace.with` | A `String` to replace the matched pattern. Note that you can reference captured groups using `$` (e.g. `$1`) |  |
| `replace.regex` | If `false`, `replace.match` will not be converted to a `RegExp` and instead will use a raw `String`. If a `String`, will be passed to `new RegExp()` as the flags. | `gi` (flags) |

## Example

```js
{
  ...
  "plugins": [
    {
      "name": "esdoc-plugin-transform-html",
      "option": [
        // append your config.title to the end of your <title> tag
        {
          "scope": "title", // scope to the <title> tag
          "includes": ["manual/**/*", "index.html"], // apply to all pages under manual/**/* and index.html
          "suffix": " | ${config.title}" // you can reference config properties via `${config.<property>}`
        },
        // strip off the `API Document` added by ESDoc
        {
          "scope": "title",
          "replace": {
            "match": "(.*) API Document",
            "with": "$1"
          }
        },
      ]
    }
  ]
}
```
