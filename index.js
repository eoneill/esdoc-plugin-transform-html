const minimatch = require('minimatch');
const path = require('path');
const cheerio = require('cheerio');

const config = {};
const defaultOptions = {
  includes: ['**/*']
};
let options;

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
    if (typeof options === 'string' || Array.isArray(options)) {
      options = {
        transforms: options
      };
    }
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
  const fileName = event.data.fileName;

  // only process html files
  if (path.extname(fileName) !== '.html') {
    return;
  }

  // convention method to wrap minimatch for the given file
  function is(...patterns) {
    return patterns.some((pattern) => {
      if (minimatch(fileName, pattern)) {
        return true;
      }
    });
  }

  // create our cheerio instance...
  const $ = cheerio.load(event.data.html);

  // witch each option...
  withOptions((options) => {
    const isIncluded = is(...toArray(options.includes));
    const isExcluded = is(...toArray(options.excludes));
    // if the file is not included or the file is excluded...
    if (!isIncluded || isExcluded) {
      // abort
      return;
    }

    withItems(options.transforms, (script) => {
      try {
        const importPath = path.resolve(process.cwd(), script);
        const transform = require(importPath);

        // invoke our transformer, passing
        transform.call($, {
          options,
          config,
          fileName,
          is,
          $
        });
      } catch(e) {
        if (!options.throwOnError) {
          throw e;
        }
        console.error(`[esdoc-plugin-transform-html] ${script} failed`, e);
      }
    });
  });

  event.data.html = $.html();
}
