<template>
  <ul class="tabs titlebar">
    <router-link
      to="/"
      class="tab-item"
      exact-active-class="active"
    >
      <li>Launcher</li>
    </router-link>
    <router-link
      to="/get-mods"
      class="tab-item"
      exact-active-class="active"
    >
      <li>Get Mods</li>
    </router-link>
    <button class="title-btn" />
  </ul>
</template>

<style>
.titlebar {
  background: var(--c-dark);
  -webkit-app-region: drag;
}

.title-btn {
  background-color: var(--c-normal);
  background-image: url(./assats/icon-cross.png);
  background-repeat: no-repeat;
  background-size: 15px 15px;
  background-position: 50% 50%;
  float: right;
  height: 45px;
  width: 100px;
  padding: 0;
  margin-top: -9px;
  border: none;
  -webkit-app-region: no-drag;
}

.tabs {
  border-bottom: solid var(--c-normal) 5px;
  margin: 0;
  padding-top: 8px;
  padding-left: 8px;
  list-style: none;
}

.tab-item {
  background-color: var(--c-sec);
  background-image: url(./assats/icon-tab.png);
  background-repeat: no-repeat;
  background-position: 15px 8px;
  background-size: 20px 20px;
  float: left;
  width: 220px;
  height: 36px;
  padding: 6px;
  padding-left: 45px;
  margin: 0;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

.tabs a,
.title-btn,
.tab-item {
  color: #fff;
  font-size: 12pt;
}

.title-btn:hover,
.tab-item:hover {
  background-color: var(--c-hover);
  color: #fff;
  text-decoration: none;
}

.title-btn:active,
.tab-item:active {
  background-color: var(--c-active);
  color: #fff;
}

.tabs .active {
  background-color: var(--c-normal);
}
</style>
