<template>
  <div class="mx-4 mt-6">
    <v-tabs show-arrows v-model="tabs" color="#2A206A">
      <v-tab href="#personal-info-tab">Personal Info</v-tab>
      <v-tab
        v-if="getSelectedCompany.role == 'owner'"
        href="#company-info-tab"
        @click="
          $store.dispatch('fetchCountries');
          $store.dispatch('fetchCurrencies');
        "
        >Company Info</v-tab
      >
    </v-tabs>

    <v-tabs-items class="mt-4 transparent" v-model="tabs">
      <!-- Display when Personal Info tab is clicked -->
      <v-tab-item value="personal-info-tab">
        <PersonalSettings />
      </v-tab-item>
      <!-- Display when Company Info tab is clicked -->
      <v-tab-item
        value="company-info-tab"
      >
        <CompanySettings />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import CompanySettings from "@/components/Settings/CompanySettings";
import PersonalSettings from "@/components/Settings/PersonalSettings";
export default {
  data() {
    return {
      tabs: null,
    };
  },
  computed: {
    ...mapGetters(["getSelectedCompany"]),
  },
  components: {
    PersonalSettings,
    CompanySettings,
  },
};
</script>

<style></style>
