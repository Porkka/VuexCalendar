<template>
  <div class="vxc-entry-overview">
    <div class="heading">
        <a href="#" style="position:absolute;padding-left: 10px;font-size: 24px;padding-top: 0;display:block;" @click.prevent="$emit('back')"><i class="fa fa-long-arrow-left"></i></a>
        Näytä tapahtuma
    </div>
    <div class="overview">
      <div class="section">
        <b>{{ entry.title }}</b>
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