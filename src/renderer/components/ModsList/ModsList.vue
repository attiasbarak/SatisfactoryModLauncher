<template>
  <div
    class="w-100 h-100 d-flex flex-row flex-wrap"
  >
    <slot
      v-for="item in objects"
      :item="item"
    />
  </div>
</template>

<script>
import arrayEqual from 'array-equal';

export default {
  name: 'List',
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
      default: false,
    },
  },
  data() {
    return {
      selectedIndex: 0,
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

<style scoped>
.mod-card {
  background-color: var(--c-dark);
  border: solid var(--c-normal) 2px;
  border-radius: 10px;
  height: 400px;
  width: 250px;
  position: relative;
  padding: 15px;
  padding-top: 85px;
  margin: 15px;
  margin-top: 90px;
  box-shadow: #00000050 2px 2px 5px;
}

.mod-card img {
  margin-top: -50px;
  position: absolute;
  top: -75px;
  left: calc(50%-50px);
}
</style>
