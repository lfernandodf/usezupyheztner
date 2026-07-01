<template>
  <q-item
    clickable
    v-ripple
    :active="routeName == cRouterName"
    active-class="bg-blue-1 text-grey-8 text-bold menu-link-active-item-top"
    @click="navigateToRoute"
    class="houverList"
    :class="{'text-negative text-bolder': color === 'negative'}"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="color === 'negative' ? 'mdi-cellphone-nfc-off' : icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{caption}}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'EssentialLink',
  data () {
    return {
      menuAtivo: 'dashboard'
    }
  },
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    color: {
      type: String,
      default: ''
    },

    routeName: {
      type: String,
      default: 'dashboard'
    },

    icon: {
      type: String,
      default: ''
    }
  },
  computed: {
    cRouterName () {
      return this.$route.name
    }
  },
  methods: {
    navigateToRoute () {
      if (this.routeName === this.cRouterName) {
        return
      }
      const target = this.$router.resolve({ name: this.routeName }).route
      if (target && target.fullPath === this.$route.fullPath) {
        return
      }
      this.$router.push({ name: this.routeName }).catch(() => {})
    }
  }
}
</script>
<style lang="sass">
.menu-link-active-item-top
  border-left: 3px solid rgb(21, 120, 173)
  border-right: 3px solid rgb(21, 120, 173)
  // border-radius: 20px
  border-top-right-radius: 20px
  border-bottom-right-radius: 20px
  position: relative
  height: 100%
</style>
