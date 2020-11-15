<template>
  <div class="wrapper">
    <h3>Recent changes</h3>
    <div
      class="transaction recent"
      :class="{ 'current': checkIfCurrent(transaction.id)}"
      v-for="(transaction) in recentChanges"
      :key="transaction.id"
      @click="revertTo(transaction.id)"
    >
      {{ transaction.actionType }}
    </div>
    <div
      class="transaction recent-reverted"
      v-for="(transaction) in lastRevertedTransactions"
      :key="transaction.id"
      @click="unRevertTo(transaction.id)"
    >
      {{ transaction.actionType }}
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { revertTo, unRevertTo } from '@/store/transactions'

@Options({})
export default class Changes extends Vue {
  revertTo(id: string) {
    if (this.checkIfCurrent(id)) return
    revertTo(id)
  }

  unRevertTo(id: string) {
    unRevertTo(id)
  }

  get recentChanges(): Transaction[] {
    return this.$store.getters.recentChanges
  }

  get lastRevertedTransactions(): Transaction[] {
    return this.$store.getters.lastRevertedTransactions
  }

  checkIfCurrent(id: string) {
    return this.recentChanges.last().id === id
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
  display: flex;
  width: 100%;
  flex-flow: column;
}

.transaction {
  font-size: 14px;
  border: 1px solid;
  padding: 2px 0;

  &:not(:last-child) {
    border-bottom: none;
  }

  &:not(.current):hover {
    cursor: pointer;
    background: rgba(160,160,160);
    color: white;
    border-color: black;
  }

  &.recent.current {
    background: rgba(40,40,40);
    color: white;
  }

  &.recent-reverted {
    color: rgba(140,140,140);
  }
}

</style>
