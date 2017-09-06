<template>
  <div class="vxc-entry-overview">
    <div class="heading">Näytä tapahtuma</div>
    <div class="overview">
      <p>{{ entry.text }}</p>
      <p>{{ entry.from.format('L HH:mm') + ' - ' + entry.to.format('L HH:mm') }}</p>
    </div>
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