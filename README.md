# esdoc-plugin-transform-html

ESDoc plugin to transform generated HTML using the [`Cheerio`](https://cheerio.js.org/) API.

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

The `option` property can either be an `Object`, `String`, or `Array<String|Object>`...

The simplest use case is to pass a `String`:

```js
{
  ...
  "plugins": [
    {
      "name": "esdoc-plugin-transform-html",
      "option": "./path/to/transform.js"
    }
  ]
}
```

Where `./path/to/transform.js` is a path (relative to `process.cwd()`) to a javascript module to load.

This javascript module should export a single function. This function will be used to transform the HTML. See the example below.

Optionally, you can pass an array of javascript modules to load:

```js
{
    {
      "name": "esdoc-plugin-transform-html",
      "option": ["./path/to/transform1.js", "./path/to/transform2.js"]
    }
}
```

For more flexibility, you can pass an `Object` or `Array<Object>`:

```js
{
  ...
  "plugins": [
    {
      "name": "esdoc-plugin-transform-html",
      "option": [
        {
          "includes": "manual/**/*",
          "excludes": "foo.html",
          "transforms": ["./path/to/transform1.js", "./path/to/transform2.js"]
        },
        {
          "includes": ["some/glob/**/*", "another/glob/*"],
          "excludes": "foo.html",
          "transforms": "./path/to/anotherTransform.js",
          "throwOnError" false
        },
      ]
    }
  ]
}
```

If you provide an `Array`, each option object within that array will be applied sequentially.

### Available Options

| Option | Behavior | Default |
|--------|----------|---------|
| `includes` | An `Array<String>` or `String` of glob patterns to include. | `**/*` |
| `excludes` | An `Array<String>` or `String` of glob patterns to exclude. |  |
| `transforms` | An `Array<String>` or `String` of relative paths to javascript modules to load. |  |
| `throwOnError` | If `true`, will raise any exceptions thrown by the transformer. If `false`, the exception is only logged. | `true` |

## Example Transformer

```js
/**
 * transform function invoked by esdoc-plugin-transform-html
 * @param {Object} args
 * @param {String} args.$ - the Cheerio instance
 * @param {Object} args.config - the global esdoc config
 * @param {Object} args.options - the current options object
 * @param {String} args.fileName - the current file being processed
 * @param {String} args.is - a convenience to check if the current fileName matches a glob pattern
 * @this {Cheerio} the Cheerio instance (interchangeable with args.$)
 */
module.exports = function transform({ $, config, options, fileName, is }) {
  // Cheerio's interface is much like jQuery's
  // See https://cheerio.js.org/ for more details
  // we could also use `$('title')` here, if for example this function was bound to another context, or you prefer that syntax
  const $title = this('title');

  // get the title but strip off everything after `|`
  let title = $title.text().replace(/\s+\|.*/, '');

  // use the h1 for the title on manual and index pages
  if (is('manual/**/*', 'index.html')) {
    title = this('h1').text() || title;
  }

  // replace `Index` with `SDK References` on the `indentifiers` page
  if (is('identifiers.html')) {
    title = title.replace(/^Index/, 'SDK References');
  }

  // append the `config.title`
  title += ` | ${config.title}`;

  // update the title
  $title.text(title);

  // open all external links in a new tab
  this([
    'a[href^="http://"]',
    'a[href^="https://"]',
    'a[href^="//"]',
    'a[href][ref*="external"]'
  ].join(',')).attr('target', '_blank');
};
```
