module.exports = function rowScale() {
  // computed values:
  var perRow, offsetLeft, offsetTop;

  var scale = {
    // user-set values
    _count: 0,
    _item: { width: 0, height: 0 },
    _parent: { width: 0, height: 0 },
    _perRow: 0,
    _padding: { left: 0, top: 0 },
    items: function(count) {
      scale._count = count;
      return scale;
    },
    item: function(obj) {
      scale._item = obj;
      return scale;
    },
    parentWidth: function(width) {
      scale._parent.width = width;
      return scale;
    },
    padding: function(obj) {
      scale._padding = obj;
      return scale;
    },
    top: function(i) {
      update();
      return Math.floor(i / perRow) * offsetTop;
    },
    left: function(i) {
      update();
      return (i % perRow) * offsetLeft;
    },
    height: function() {
      update();
      return (scale._item.height + scale._padding.top) * Math.ceil(scale._count / perRow);
    }
  };
  function update() {
    var pWidth = scale._parent.width,
        iWidth = scale._item.width,
        iHeight = scale._item.height,
        padding = scale._padding;

    perRow = Math.floor(pWidth / (iWidth + 2 * padding.left));
    offsetTop = iHeight + padding.top;
    offsetLeft = Math.floor(scale._parent.width / perRow) + padding.left;
  }
  return scale;
}

