<template>
  <div>
    <v-card-title class="font-weight-light"> Appareils liés </v-card-title>
    <v-list two-line>
      <v-list-item v-for="{ id, lastUsed, type } in devices" :key="id">
        <v-list-item-content>
          <v-list-item-title style="text-transform: capitalize">
            <v-icon v-if="type === 'desktop'">mdi-laptop</v-icon>
            <v-icon v-else-if="type === 'mobile'">mdi-cellphone</v-icon>
            <v-icon v-else>mdi-help</v-icon>
            {{ type || 'inconnu' }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <span v-if="!currentToken !== id">
              Dernière utilisation: {{ formatDate(lastUsed) }}
            </span>
            <v-chip v-else color="green" x-small>Actuel</v-chip>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon color="red" @click="deleteDevice(id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import type { Device } from '~/ts/types'
import type firebase from 'firebase'
import dayjs from '~/ts/dayjs'

export default Vue.extend({
  data() {
    return {
      currentToken: '',
    }
  },
  computed: {
    ...mapGetters({
      devices: 'auth/getDevices',
    }),
  },
  mounted() {
    if (Notification.permission === 'granted') {
      this.$fire.messaging
        .getToken()
        .then((token) => (this.currentToken = token))
    }
  },
  methods: {
    formatDate(date: firebase.firestore.Timestamp) {
      return dayjs(date.toDate()).format('DD/MM/YYYY à HH:mm')
    },
    async deleteDevice(id: string) {
      const device: Device = this.devices.find((d: Device) => d.id === id) ?? {}
      const isCurrent = device.id === this.currentToken
      const res = await this.$dialog.confirm({
        text: `Voulez-vous délier l'appareil "${device.type ?? 'inconnu'}" ${
          isCurrent ? '(actuel)' : ''
        } ?`,
        title: 'Attention',
        actions: {
          false: {
            text: 'Annuler',
            color: 'error',
          },
          true: {
            text: 'Confirmer',
            color: 'success',
          },
        },
      })

      if (res) {
        try {
          await this.$store.dispatch('auth/removeDeviceToUser', {
            deviceId: id,
          })
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
      }
    },
  },
})
</script>
