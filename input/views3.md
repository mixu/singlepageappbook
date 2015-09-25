home: index.html
prev: views2.html
---
# 14. Consuming events from the model layer

There are two areas of interest in the chapter, both of which fall under the larger issue of generating and consuming events:

**Re-rendering views in response to data changes**. When data changes, we get a change event from the model layer. In response, we would like to re-render all the views that were affected by the change.

**Communication between views**. Some actions - like the example in Gmail where you change the display density - require that multiple views change in response to the same user event. We need to pick a nice way to represent these changes, and trigger the right changes.

These are both coordination problems. We want to specify that when A happens, B and C should also happen. In essence, we are trying to bridge the gap between concrete DOM events and event handlers spread across multiple views:

```
[Events] < - > [Event handlers / actions]
```

Let's assume that we are trying to implement the following interaction: "when a user selects a message, the top menu should change and the message should appear as selected in the message list view". In this scenario, we are changing a piece of data and asking for that change to be communicated to multiple views.

There are several ways we could do this:

**Directly in the select event handler**. The naive and obvious way would be to write code in the list that explicitly calls the interested parties.

```js
MessageView.onSelect = function() {
  message.setSelected(true);
  list.check(message.id);
  menu.update(message);
  // one call for each other view that cares about this operation
};
```

However, the problem is that this is highly brittle since the views are tightly coupled: the message view knows about the message model, the list view and the menu view.

**Using a mediating controller** One way is to use a mediating controller, which refers to the objects directly. This looks something like this:

```js
MessageView.onSelect = function() {
  controller.selectMessage();
};

Controller.selectMessage = function(message) {
  message.setSelected(true);
  list.check(message.id);
  menu.update(message);
  // one call for each other view that cares about this operation
};
```

Now, instead of views knowing about each other, they only need to know about a controller. Putting the code in a controller centralizes the coordination, but the code is still ugly and fragile: since that code explicitly refers to each view, removing or breaking one view can potentially break the whole re-render. It's still the same code, you just moved it into a different object; this is just as fragile as without a mediating controller (since the controller can't work without both views), though it is a bit more reusable since you can swap the controller.

**Using observables**. Another alternative is to use observables. When someone selects a message, we can reflect that either as a property of the message ("selected") or as part of a collection ("selectedMessages"):

*   **Observable properties**. Selection is reflected as a property on the model. Views subscribe to changes on that particular property and update themselves based on changes to that property.
*   **Observable collections**. Selection is reflected as a collection on the current page, or a property on a controller. Views subscribe to changes on that particular collection or controller property to update themselves.

Here is how this might look as code:

```js
MessageView.onSelect = function() {
  AppModule.FooController.set('currentFoo', this);
  // currentFoo is a observable property
  // each otherView observes it, and performs
  // actions based on change events
};

// init is called when the other view is created
OtherView.init = function() {
  Framework
    .observe('AppModule.FooController.currentFoo')
    .on('change', function(model) {
      OtherView.update(model);
    });
};
```

While the views don't know about each other, they still know about the controller. Furthermore, the properties of the controller become an implicit API between the views. I say implicit, because the controller doesn't know it's being used for this purpose. So instead of having an explicit controller function that knows about the views, you now have a controller property that is the API for making calls between views and for passing state between views. You haven't gotten rid of "views knowing about the controller"; it's just that the views are now also responsible for registering callbacks on the controller properties.

Of course, in the case of one view, another dependent view and one controller this isn't too bad. But the problem is that as the number of views, controllers and interrelationships increase, the number global state properties and dependencies on various pieces of state increases.

