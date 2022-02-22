<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <AccountSettings/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AccountSettings from "@/components/Settings/accountSettings";
export default {
  name: "CompanySettings",
  components: {
    AccountSettings,
  },
};
</script>
