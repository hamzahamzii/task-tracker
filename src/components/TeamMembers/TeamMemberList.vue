<template>
  <div :class="$vuetify.breakpoint.xs ? 'mx-2':'mx-8'" class="mt-6 ">
    <v-tabs show-arrows v-model="tabs" color="#2A206A">
      <v-tab @click="teamMember()" href="#active-member">Active</v-tab>
      <v-tab
        :class="getSelectedCompany.role == 'team-manager' ? 'd-none' : ''"
        @click="archivedMember()"
        href="#archieve-member"
        >Archive</v-tab
      >
    </v-tabs>

    <v-tabs-items class="mt-2 transparent" v-model="tabs">
      <v-tab-item value="active-member">
        <ActiveMembers />
      </v-tab-item>

      <v-tab-item value="archieve-member">
        <ArchieveMembers />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import ActiveMembers from "./ActiveMembers";
import ArchieveMembers from "./ArchieveMembers";
export default {
  data() {
    return {
      tabs: null,
      archive: [],
    };
  },

  computed: {
    ...mapGetters(["getSelectedCompany"]),
  },
  components: {
    ActiveMembers,
    ArchieveMembers,
  },
  methods: {
    archivedMember() {
      this.$store.dispatch("fetchArchieveMembers").then((response) => {
        this.archive = response;
      });
    },
    teamMember() {
      this.$store.dispatch("fetchTeamMembers");
    },
  },
};
</script>
