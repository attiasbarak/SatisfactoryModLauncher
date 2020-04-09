<template>
  <div>
    <header class="d-flex flex-column justify-content-center px-4">
      <h1>AWESOME Mods Repo</h1>
      <input
        v-model="search"
        class="form-control"
        type="text"
        placeholder="Search"
      >
    </header>

    <div class="d-flex flex-row">
      <!-- Mods list -->
      <ModsList
        v-if="searchMods"
        v-model="selectedMod"
        :objects="searchMods"
        :can-select="true"
        style="overflow: auto; height: calc(100vh - 215px); min-width: 300px"
      >
        <template slot-scope="{ item }">
          <img
            :src="item.logo || noImageURL"
            height="100%"
            class="m-0 p-0"
          >
          <h6>
            {{ item.name || "" }}
            <br>
            <small>
              By {{
                item.authors.map(author => author.user.username).join(", ")
              }}
            </small>
          </h6>
          <span
            class="w-100 bg-sec m-2"
            style="height: 1px;"
          />
          <p>{{ item.short_description || "" }}</p>
          <span
            class="w-100 bg-sec m-2 mt-auto"
            style="height: 1px;"
          />
          <button
            class="btn btn-normal btn-block m-1"
            :disabled="!isModUpdated(item)"
          >
            {{
              !isModUpdated(item) ? "Outdated" : "Install"
            }}
          </button>
        </template>
      </ModsList>

      <!-- Detail panel -->
      <div
        v-if="selectedMod != null"
        style="min-width: 500px; height: calc(100vh - 215px); overflow: auto;"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          class="p-4"
          v-html="compiledMarkdownDescription"
        >
          Click on the mod card to view more details.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// TODO: display errors
import semver from 'semver';
import marked from 'marked';
import sanitizeHtml from 'sanitize-html';
import { getAvailableMods } from 'satisfactory-mod-launcher-api';
import ModsList from '../ModsList/ModsList';

export default {
  name: 'Launcher',
  components: {
    ModsList,
  },
  data() {
    return {
      availableMods: [],
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
    compiledMarkdownDescription() {
      return sanitizeHtml(marked(this.selectedMod.full_description || ''));
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
    Promise.all([this.refreshAvailableMods()]).then(() => {
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
.mod-card {
  background-color: var(--c-dark);
  border: solid var(--c-normal) 2px;
  border-radius: 10px;
  height: 350px;
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
  height: 150px;
  width: 150px;
  object-fit: contain;
  border-radius: 25px;
}

.mod-card.selected-mod {
  background-color: var(--c-normal);
}

pre,
code {
  background-color: var(--c-dark) !important;
  color: #fff !important;
}
</style>
