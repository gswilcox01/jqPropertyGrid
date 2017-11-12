module.exports = {
  html (elemId, name, value, meta) {
    return '<input type="text" id="' + elemId + '" />';
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).spectrum('get').toHexString();
    }
  },

  postCreateInitFunction (elemId, name, value, meta) {
    return function () {
      var opts = $.extend({}, meta.options);
      if (typeof value === 'string') {
        opts.color = value;
      }
      $('#' + elemId).spectrum(opts);
    };
  }
};