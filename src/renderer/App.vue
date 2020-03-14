<template>
  <div id="app">
    <TitleBar />
    <router-view class="view" />
  </div>
</template>

<script>
import TitleBar from './components/TitleBar/TitleBar';

export default {
  name: 'SatisfactoryModLauncherGui',
  components: {
    TitleBar,
  },
};
</script>

<style>
:root {
  --c-dark: #3f3f3f;
  --c-light: #eeeeee;
  --c-background: #3f3f3f;
  --c-normal: #575757;
  --c-sec: #787878;
  --c-hover: #cccbcb;
  --c-active: #e79b52;
  --c-text: #fff;
}

.bg-normal {
  background-color: var(--c-normal);
}
.bg-sec {
  background-color: var(--c-sec);
}
.bg-hover {
  background-color: var(--c-hover);
}
.bg-active {
  background-color: var(--c-active);
}

*:focus {
  outline: none !important;
}

@font-face {
  font-family: "Orbitron Black";
  src: url("assets/fonts/orbitron-black.otf") format("otf");
}

@font-face {
  font-family: "Orbitron Light";
  src: url("assets/fonts/orbitron-light.otf") format("otf");
}

@font-face {
  font-family: "Orbitron medium";
  src: url("assets/fonts/orbitron-medium.otf") format("otf");
}

h1 {
  font-family: "Orbitron Black";
}

h2,
h3 {
  font-family: "Orbitron Medium";
}

h4,
h5 {
  font-family: "Orbitron Light";
}

html,
body,
main,
#app {
  flex-flow: column !important;
  display: flex !important;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--c-background);
  color: var(--c-text);
  font-family: "Segoe UI";
}

#app {
  border-bottom: solid var(--c-normal) 15px;
  font-size: 12pt;
}

.view {
  height: 100vh;
  overflow: auto;
  margin: 0;
  padding: 0;
}

header {
  background-color: #fff;
  color: #000;
  padding: 25px;
  border-bottom: solid var(--c-sec) 5px;
}
</style>
