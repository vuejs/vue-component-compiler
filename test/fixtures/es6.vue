<script lang="es6">
var evens = [2,4,6,8]
var odds = evens.map(v => v + 1)
module.exports = {
  data: function () {
    return odds
  }
}
</script>
