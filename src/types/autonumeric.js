// requires - https://github.com/autoNumeric/autoNumeric

module.exports = {
  html (elemId, name, value, meta) {
    return '<input type="text" id="' + elemId + '" value="' + value + '" />';
  },

  valueFunction (elemId, name, value, meta) {
    return function () {
      var el = document.getElementById(elemId);
      var autoEl = AutoNumeric.getAutoNumericElement(el);
      // see different options @ https://github.com/autoNumeric/autoNumeric#methods
      // return autoEl.get();
      // return autoEl.getFormatted();
      // return autoEl.getNumber();
      return autoEl.get();
    }
  },

  postCreateInitFunction (elemId, name, value, meta) {
    return function () {
      var options = meta.options || {};
      new AutoNumeric('#' + elemId, options);
    };
  }
};
