const minimatch = require('minimatch');

const config = {};
const defaultOptions = {
  includes: ['**/*']
};
let options;

function minimatchAny(fileName, patterns) {
  return toArray(patterns).some((pattern) => {
    if (minimatch(fileName, pattern)) {
      return true;
    }
  });
}

function toArray(items) {
  // cast to an array if it's not
  if (!Array.isArray(items)) {
    items = items && [].concat(items) || [];
  }
  return items;
}

function withItems(items, callback) {
  toArray(items).forEach(callback);
}

function withOptions(callback) {
  withItems(options, (options) => {
    callback(Object.assign({}, defaultOptions, options));
  });
}

exports.onStart = (event) => {
  // get the options
  options = event.data.option;
};

exports.onHandleConfig = (event) => {
  Object.assign(config, event.data.config);
};

exports.onHandleHTML = (event) => {
  withOptions((options) => {
    const fileName = event.data.fileName;
    // if the file is not included or the file is excluded...
    if(!minimatchAny(fileName, options.includes) || minimatchAny(fileName, options.excludes)) {
      // abort
      return;
    }

    const scope = options.scope;
    const openScope = scope ? `<${scope}[^>]+>` : '';
    const closeScope = scope ? `<\\\/${scope}>` : '';
    const rContent = new RegExp(`(${openScope})(.*)(${closeScope})`, 'mgi');

    event.data.html = event.data.html.replace(rContent, (match, open, content, close) => {
      // add prefix/suffix to content
      content = [
        options.prefix,
        content,
        options.suffix
      ].filter((item) => {
        return !!item; // remove empty items
      }).join('');

      // replacer
      withItems(options.replace, (replace) => {
        const match = (replace.regex !== false) ? new RegExp(replace.match, replace.regex || 'gi') : replace.match;
        content = content.replace(match, replace.with);
      });

      content = content.replace(/\$\{config\.([^\}]+)\}/gi, (match, key) => {
        return config[key];
      });

      return open + content + close;
    });
  });
}
