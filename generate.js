var BookGen = require('./bookgen/generate.js');

var config = {
  output: __dirname + '/output/',

  input: {

    dir: __dirname + '/content/',

    files: //__dirname + '/content/',
      [
        __dirname + '/content/index.html',
        __dirname + '/content/goal.html',
        __dirname + '/content/maintainability1.html',
        __dirname + '/content/maintainability2.html',
        __dirname + '/content/maintainability3.html',
        __dirname + '/content/detail1.html',
        __dirname + '/content/detail2.html',
        __dirname + '/content/collections1.html',
        __dirname + '/content/collections2.html',
        __dirname + '/content/collections3.html',
        __dirname + '/content/collections4.html',
        __dirname + '/content/collections5.html',
        __dirname + '/content/views1.html',
        __dirname + '/content/views2.html',
        __dirname + '/content/views3.html',
//        __dirname + '/content/epilogue.html'
      ],

    index: 'index.html'
  },

  titles: {
    'index.html': 'Single page apps in depth (new free book)',
    'goal.html': '1. Modern web applications: a overview',
    'maintainability1.html': '2. Maintainability depends on modularity: Stop using namespaces!',
    'maintainability2.html': '3. Getting to maintainable',
    'maintainability3.html': '4. Testing',
    'detail1.html': '5. What\'s in a View? A look at the alternatives',
    'detail2.html': '6. The model layer: an overview',
    'collections1.html': '7. Implementing a data source',
    'collections2.html': '8. Implementing a model',
    'collections3.html': '9. Collections',
    'collections4.html': '10. Implementing a data cache',
    'collections5.html': '11. Implementing associations: hasOne, hasMany',
    'views3.html': '12. Views - Templating',
    'views1.html': '13. Views - Behavior',
    'views2.html': '14. Consuming events from the model layer'
  },

  layout: __dirname + '/layouts/default/'

};

BookGen.generate(config);
