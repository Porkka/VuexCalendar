<template>
  <div class="vxc-entry-overview">
    <h3 class="page-heading">Näytä tapahtuma</h3>
    <p>{{ entry.text }}</p>
    <p>{{ entry.from.format('L HH:mm') + ' - ' + entry.to.format('L HH:mm') }}</p>
  </div>
</template>
<script>
export default {

  props: {
    entry: null,
  },

  data() {
    return {
    }
  },

  created() {
  },

  methods: {
  }

}
</script>