<template>
  <div>
    <div :class="{ tool: true, active: active }">
      <a v-for="(v, i) in tools" :key="i" :href="v.id" @click.prevent="() => { v.callback(); }">
        <i :class="v.icon"></i>
        <span>{{v.text}}</span>
        <!--
        <a href="new" @click.prevent="onEntryNewClick"><div><i class="fa fa-plus icon"></i>Uusi</div></a>
        <a href="month" @click.prevent="options.type = 'month'" v-bind:class="[ options.type == 'month' ? 'active' : '' ]"><div><i class="fa fa-calendar icon"></i>Kuukausi</div></a>
        <a href="week" @click.prevent="options.type = 'week'" v-bind:class="[ options.type == 'week' ? 'active' : '' ]"><div><i class="fa fa-calendar icon"></i>Viikko</div></a>
        <a href="day" @click.prevent="options.type = 'day'" v-bind:class="[ options.type == 'day' ? 'active' : '' ]"><div><i class="fa fa-clock-o icon"></i>Päivä</div></a>
        -->
     </a>
    </div>
  </div>
</template>
<style lang="scss">
@import 'styles/_variables.scss';

.tool {
  display: flex;

  a {
    flex-grow: 1;
    padding: 5px;
    line-height: 1;
    color: #FFFFFF;
    text-align: center;

    i {
      display: block;
      margin: 0 auto 5px;
    }
  }

  &.active {
    background-color: darken($primary-color, 20%);
  }
}
</style>
<script>
export default {

  props: {
    tools: Array
  },

  data() {
    return {
        options: {
          type: null
        },
    }
  },

  methods: {

  },

}
</script>