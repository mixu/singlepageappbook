home: index.html
prev: collections4.html
next: views1.html
---
# 11. Implementing associations: hasOne, hasMany

**Defining associations**. Associations / relationships are sugar on top of the basic data source implementation. The idea is that you can predefine the associations between models, for example, that a post hasMany comments. This might be described as:

```js
function Post(args) {
  Model.apply(this, args);
  this.definition = {
    tags: Tags,
    comments: Comments
    };
}
```

We can fetch stuff manually without assocation support. For example, assume that posts.comment_ids is an array of ids:

```js
db.tag(post.comment_ids, function(tags) {
  tags.forEach(function(tag)) {
    // ...
  });
});
```

But given several levels of nesting (post has comment has author), this gets old pretty fast.

It's the age-old problem of dealing with callbacks - which turns out to be pretty trivial once you add a couple of [control flow patterns](http://book.mixu.net/ch7.html) to your repertoire. The fundamental ones are "series", "parallel" and "parallel but with limited concurrency". If you are unfamiliar with those, go read [Chapter 7 - Control Flow of my previous book](http://book.mixu.net/ch7.html).

**Don't pretend to have a blocking API**. Some frameworks have taken the approach that they pretend to provide a blocking API by returning a placeholder object. For example:

```js
var comments = post.get('comments');
// we do not have the data for comments,
// but we'll return a placeholder object for it
```

This is a very, very leaky abstraction. It just introduces complexity without really solving the issue, which is that you have to wait for the database to return results. I'd much rather allow the user to set a callback that gets called when the data has arrived; with a little bit of control flow you can easily ensure that the data is loaded - or build a higher level mechanism like we will be doing.

APIs that _appear_ not to incur the cost of IO but actually do are the leakiest of abstractions ([Mikeal Rogers](http://www.mikealrogers.com/posts/the-way-of-node.html)). I'd much rather opt for the simple callback, since that allows me to explictly say that a piece of code should run only when the required data has arrived.

## Building a nicer API for fetching associated records

Now, I don't want to do this either:

```js
post.get('tags', function(tags) {
  post.get('comments').each(function(comment) {
    comment.get('author', function(comments) {
      // ...
    });
  });
});
```

Instead, I think the right pattern ([as advocated in my previous book](http://book.mixu.net/ch7.html)) is to tell the system what I want and pass a single callback that will run when the data is loaded:

```js
post.with(['tags', 'comments.author'], function(post) {
  // post.tags; post.comments and post.comments[0..n].author should now be loaded
});
```

Basically, you tell the API what you want as the input, and give it a callback to run when it has done your bidding.

**Implementation**. How can we build this? It is basically an API that takes a bunch of paths, looks up the metadata, makes data source calls to fetch by ID, and stores the data on the model, and then calls the continuation callback.

_The implementation section is still a work in progress, my apologies._
