module.exports = {
  html (elemId, name, value, meta) {
    return '<input type="text" id="' + elemId + '" value="' + value + '" />';
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      return $('#' + elemId).val();
    }
  },

  postCreateInitFunction (elemId, name, value, meta) {
    if (typeof $.fn.mask === 'function') {
      var opts = $.extend({}, meta.options);

      // if not defined, default to autoclear
      if (typeof opts.autoclear === 'undefined') {
        opts.autoclear = false;
      }
      return function () {
        $('#' + elemId).mask(opts.mask, opts);
      };
    } else {
      console.error('$.fn.mask is NOT a function!')
      return null;
    }
  }
};
