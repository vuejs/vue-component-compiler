"use strict";

var evens = [2, 4, 6, 8];
var odds = evens.map(function (v) {
  return v + 1;
});
module.exports = {
  data: function data() {
    return odds;
  }
};
