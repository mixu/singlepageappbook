home: index.html
prev: maintainability1.html
next: maintainability3.html
---
# 3.Getting to maintainable

In this chapter, I'll look at how the ideas introduced in the previous chapter can be applied to real-world code, both new and legacy. I'll also talk about distributing code by setting up a private NPM server.

Let's start with a some big-picture principles, then talk about legacy - and finally some special considerations for new code. Today's new code is tomorrow's legacy code, so try to avoid falling into bad habits.

## Big picture

**Use a build system and a module convention that supports granular privacy**. Namespaces suck, because they don't let you hide things that are internal to a package within that package. Build systems that don't support this force you to write bad code.

**Independent packages/modules**. Keep different parts of an app separate: avoid global names and variables, make each part independently instantiable and testable.

**Do not intermingle state and definition**. You should be able to load a module without causing any side-effects. Isolate code that creates state (instances / variables) in one place, and keep it tiny.

**Small external surface**. Keep the publicly accessible API small and clearly indicated, as this allows you refactor and reach better implementations.

### Extracting modules/packages from your architecture

First, do a basic code quality pass and eliminate the bad practices outlined in the previous chapter.

Then, start moving your files towards using the CommonJS pattern: explicit `require()`s and only a single export per file.

Next, have a look at your architecture. Try to separate that hairball of code into distinct packages:

Models and other reusable code (shared views/visual components) probably belong in a common package. This is the core of your application on which the rest of the application builds. Treat this like a 3rd party library in the sense that it is a separate package that you need to `require()` in your other modules. Try to keep the common package stateless. Other packages instantiate things based on it, but the common package doesn't have stateful code itself.

Beyond your core/common package, what are the smallest pieces that make sense? There is probably one for each "primary" activity in your application. To speed up loading your app, you want to make each activity a package that can be loaded independently after the common package has loaded (so that the initial loading time of the application does not increase as the number of packages increases). If your setup is complex, you probably want a single mechanism that takes care of calling the right initializer.

Isolate the state initialization/instantiation code in each package by moving it into one place: the `index.js` for that particular package (or, if there is a lot of setup, in a separate file - but in one place only). "I hate state, and want as little as possible of it in my code". Export a single function `initialize()` that accepts setup parameters and sets up the whole module. This allows you to load a package without altering the global state. Each package is like a "mini-app": it should hide its details (non-reusable views, behavior and models).

Rethink your inheritance chains. Classes are a terrible substitute for a use-oriented API in most cases. Extending a class requires that you understand and often depend on the implementation details. APIs consisting of simple functions are superior, so if you can, write an API. The API often looks like a state manipulation library (e.g. add an invite, remove an invite etc.); when instantiated with the related views and the views will generally hook into that API.

Stop inheriting views from each other. Inheritance is mostly inappropriate for views. Sure, inherit from your framework, but don't build elaborate hierarchies for views. Views aren't supposed to have a lot of code in the first place; defining view hierarchies is mostly just done out of bad habit. Inheritance has its uses, but those are fewer and further apart than you think.

Almost every view in your app should be instantiable without depending on any other view. You should identify views that you want to reuse, and move those into a global app-specific module. If the views are not intended to be reused, then they should not be exposed outside of the activity. Reusable views should ideally be documented in an interactive catalog, like Twitter's Bootstrap.

Extract persistent services. These are things that are active globally and maintain state across different activities. For example, a real-time backend and a data cache. But also other user state that is expected to persist across activities, like a list of opened items (e.g. if your app implements tabs within the application).

### Refactoring an existing module

Given an existing module,

1\. Make sure each file defines and exports one thing. If you define a Account and a related Settings object, put those into two different files.

2\. Do not directly/implicitly add variables under `window.*`. Instead, always assign your export to `module.exports`. This makes it possible for other modules to use your module without the module being globally accessible under a particular name/namespace.

3\. Stop referring to other modules through a global name. Use `var $ = require('jquery')`, for example, to specify that your module depends on jQuery. If your module requires another local module, require it using the path: `var User = require('./model/user.js')`.

4\. Delay concrete instatiation as long as possible by extracting module state setup into a single bootstrap file/function. Defining a module should be separate from running the module. This allows small parts of the system to be tested independently since you can now require your module without running it.

For example, where you previously used to define a class and then immediately assign a instance of that class onto a global variable/namespace in the same file; you should move the instantatiation to a separate bootstrap file/function.

5\. If you have submodules (e.g. chat uses backend_service), do not directly expose them to the layer above. Initializing the submodule should be the task of the layer directly above it (and not two layers above it). Configuration can go from a top level initialize() function to initialize() functions in submodules, but keep the submodules of modules out of reach from higher layers.

6\. Try to minimize your external surface area.

7\. Write package-local tests. Each package should be have unit and integration tests which can be run independently of other packages (other than 3rd party libraries and the common package).

8\. Start using npm with semantic versioning for distributing dependencies. Npm makes it easy to distribute and use small modules of Javascript.

## Guidelines for new projects

Start with the package.json file.

Add a single bootstrap function. Loading modules should not have side-effects.

Write tests before functionality.

**Hide implementation details**. Each module should be isolated into its own scope; modules expose a limited public interface and not their implementation details.

Minimize your exports. Small surface area.

**Localize dependencies.** Modules that are related to each other should be able to work together, while modules that are not related/far from each other should not be able to access each other.

## Tooling: npm

Finally, let's talk about distribution. As your projects grow in scope and in modularity, you'll want to be able to load packages from different repositories easily. [npm](http://npmjs.org/) is an awesome tool for creating and distributing small JS modules. If you haven't used it before, Google for a tutorial or [read the docs](http://npmjs.org/doc/), or check out [Nodejitsu's npm cheatsheet](http://blog.nodejitsu.com/npm-cheatsheet). Creating a npm package is simply a matter of following the CommonJS conventions and adding a bit of metadata via a `package.json` file. Here is an example `package.json`

```js
{ "name": "modulename",
  "description": "Foo for bar",
  "version": "0.0.1",
  "dependencies": {
    "underscore": "1.1.x",
    "foo": "git+ssh://git@github.com:mixu/foo.git#0.4.1"
  }
}
```

This package can then be installed with all of its dependencies by running `npm install`. To increment the module version, just run `npm version patch` (or "minor" or "major").

You can publish your package to npm with one command (but do RTFM before you do so). If you need to keep your code private, you can use `git+ssh://user@host:project.git#tag-sha-or-branch` to specify dependencies as shown above.

If your packages can be public and reusable by other people, then the public npm registry works. The drawback to using private packages via git is that you don't get the benefits semantic versioning. You can refer to a particular branch or commit sha, but this is less than ideal. If you update your module, then you need to go and bump up the tag or branch in both the project and in its dependencies. This isn't too bad, but ideally, we'd be able to say:

```js
{
  "dependencies": { "foo": ">1.x.x" }
}
```

which will automatically select the latest release within the specified major release version.

Right now, your best bet is to [install a local version npm](https://github.com/isaacs/npmjs.org) if you want to work with semantic version numbers rather than git tags or branches. This involves some CouchDB setup. If you need a read-only cache (which is very useful for speeding up/improving reliability of large simultaneous deploys), have a look at [npm_lazy](https://github.com/mixu/npm_lazy); it uses static files instead of CouchDB for simpler setup. I am working on a private npm server that's easier to set up, but haven't quite gotten it completed due to writing this book. But once it's done, I'll update this section.
