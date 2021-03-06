<template>
  <div style="overflow:hidden;">
    <header class="d-flex flex-column justify-content-center p-4">
      <h1>Satisfactory Mod Launcher</h1>
      <p>
        {{
          selectedSatisfactoryInstall
            ? "SML Version " + selectedSatisfactoryInstall.smlVersion ||
              "Install a mod to install SML"
            : "Satisfactory is missing, Try reinstalling the game."
        }}
      </p>
    </header>

    <div class="d-flex">
      <!-- Installed mods list -->
      <div
        class="w-100"
        style="height: calc(100vh - 214px); overflow: auto;"
      >
        <table class="d-block">
          <tbody class="d-block w-100">
            <InstalledMods
              v-model="selectedMod"
              :objects="searchMods"
            >
              <template slot-scope="{ item }">
                <tr
                  class="w-100 d-flex flex-row align-items-center"
                  :class="!isModUpdated(item) ? 'outdated' : ''"
                >
                  <td class="p-2">
                    <img
                      :src="item.logo || noImageURL"
                      height="100%"
                      class="rounded"
                      style="height: 75px; width: 75px; object-fit: contain;"
                    >
                  </td>
                  <td class="p-2 w-100">
                    <h6 class="m-0">
                      {{ item.name || "" }}
                      <span
                        class="badge badge-danger mx-1"
                      >{{ !isModUpdated(item) ? 'Outdated' : '' }}</span>
                    </h6>
                    <small>
                      by
                      {{
                        item.authors.map(author => author.user.username).join(", ")
                      }}
                    </small>
                  </td>
                  <td class="p-2 w-25">
                    {{
                      item.versions[0] ? item.versions[0].version : "Unknown"
                    }}
                    <br>
                    <small>
                      {{
                        item.last_version_date
                          ? new Date(item.last_version_date).toLocaleDateString()
                          : ""
                      }}
                    </small>
                  </td>
                  <td class="p-2 w-25 d-flex">
                    <button class="btn btn-normal btn-sm m-1">
                      {{
                        !isModUpdated(item) ? "Disabled" : "Enabled"
                      }}
                    </button>
                    <button class="btn btn-outline-danger btn-sm m-1">
                      X
                    </button>
                  </td>
                </tr>
              </template>
            </InstalledMods>
          </tbody>
        </table>
      </div>

      <!-- Launch button -->
      <div
        class="p-2"
        style="min-width: 400px; max-width: 400px"
      >
        <div class="launch-btn-base d-flex align-items-center justify-content-center">
          <button
            class="launch-btn"
            @click="launchSatisfactory"
          />
        </div>

        <div class="launch-slc-base">
          <select
            v-model="selectedSatisfactoryInstall"
            class="form-control"
          >
            <option
              v-for="install in satisfactoryInstalls"
              :key="install.id"
              :value="install"
            >
              {{ install.displayName }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// TODO: display errors
import semver from 'semver';
import {
  getLatestSMLVersion,
  getInstalls,
  getAvailableMods,
} from 'satisfactory-mod-launcher-api';
import { spawn } from 'child_process';
import InstalledMods from '../InstalledMods/InstalledMods';

export default {
  name: 'Launcher',
  components: {
    InstalledMods,
  },
  data() {
    return {
      selectedSatisfactoryInstall: null,
      satisfactoryInstalls: [],
      availableMods: [],
      installedSMLVersion: '',
      latestSMLVersion: {},
      SMLInProgress: false,
      selectedMod: {},
      searchMods: [],
      search: '',
      inProgress: [],
      modalInstallModVersion: {},
    };
  },
  computed: {
    noImageURL() {
      return 'https://ficsit.app/static/assets/images/no_image.png';
    },
    hasSMLUpdates() {
      return (
        !semver.valid(this.installedSMLVersion)
        || (semver.valid(this.latestSMLVersion.version)
          && semver.lt(this.installedSMLVersion, this.latestSMLVersion.version))
      );
    },
    isSMLInstalled() {
      return !!semver.valid(this.installedSMLVersion);
    },
  },
  watch: {
    search() {
      this.refreshSearch();
    },
  },
  mounted() {
    this.$electron.ipcRenderer.on('openedByUrl', (e, url) => {
      const parsed = new URL(url);
      const command = parsed.pathname.replace(/^\/+|\/+$/g, '');
      if (command === 'install') {
        const modID = parsed.searchParams.get('modID');
        const version = parsed.searchParams.get('version');
        this.selectedMod = this.availableMods.find((mod) => mod.id === modID);
        this.modalInstallModVersion = this.selectedMod.versions.find((ver) => ver.version === version)
          || this.selectedMod.versions[0];
        this.$bvModal.show('modal-install');
      } else if (command === 'uninstall') {
        const modID = parsed.searchParams.get('modID');
        this.selectedMod = this.availableMods.find((mod) => mod.id === modID);
        this.$bvModal.show('modal-uninstall');
      }
    });
  },
  created() {
    Promise.all([
      this.refreshSatisfactoryInstalls(),
      this.refreshAvailableMods(),
      getLatestSMLVersion().then((smlVersion) => {
        this.latestSMLVersion = smlVersion.version;
      }),
    ]).then(() => {
      this.$electron.ipcRenderer.send('vue-ready');
    });
  },
  methods: {
    handleModalInstallOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleModalInstallSubmit();
    },
    handleModalInstallSubmit() {
      this.installMod(this.modalInstallModVersion);
      this.$nextTick(() => {
        this.$bvModal.hide('modal-install');
      });
    },
    handleModalUninstallOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleModalInstallSubmit();
    },
    handleModalUninstallSubmit() {
      this.uninstallMod(
        this.selectedMod.versions.find((ver) => this.isModVersionInstalled(ver)),
      );
      this.$nextTick(() => {
        this.$bvModal.hide('modal-uninstall');
      });
    },
    isModUpdated(mod) {
      return (
        mod.versions.length !== 0
        && semver.satisfies(mod.versions[0].sml_version, '>=2.0.0')
      );
    },
    isVersionSML20Compatible(version) {
      return semver.satisfies(version.sml_version, '>=2.0.0');
    },
    refreshSearch() {
      this.searchMods = this.availableMods.filter((mod) => mod.name.toLowerCase().includes(this.search.toLowerCase()));
    },
    refreshAvailableMods() {
      return getAvailableMods().then((mods) => {
        this.availableMods = mods;
        this.refreshSearch();
      });
    },
    isModVersionInstalled(modVersion) {
      if (modVersion && modVersion.mod_id && modVersion.version) {
        return (
          this.selectedSatisfactoryInstall.mods[modVersion.mod_id]
          === modVersion.version
        );
      }
      return false;
    },
    refreshCurrentMod() {
      const currentModId = this.selectedMod.id;
      this.refreshAvailableMods().then(() => {
        this.selectedMod = this.searchMods.find((mod) => mod.id === currentModId);
      });
    },
    installMod(modVersion) {
      return this.selectedSatisfactoryInstall
        .installMod(modVersion.mod_id, modVersion.version)
        .then(() => {
          this.inProgress.splice(this.inProgress.indexOf(modVersion));
          this.refreshCurrentMod();
        })
        .catch((err) => {
          this.$bvModal.msgBoxOk(err.toString());
          this.inProgress.splice(this.inProgress.indexOf(modVersion));
        });
    },
    uninstallMod(modVersion) {
      return this.selectedSatisfactoryInstall
        .uninstallMod(modVersion.mod_id)
        .then(() => {
          this.inProgress.splice(this.inProgress.indexOf(modVersion));
          this.refreshCurrentMod();
        })
        .catch((err) => {
          this.$bvModal.msgBoxOk(err.toString());
          this.inProgress.splice(this.inProgress.indexOf(modVersion));
        });
    },
    toggleModInstalled(modVersion) {
      this.inProgress.push(modVersion);
      if (this.isModVersionInstalled(modVersion)) {
        this.uninstallMod(modVersion);
      } else {
        this.installMod(modVersion);
      }
    },
    refreshSatisfactoryInstalls() {
      return getInstalls().then((installs) => {
        this.satisfactoryInstalls = installs;
        if (this.satisfactoryInstalls.length > 0) {
          const defaultInstall = this.satisfactoryInstalls[0];
          this.selectedSatisfactoryInstall = defaultInstall;
        }
      });
    },
    launchSatisfactory() {
      if (this.selectedSatisfactoryInstall) {
        spawn(this.selectedSatisfactoryInstall.launchPath, {
          detached: true,
        }).unref();
      }
    },
    updateSML() {
      this.SMLInProgress = true;
      return this.selectedSatisfactoryInstall.updateSML().then(() => {
        this.SMLInProgress = false;
      });
    },
    uninstallSML() {
      this.SMLInProgress = true;
      return this.selectedSatisfactoryInstall.uninstallSML().then(() => {
        this.SMLInProgress = false;
      });
    },
  },
};
</script>

<style>
.launch-btn-base {
  height: 450px;
  background-color: transparent;
  background-image: url(./assats/btn-launch-base.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position-x: 50%;
  border: none;
  position: relative;
}

.launch-btn {
  height: 69%;
  width: 69%;
  background-color: transparent;
  background-image: url(./assats/btn-launch-normal.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position-x: 50%;
  border: none;
  position: relative;
  top: -13%;
  left: 0.5%;
  transition: ease-out 0.25s;
}

.launch-btn:hover {
  background-image: url(./assats/btn-launch-hover.png);
}

.launch-btn:active {
  background-image: url(./assats/btn-launch-pressed.png);
  transition: none;
}

.launch-slc-base {
  height: 150px;
  background-color: transparent;
  background-image: url(./assats/slc-launch-base.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position-x: 50%;
  border: none;
  position: relative;
  padding: 25px 30px;
  margin-top: -20px;
}
</style>
