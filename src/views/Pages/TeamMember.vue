<template>
  <div>
     <TeamMemberList />
  </div>
</template>

<script>

export default {
  name: 'TeamMember',
  components: {
    TeamMemberList :()=> import('@/components/TeamMembers/TeamMemberList')
  }
}
</script>
