<template>
  <div class="vxc-entry-overview">
    <div class="heading">
        <a href="#" style="position:absolute;padding-left: 10px;font-size: 24px;padding-top: 0;display:block;" @click.prevent="$emit('back')"><i class="fa fa-long-arrow-left"></i></a>
        Näytä tapahtuma
    </div>
    <div class="overview">
      <div v-if="!editing">
        <div class="section">
          <b>{{ entry.title }}</b>
        </div>
        <div class="section">
          <p>{{ entry.from.format('L HH:mm') + ' - ' + entry.to.format('L HH:mm') }}</p>
        </div>
      </div>
      <form action="/save/entry" v-if="editing" @submit.prevent="saveEntry">
        <div class="field">
          <label class="label">Merkinnän nimi</label>
          <div class="control">
            <input type="text" class="input" placeholder="Nimi" name="title" v-model="entry.title" required>
          </div>
        </div>
        <div class="field">
          <label class="label">Merkinnän alkamisajankohta</label>
          <p class="control has-icons-left has-icons-right">
            <input type="text" class="input" v-model="entry.start" placeholder="Alkamisajankohta" required>
            <span class="icon is-small is-left">
              <i class="fa fa-calendar"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <label class="label">Merkinnän päättymisajankohta</label>
          <p class="control has-icons-left has-icons-right">
            <input type="text" class="input" v-model="entry.end" placeholder="Päättymisajankohta" required>
            <span class="icon is-small is-left">
              <i class="fa fa-calendar"></i>
            </span>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
export default {

  props: {
    entry: null,
    editing: false,
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