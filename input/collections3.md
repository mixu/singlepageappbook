home: index.html
prev: collections2.html
next: collections4.html
---
# 9. Collections

What's in a collection? A collection:

*   contains items (or models)
*   emits events when items are added/removed
*   is ordered; can be accessed by index via `at()` and by model ID via `get()`

In this chapter, we'll write an observable array, and then add some additional niceties on top of it to make it a collection (e.g. something that is specific to storing models).

## Storing Models and emitting events

Let's start with the constructor. We want to mixin EventEmitter to add support for events for the collection.

```js
function Collection(models) {
  this.reset();
  models && this.add(models);
}
util.inherits(Collection, events.EventEmitter);
```

To support passing a set of initial models, we call this.add() in the constructor.

**Resetting the collection**. Self-explanatory, really. We will use an array to store the models, because collections are ordered rather than indexed; and we will maintain a length property directly for convenience.

```js
Collection.prototype.reset = function() {
  this._items = [];
  this.length = 0;
  this.emit('reset');
};
```

**Adding items**. We should be able to call `add(model)` and emit/listen for an "add" event when the model is added.

```js
Collection.prototype.add = function(model, at) {
  var self = this;
  // multiple add
  if(Array.isArray(model)) {
    return model.forEach(function(m) { self.add(m, at); });
  }
  this._items.splice(at || this._items.length, 0, model);
  this.length = this._items.length;
  this.emit('add', model, this);
};
```

To support calling `add([model1, model2])`, we'll check if the first parameter is an array and make multiple calls in that case.

Other than that, we just use Array.splice to insert the model. The optional `at` param allows us to specify a particular index to add at. Finally, after each add, we emit the "add" event.

**Removing items**. We should be able to call `remove(model)` to remove a model, and receive events when the item is removed. Again, the code is rather trivial.

```js
Collection.prototype.remove = function(model){
  var index = this._items.indexOf(model);
  if (index > -1) {
    this._items.splice(index, 1);
    this.length = this._items.length;
    this.emit('remove', model, this);
  }
};
```

**Retrieving items by index and retrieving all items**. Since we are using an array, this is trivial:

```js
Collection.prototype.at = function(index) { return this._items[index]; };
```

```js
Collection.prototype.all = function() { return this._items; };
```

## Iteration

We also want to make working with the collection easy by supporting a few iteration functions. Since these are already implemented in ES5, we can just call the native function, setting the parameter appropriately using `.apply()`. I'll add support for the big 5 - forEach (each), filter, map, every and some:

```js
['filter', 'forEach', 'every', 'map', 'some'].forEach(function(name) {
  Collection.prototype[name] = function() {
    return Array.prototype[name].apply(this._items, arguments);
  }
});
```

## Sorting

Implementing sorting is easy, all we need is a comparator function.

```js
Collection.prototype.sort = function(comparator) {
  this._items.sort(comparator || this.orderBy);
};
```

[Array.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort) is already implemented in [ES3](http://en.wikipedia.org/wiki/ECMAScript#Dialects) and does what we want: you can pass a custom comparator, or set `collection.orderBy` to set a default sort function.

## Using our observable array

The code above covers the essence of an observable array. Let's look at few usage examples before moving on to a making it a collection.

```js
var items = new Collection();
items.on('add', function(item) {
  console.log('Added', item);
});
setInterval(function() {
  items.add(Math.floor(Math.random() * 100));
  console.log(items.all());
}, 1000);
```

## Creating a collection

A collection is a more specialized form of an observable array. Collections add the ability to hook into the events of the models they contain, and add the ability to retrieve/check for item presence by model id in addition to the position in the array.

**get(modelId)**. Let's implement `get(modelId)` first. In order to make get() fast, we need a supplementary index. To do this, we need to capture the add() and remove() calls:

```js
Collection.prototype.add = function(model, at) {
  var self = this, modelId;
  // ...
  modelId = model.get('id');
  if (typeof modelId != 'undefined') {
    this._byId[modelId] = model;
  }
};

Collection.prototype.remove = function(model){
  var index = this._items.indexOf(model), modelId;
  // ...
  modelId = model.get('id');
  if (typeof modelId != 'undefined') {
    delete this._byId[modelId];
  }
};
```

Now get() can make a simple lookup:

```js
Collection.prototype.get = function(id) { return this._byId[id]; };
```

**Hooking into model events**. We need to bind to the model change event (at least), so that we can trigger a "change" event for the collection:

```js
Collection.prototype._modelChange = function(key, value, oldValue, model) {
  this.emit(key, value, oldValue, model);
};

Collection.prototype.add = function(model, at) {
  // ...
  model.on('change', this._modelChange);
};
```

And we need to unbind when a model is removed, or the collection is reset:

```js
Collection.prototype.remove = function(model){
  // ...
  model.removeListener('change', this._modelChange);
};
Collection.prototype.reset = function() {
  var self = this;
  if(this._items) {
    this._items.forEach(function(model) {
      model.removeListener('change', self._modelChange);
    });
  }
  // ...
};
```
