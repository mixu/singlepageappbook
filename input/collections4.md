home: index.html
prev: collections3.html
next: collections5.html
---
# 10. Implementing a data cache

There are three reasons why we want a data store:

*   To have a central mechanism for saving data.
*   To retrieve cached models quickly.
*   To prevent duplicate instances of the same model being created.

The first two are obvious: we need to handle saving, and when possible, use caching to make unambiguous retrievals fast. The only clearly unambigous type of retrieval is fetching a model by id.

The last reason is less obvious. Why is it bad to have duplicate instance of the same model? Well, first, it is inefficient to have the same data twice; but more importantly, it is very confusing if you can have two instances that represent the same object but are separate objects. For example, if you have a data cache that always returns a new object rather than reusing an existing one, then you can have situations where you change the model data, or add a model data listener, but this change does not actually work as expected because the object you used is a different instance. We'll tackle this after looking at saving and caching.

## Implementing save()

**Serializing models into JSON**. In order to send the model data, we need the ability to transform a model into a string. JSON is the obvious choice for serializing data. We need to add a additional method to the model:

```js
Model.prototype.json = function() {
  return JSON.stringify(this._data);
};
```

**Mapping to the right backend URL**. We also need to know where to save the model:

```js
Model.prototype.url = function(method) {
  return this.prototype.urlRoot +
    (method == 'create' ? '' : encodeURIComponent(this.id));
};
```

There are three kinds of persistence operations (since reads are handled by the data source):

*   "create": PUT /user
*   "update": POST /user/id
*   "delete": DELETE /user/id

When the model doesn't have a id, we will use the "create" endpoint, and when the model does have id, we'll use the "update"/"delete" endpoint. If you set Model.prototype.urlRoot to "http://localhost/user", then you'll get the urls above, or if your URLs are different, you can replace Model.prototype.url with your own function.

**Connecting Model.save() with the DataStore**. Reading is done via the data source, but create, update and delete are done via the data store. For the sake of convenience, let's redirect `Model.save()` to the DataStore:

```js
Model.prototype.save = function(callback) {
  DataStore.save(this, callback);
};
```

And do the same thing for `Model.destroy`:

```js
Model.prototype.destroy = function(callback) {
  DataStore.delete(this, callback);
};
```

Note that we allow the user to pass a callback, which will be called when the backend operation completes.

## Managing the model lifecycle

Since the data store is responsible for caching the model and making sure that duplicate instances do not exist, we need to have a more detailed look at the lifecycle of the model.

**Instantiation**. There are two ways to instantiate a model:

```js
new Model();
```

The cache should do nothing in this case, models that are not saved are not cached.

```js
DataSource.find(conditions, function(model) { ... });
```

Here, the models are fetched from the backend using some conditions. If the conditions are just model IDs, then the data source should check the cache first.

When models are instantiated from data with an ID, they should be registered with the cache.

**Persistence operations: create, update, delete**.

```js
Model.save(); // model.id is not set
```

Once the backend returns the model id, add the model to the data cache, so that it can be found by id.

```js
Model.save(); // model.id is set
```

Add the model to the data cache, so that it can be found by id.

```js
Model.delete();
```

Remove the model from the data cache, and from any collections it may be in.

**Data changes**. When the model ID changes, the cache should be updated to reflect this.

**Reference counting**. If you want an accurate count of the number of models, you must hook into Collection events (e.g. add / remove / reset). I'm not going to do that, because a simpler mechanism -- for example, limiting model instances by age or by number -- achieves the essential benefits without the overhead of counting. When ES6 WeakMaps are more common, it'll be much easier to do something like this.

## Implementing the data store / cache

DataStore.add(), DataStore.has(), DataStore.save(), DataStore.delete(), DataStore.reference().

_The implementation section is still a work in progress, my apologies._