**Using global events**. We can also implement this using a global event dispatcher / [event aggregator](http://martinfowler.com/eaaDev/EventAggregator.html). In this case, selection is reflected as an global event. When the user selects a message, a global event is emitted. Views subscribe to the selection event to be notified and can publish messages via the global event emitter instead of knowing about each other.

```js
MessageView.onSelect = function() {
  global.emit('message_selected', this);
};

OtherView.init = function() {
  global.on('message_selected', function(model) {
    message.setSelected(true);
  });
};
```

The global event emitter is the single source of events for the views. Views can register interest in a particular event on the global event emitter, and models can emit events on the global event emitter when they change. Additionally, views can send messages to each other via the global event emitter without having an observable property change.

## Observables and event emitters: two different schemas for specifying interest

Basically, the choice boils down to either having views send message to each other, or having views observe models. These options look different, but fundamentally they are the same thing, just using a different schema.

Observables:

```js
function() { ... }.observe('App.Todos');
```

Event emitters:

```js
Todos.on('change', function() { ... });
```

But really, the only difference is what the schema is. With observables, we specify interest in a change by using the name of the source object in the global scope. With event emitters, we specify interest by the type of the message. Let's look at those two again:

Observables:

```js
global.observe('App.Todos:change', function(model) { /* ... */ });
```

Event emitters:

```js
App.Todos.on('change', function(model) { /* ... */ });
```

Now, with a minor change, the two patterns look a lot more similar. The difference is that in one, the standard way to say we want to be informed about a change is to use the name of source object vs. in the other, we subscribe via the type of the message.

The "views observe models directly" and "models publish to a global EventEmitter" both introduce a level of indirection between model change events and view re-renders. This is good, because it means that there is no code that specifically refers to particular views - if a view is removed or doesn't work, then only it will be affected.

However, these two approaches have different implications.

## Observables vs. event emitters

**Observables** Observables are the way in which markup-driven views (e.g. view systems with a templating system emphasis) implement re-rendering on demand. There are two parts to this system: the name resolution / event attachment system which, given a input like this:

```js
Framework.observe('App.Todos', function() { ... });
```

... will attach the callback function to 'App.Todos' when App.Todos is instantiated (and re-attach the callback function when that object is replaced).

Once the events are attached, the second part of the system needs to determine which views have changed in response to the data change event. This is basically a process of taking the event and matching it against the currently active observers on a global level, and then triggering the observer callbacks where appropriate.

**Global events.** Here, we introduce a single shared eventemitter which acts as a broker for events. Each view expresses interest in a particular set of events by subscribing on the global event emitter. When an event which needs to be handled by multiple views occurs, a global event is emitted. The advantage here is decoupling, since none of the views need to know about each other: they just know about the global eventemitter and how to handle a particular event.

## Three choices: transient, model, and collection events

Whether you pick event emitters or observables, you still are left with the choice between three ways in which user actions can be represented in your app. You can represent an action - like changing the display density or selecting an item - as:

*   A transient event. In this case, there is no property or collection associated with the change. Any views that are subscribed to notifications about the event will have their event handlers triggered.
*   A model change event. Here, the result of the action is that a property on a model changes. This causes change events for that property, which then trigger the event handlers/callbacks for interested models.
*   A collection change event. You might represent the user action as a change on a collection or an observable array. The set of items is changed by the user action, and this triggers interested listeners in the view layer to update their contents. Using a collection makes it easy to find out which model(s) are selected, which is useful in cases (like the selection example).

Observables generally do not support triggering transient events, since they are based on the idea that everything is a property of a model or observable array. While model and observable array changes generally cover most actions, it may be that some actions are best represented as transient events. For example, clicking a user in a list to bring up an edit dialog might be better implemented as a transient event rather than, say, a list click event handler that is tightly coupled to a particular dialog.

With observables, every interaction, event if it is limited to a single activity, will exist as a property on the model or collection (unless the developer goes outside the framework). This is a disadvantage: each interaction adds to the global complexity of models.

With event emitters, you tend to perform the same model/collection binding by having views that are bound to either a collection or a model:

*   Model bound views
*   Collection/observable array bound views

Model-bound views take a single model, and represent it in the DOM. Change events from that view trigger updates in the DOM.

Collection-bound views represent a set of models or data items in a more complex set of markup. They may implement additional functionality that allows them to efficiently render a set of items. For example, updating a row in a table should only update that row, rather than the whole table. This allows the collection-bound view to potentially be more efficient at the cost of requiring the programmer to think about performance more.

### Which one should I pick?

The observables basically make the choice to have the data accessed by its global name (which is used to establish subscriptions).

The global events approach makes the choice of having the data be pushed via a global intermediary; each view only knows about this intermediary and instead of referring to things by their name in the global scope, the event data is received directly with the event.

Observables abstract out the instantiation of the object they refer to, since you can start observing on an object even if it does not exist. However, the same applies to the global event emitter: you can register a event listener for an event even if that event is not triggerable.

Basically, these are equivalent approaches, using different naming schemes. I would prefer a naming scheme that is based on the event type, rather than one that is based on the location of the data in the global scope.

Referring to things by their location in the global scope creates a dependency: that particular variable has to be set in order to receive data. Worse yet, a view that explicitly accesses the state (e.g. via some global name) now depends on that global state (e.g. MyApp.MyModule.currentFoo) to be set up. While this is easy to write, it makes the view progressively harder to test and harder to reuse.
