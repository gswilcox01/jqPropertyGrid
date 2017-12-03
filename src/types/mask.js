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
      return function () {
        $('#' + elemId).mask(opts.mask, opts);
      };
    } else {
      console.error('$.fn.mask is NOT a function!')
      return null;
    }
  }
};
