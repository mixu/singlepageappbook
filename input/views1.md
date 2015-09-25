home: index.html
prev: collections5.html
next: views2.html
---
# 12. Views - Templating

## What's in a template?

I would classify templating systems not based on their input, but based on their output:

*   as simple functions
*   as functions and metadata
*   as objects with lifecycles

The simplest systems make string interpolation and array iteration more convenient. More complicated ones generate metadata that can be used as an input for other systems.

**The simplest templating system**

A template is the part of the view object that is responsible for generating HTML from input data. In other words, a template is a function which takes a single argument: base (context) and returns a string of HTML.

```js
function itemTemplate(base) {
  return [
    '<li>',
      '<div class="todo', (base.done ? ' done' : ''), '">', base.text, '</div>',
    '</li>'
  ].join('');
}
```

Of course, writing templates with this syntax is generally not preferred. Instead, templating libraries are used in order to get the best of both worlds: the nicest possible template definition syntax, and the performance of using native JS operations. Templating syntax should have no performance impact - you should always precompile your templates into their optimal JS equivalents.

**The optimal output for simple templates**

In theory, unless a templating library does something extremely unusual, all of the templating libraries should have similar performance: after all, they only perform string interpolation on an input and ought to compile to similar compiled JS output.

Sadly, in the real world very few templating languages actually compile to the optimal markup. Have a look at the results from [this benchmark](http://jsperf.com/dom-vs-innerhtml-based-templating/112):


<table class="table">
  <tr>
    <td>Resig Micro-templating:</td><td>3,813,204</td><td>(3813 templates per ms; 61,008 in 16ms)</td>
  </tr>
  <tr>
    <td>Underscore.js template:</td><td>76,012</td><td>(76 templates per ms; 1216 in 16ms)</td>
  </tr>
  <tr>
    <td>Handlebars.js:</td><td>45,953</td><td>(46 templates per ms; 736 in 16ms)</td>
  </tr>
  <tr>
    <td>ejs:</td><td>14,927</td><td>(15 templates per ms; 240 in 16ms)</td>
  </tr>
</table>


I'm not discussing the causes here, because even with the slowest templating engine, the rendering itself doesn't have a significant impact in terms of total time (since even the slowest engines can cope with hundreds of template renders per 16 ms). In other words - despite large differences (up to two orders of magnitude) in microbenchmarks - generating HTML from a compiled template is unlikely to be a bottleneck no matter how slow it is, except on mobile browsers.

**Outputting metadata / objects with lifecycles**

As I noted in the overview chapter for the view layer, the key difference between view layer implementations is their update granularity: whether views are redrawn as a whole (view-granular) or can be rendered at element-granularity or string-granularity.

View-granular systems can just use the simple output where a compiled template is represented as a function that takes a set of data and returns a string. Element-granular and string-granular view layers need more metadata, because they need to convert the bindings into code that keeps track of and updates the right parts of the view.

Hence, element-granular and string-granular rendering requires a templating system that outputs objects / metadata in addition to strings. Notice that this doesn't generally affect what features are supported in the templating language: it just affects how granular the updates are and the syntax for defining things like event handlers.

## Templating language features

Let's have a look at some common templating language features. Sadly, I don't have the time right now to write a templating system - as cool and fun that would be, I'm pretty sure it would be a low payoff in terms of writing a book.

**String interpolation** allows us to insert values into HTML. Dependending on the update granularity, the tokens can be updated either only by re-rendering the whole view, or a single element, or by updating the content of the element with string-granular updates.

```html
<div>
   Hello {{ name }}!
</div>
```

**Escaping HTML**. It is generally a bad practice not to escape the values inserted into HTML, since this might allow malicious users to inject Javascript into your application that would then run with the privileges of whomever is using the application. Most templating libraries default to escaping HTML. For example, mustache uses `{{name}}` for escaped HTML and `{{{name}}}` ("triple mustache") for unescaped strings.

**Simple expressions**. Expressions are code within a template. Many templating libraries support either a few fixed expressions / conditions, or allow for almost any JS code to be used as an expression.

```html
 <li><div class="todo {{ done? }}">{{ text }}</div></li>
```

I don't have a strong opinion about logic-in-views vs. logicless views + helpers. In the end, if you need logic in your views, you will need to write it somewhere. Intricate logic in views is a bad idea, but so is having a gazillion helpers. Finding the right balance depends on the use case.

Generally, templating engines support `{{if expr}}` and `{{else}}`for checking whether a value is set to a truthy value. If the templating library doesn't support logic in views, then it usually supports helpers, which are external functions that can be called from the template and contain the logic that would otherwise be in the template.

**Displaying a list of items.** There are basically two ways, and they correspond to how sets of items are represented in the model layer.

The first option corresponds to observable arrays: you use an expression like `each` to iterate over the items in the observable array:

```html
{{view App.TodoList}}
<ul>
  {{each todos}}
    {{view App.TodoView}}
     <li><div class="todo {{ done? }}">{{ text }}</div></li>
    {{/view}}
  {{/each}}
</ul>
{{/view}}
```

The second option corresponds with collections of models, where the view is bound to a collection and has additional logic for rendering the items. This might look something like this:

```html
{{collectionview App.TodoList tag=ul collection=Todos}}
   <li><div class="todo {{ done? }}">{{ text }}</div></li>
{{/collectionview}}
```

Observable arrays lead to less sophisticated list rendering behavior. This is because `each` is not really aware of the context in which it is operating. Collection views are aware of the use case (since they are components written for that specific view) and can hence optimize better for the specific use case and markup.

For example, imagine a chat message list of 1000 items that is only updated by appending new messages to it. An observable array representing a list of messages that contains a thousand items that are rendered using a `each` iterator will render each item into the DOM. A collection view might add restrictions about the number of items rendered (e.g. only showing the most recent, or implementing incremental rendering by only rendering the visible messages in the DOM). The observable array also needs to keep track of every message, since there is no way of telling it that the messages, once rendered, will never be updated. A collection view can have custom rendering logic that optimizes the renderer based on this knowledge.

If we choose the "each" route for collections, then optimizing rendering performance becomes harder, because the mechanism most frameworks provide is based on rendering every item and tracking every item. Collection views can be optimized more, at the cost of manually writing code.

### Nested view definition

Templating libraries usually only support defining one template at a time, since they do not have an opinion about how templates are used in the view layer. However, if the output from your templating system is a set of views (objects / metadata) rather than a set of templates (functions that take data arguments), then you can add support for nested view definition.

For example, defining a UserInfo view that contains a UserContact and UserPermissions view, both of which are defined inside the App.UserInfo view:

```html
{{view App.UserInfo}}
<ul>
  <li>User information</li>
  {{view App.UserContact}}
    ...
  {{/view}}
  {{view App.UserPermissions}}
    ...
  {{/view}}
</ul>
{{/view}}
```

This means that the output from compiling the above markup to object/metadata info should yield three views: UserInfo, UserContact and UserPermissions. Nested view definition is linked directly with the ability to instantiate and render a hierarchy of views from the resulting object; in the case above, the UserInfo view needs to know how to instantiate and render UserContact and UserPermissions in order to draw itself.

In order to implement this, we need several things:

*   A template parser that outputs objects/metadata
*   A view layer that is capable of rendering child views from templates
*   Optionally, the ability to only render the updated views in the hierarchy

The first two are obvious: given markup like the one in the example, we want to return objects for each view. Additionally, views that contain other views have to store a reference to those views so that they can instantiate them when they are drawing themselves.

What about the ability to only render the updated views in the hierarchy? Well, imagine a scenario where you need to re-render a top-level view that contains other views. If you want to avoid re-rendering all of the HTML, then you have two choices:

*   Write the render() function yourself, so that it calls the nested render() functions only when relevant
*   After the initial render, only perform direct updates (e.g. via element-granular or string-granular bindings)

The first option is simpler from a framework perspective, but requires that you handle calls to render() yourself. This is just coordination, so not much to discuss here.

The second option relies on adding metadata about which pieces of data are used in the views, so that when a model data change occurs, the right views/bound elements can be updated. Let's have a look at how this might be done next.

### Adding metadata to enable granular (re)-rendering

The basic idea here is to take one set of strings (the names/paths to the model data in the global scope), and translate them into subscriptions on model changes (e.g. callbacks that do the right thing). For example, given this templating input:

```html
{{view}}
   Hello {{ window.App.currentUser.name }}!
{{/view}}
```

... the output should be a view object, a template and a event subscription that updates the piece of the DOM represented by the `{{window.App.currentUser.name}}` token. References to items can be considered to be dependencies: when a observed value changes, then the element related to it should change. They might result in a subscription being established like this:

```js
Framework
  .observe('window.App.currentUser.name')
  .on('change', function(model) {
    $('#$1').update(model);
  });
```

Where `$('#$1')` is an expression which selects the part to update. I am glossing over the implementation of the DOM selection for the piece of DOM. One way that might be done - in the case of a element-granular view layer - would be to create a templating function that wraps those updateable tokens with a span tag and assigns sequential ID numbers to them:

```js
<div id="$0">
   Hello <span id="$1">Foo</span>!
</div>
```

The id attributes would need to be generated on demand when the view is rendered, so that the code that subscribes to the change can then refer to the updateable part of the string by its ID. For string-granular updates, the same would be achieved by using `<script>` tags, as discussed in the overview chapter for the view layer.

To avoid having to type the fully qualified name of the model data that we want to bind to, views can add a default scope in the context of their bindings:

```html
{{view scope="window.App.currentUser"}}
   Hello {{ name }}!
{{/view}}
```

This addition makes the subscription strings less verbose.

This is the gist of granular re-rendering. There are additional things to consider, such as registering and unregistering the listeners during the view life cycle (e.g. when the view is active, it should be subscribed; when it is removed, it should be unsubscribed). Additionally, in some cases there is an expression that needs to be evaluated when the observed value changes. These are left as an exercise to the reader, at least until I have more time to think about them.
