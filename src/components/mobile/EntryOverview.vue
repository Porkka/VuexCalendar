<template>
  <div class="vxc-entry-overview">
    <div class="heading">
        <a href="#" style="position:absolute;padding-left: 10px;padding-top: 3px;display:block;" @click.prevent="$emit('back')"><i class="fa fa-arrow-left"></i></a>
        Näytä tapahtuma
    </div>
    <div class="overview">
      <div class="section">
        <b>{{ entry.text }}</b>
      </div>
      <div class="section">
        <p>{{ entry.from.format('L HH:mm') + ' - ' + entry.to.format('L HH:mm') }}</p>
      </div>
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