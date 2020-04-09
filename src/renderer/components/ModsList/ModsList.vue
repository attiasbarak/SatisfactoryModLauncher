<template>
  <div class="flex-fill d-flex flex-wrap flex-row m-0 py-4">
    <div
      v-for="item in objects"
      :key="item.id"
      class="mod-card d-flex flex-column align-items-center flex-fill text-center"
      :class="item == value && canSelect ? 'selected-mod' : ''"
      @click="clicked(item)"
    >
      <slot :item="item" />
    </div>
  </div>
</template>

<script>
import arrayEqual from 'array-equal';

export default {
  name: 'ModsList',
  props: {
    objects: {
      type: Array,
      required: true,
    },
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    canSelect: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selectedIndex: -1,
    };
  },
  watch: {
    objects(newObjects, oldObjects) {
      if (this.canSelect && !arrayEqual(newObjects, oldObjects)) {
        if (this.objects.length > 0) {
          this.clicked(
            this.objects[
              Math.min(Math.max(this.selectedIndex, 0), this.objects.length - 1)
            ],
          );
        } else {
          this.clicked(null);
        }
      }
    },
  },
  created() {},
  methods: {
    clicked(item) {
      if (this.canSelect) {
        this.selectedIndex = this.objects.indexOf(item);
        this.$emit('input', item);
      }
    },
  },
};
</script>

<style>
</style>
